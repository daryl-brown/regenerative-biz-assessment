import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateRegenerativeReport } from '@/lib/generateReport';
import { createPDFBuffer } from '@/lib/generatePDF';

export async function POST(request: Request) {
  try {
    console.log('Starting assessment submission process');
    const formData = await request.json();
    
    // Generate report using Claude API
    console.log('Generating report for:', formData.businessName);
    const report = await generateRegenerativeReport(formData);

    // Calculate scores object, including all assessment sections
    const scores = {
      resourceUse: formData.resourceUse.score,
      wasteHandling: formData.wasteHandling.score,
      teamDevelopment: formData.teamDevelopment.score,
      communityImpact: formData.communityImpact.score,
      supplyChain: formData.supplyChain.score,
      innovationPotential: formData.innovationPotential.score,
      naturalCapital: formData.naturalCapital.score,
      socialCapital: formData.socialCapital.score,
      financialCapital: formData.financialCapital.score,
      culturalCapital: formData.culturalCapital.score,
      knowledgeCapital: formData.knowledgeCapital.score
    };

    // Calculate overall score for GHL
    const scoreValues = Object.values(scores);
    const overallScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
    
    console.log('Scores calculated:', overallScore.toFixed(1));

    // Generate PDF with the complete data
    console.log('Generating PDF with report content');
    const pdfBuffer = await createPDFBuffer(
      formData.businessName,
      formData.businessSize,
      formData.industry,
      JSON.stringify(report), // Pass the full report as JSON string
      scores
    );

    // AWS S3 Configuration
    console.log('Configuring S3 client');
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });

    // Create sanitized filename and path
    const sanitizedBusinessName = formData.businessName
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toLowerCase();
    
    const filename = `${sanitizedBusinessName}-assessment-${Date.now()}.pdf`;
    const s3Key = `reports/${filename}`;

    console.log('Uploading to S3:', s3Key);

    // Upload PDF to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      ACL: "private"
    });

    await s3.send(uploadCommand);
    console.log('S3 upload successful');

    // Generate a pre-signed URL for secure access
    const pdfUrl = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key
    }), { expiresIn: 86400 }); // 24 hours
    
    console.log('Generated pre-signed URL for PDF');

    // Prepare transformation objectives and support preferences for GHL
    const transformationObjectives = Array.isArray(formData.transformationObjectives) 
      ? formData.transformationObjectives.join(', ') 
      : formData.transformationObjectives || '';
      
    const supportPreferences = Array.isArray(formData.supportPreferences) 
      ? formData.supportPreferences.join(', ') 
      : formData.supportPreferences || '';

    // Send to GHL webhook with all assessment data
    console.log('Sending data to GHL webhook');
    const response = await fetch(process.env.GHL_WEBHOOK_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        customField: {
          industry: formData.industry,
          businessSize: formData.businessSize,
          assessmentStatus: 'Completed',
          overallScore: overallScore.toFixed(1),
          
          // Include all assessment scores
          resourceUseScore: scores.resourceUse,
          wasteHandlingScore: scores.wasteHandling,
          teamDevelopmentScore: scores.teamDevelopment,
          communityImpactScore: scores.communityImpact,
          supplyChainScore: scores.supplyChain,
          innovationScore: scores.innovationPotential,
          naturalCapitalScore: scores.naturalCapital,
          socialCapitalScore: scores.socialCapital,
          financialCapitalScore: scores.financialCapital,
          culturalCapitalScore: scores.culturalCapital,
          knowledgeCapitalScore: scores.knowledgeCapital,
          
          // Include transformation goals and preferences
          transformationObjectives: transformationObjectives,
          businessChallenge: formData.businessChallenge,
          successVision: formData.successVision,
          regenerativeReadiness: formData.regenerativeReadiness,
          supportPreferences: supportPreferences,
          
          // Include link to full PDF report
          pdfReportLink: pdfUrl,
          
          // Include the assessment date
          assessmentDate: new Date().toISOString().split('T')[0]
        },
        tags: ['Assessment Completed']
      })
    });

    if (!response.ok) {
      console.error('Failed to send to GHL:', await response.text());
      throw new Error('Failed to send to GHL');
    }
    
    console.log('Successfully sent to GHL');

    // Return success response
    return NextResponse.json({ 
      success: true,
      reportUrl: pdfUrl,
      id: Date.now().toString()
    });

  } catch (error: unknown) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}