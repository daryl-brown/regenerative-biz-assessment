import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateRegenerativeReport } from '@/lib/generateReport';
import { createPDFBuffer } from '@/lib/generatePDF';

export async function POST(request: Request) {
  try {
    console.log('=== STARTING ASSESSMENT SUBMISSION ===');
    console.log('Timestamp:', new Date().toISOString());

    const formData = await request.json();
    console.log('Received form data for:', formData.businessName);
    console.log('Contact info - Email:', formData.email, 'Phone:', formData.phone);

    // Generate report using Claude API
    console.log('Step 1: Generating Claude report for:', formData.businessName);
    const report = await generateRegenerativeReport(formData);
    console.log('✓ Claude report generated successfully');

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

    console.log('Step 2: Scores calculated - Overall:', overallScore.toFixed(1));
    console.log('Individual scores:', scores);

    // Generate PDF with the complete data
    console.log('Step 3: Generating PDF with report content');
    const pdfBuffer = await createPDFBuffer(
      formData.businessName,
      formData.businessSize,
      formData.industry,
      JSON.stringify(report), // Pass the full report as JSON string
      scores
    );
    console.log('✓ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // AWS S3 Configuration
    console.log('Step 4: Configuring S3 client for region:', process.env.AWS_REGION);
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

    console.log('Step 5: Uploading to S3 bucket:', process.env.S3_BUCKET_NAME, 'Key:', s3Key);

    // Upload PDF to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      ACL: "private"
    });

    await s3.send(uploadCommand);
    console.log('✓ S3 upload successful');

    // Generate a pre-signed URL for secure access
    const pdfUrl = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key
    }), { expiresIn: 86400 }); // 24 hours

    console.log('✓ Generated pre-signed URL for PDF');
    console.log('PDF URL (first 100 chars):', pdfUrl.substring(0, 100) + '...');

    // Prepare transformation objectives and support preferences for GHL
    const transformationObjectives = Array.isArray(formData.transformationObjectives) 
      ? formData.transformationObjectives.join(', ') 
      : formData.transformationObjectives || '';
      
    const supportPreferences = Array.isArray(formData.supportPreferences)
      ? formData.supportPreferences.join(', ')
      : formData.supportPreferences || '';

    // Send to GHL webhook with all assessment data
    console.log('=== STEP 6: SENDING TO GHL WEBHOOK ===');

    const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;
    console.log('GHL Webhook URL configured:', ghlWebhookUrl ? 'YES' : 'NO');
    if (ghlWebhookUrl) {
      // Mask the URL for security but show enough to verify it's correct
      const urlParts = ghlWebhookUrl.split('/');
      const maskedUrl = `${urlParts[0]}//${urlParts[2]}/.../hooks/.../${urlParts[urlParts.length - 1]}`;
      console.log('GHL Webhook URL (masked):', maskedUrl);
    }

    const ghlPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      businessName: formData.businessName,
      assessment_industry: formData.industry,
      assessment_businessSize: formData.businessSize,
      assessment_status: 'Completed',
      assessment_overallScore: overallScore.toFixed(1),
      assessment_resourceUseScore: scores.resourceUse,
      assessment_wasteHandlingScore: scores.wasteHandling,
      assessment_teamDevelopmentScore: scores.teamDevelopment,
      assessment_communityImpactScore: scores.communityImpact,
      assessment_supplyChainScore: scores.supplyChain,
      assessment_innovationScore: scores.innovationPotential,
      assessment_naturalCapitalScore: scores.naturalCapital,
      assessment_socialCapitalScore: scores.socialCapital,
      assessment_financialCapitalScore: scores.financialCapital,
      assessment_culturalCapitalScore: scores.culturalCapital,
      assessment_knowledgeCapitalScore: scores.knowledgeCapital,
      assessment_transformationObjectives: transformationObjectives,
      assessment_businessChallenge: formData.businessChallenge,
      assessment_successVision: formData.successVision,
      assessment_regenerativeReadiness: formData.regenerativeReadiness,
      assessment_supportPreferences: supportPreferences,
      assessment_pdfReportLink: pdfUrl,
      assessment_date: new Date().toISOString().split('T')[0],
      tags: ['Assessment Completed']
    };

    console.log('GHL Payload field count:', Object.keys(ghlPayload).length);
    console.log('GHL Payload preview:', {
      contact: `${ghlPayload.firstName} ${ghlPayload.lastName} (${ghlPayload.email})`,
      business: ghlPayload.businessName,
      status: ghlPayload.assessment_status,
      overallScore: ghlPayload.assessment_overallScore,
      hasPdfLink: !!ghlPayload.assessment_pdfReportLink,
      pdfLinkLength: ghlPayload.assessment_pdfReportLink?.length
    });

    console.log('Making POST request to GHL...');
    const response = await fetch(ghlWebhookUrl as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ghlPayload)
    });

    console.log('GHL Response Status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('GHL Response Body:', responseText);

    if (!response.ok) {
      console.error('❌ GHL webhook failed with status:', response.status);
      console.error('Response body:', responseText);
      throw new Error(`Failed to send to GHL: ${response.status} ${response.statusText}`);
    }

    console.log('✓ Successfully sent to GHL webhook');
    console.log('=== ASSESSMENT SUBMISSION COMPLETE ===');

    // Return success response
    return NextResponse.json({ 
      success: true,
      reportUrl: pdfUrl,
      id: Date.now().toString()
    });

  } catch (error: unknown) {
    console.error('=== ❌ SUBMISSION ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('Timestamp:', new Date().toISOString());

    return NextResponse.json(
      {
        error: 'Failed to process submission',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}