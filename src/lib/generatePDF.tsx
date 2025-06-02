// Vercel change: Import puppeteer-core instead of puppeteer
import puppeteer from 'puppeteer-core';
// Vercel change: Import chromium helper
import chromium from '@sparticuz/chromium';
import path from 'path';
// Vercel change: Use fs.promises for asynchronous file operations
import fs from 'fs/promises';

interface ScoreData {
  resourceUse: number;
  wasteHandling: number;
  teamDevelopment: number;
  communityImpact: number;
  supplyChain: number;
  innovationPotential: number;
  naturalCapital: number;
  socialCapital: number;
  financialCapital: number;
  culturalCapital: number;
  knowledgeCapital: number;
}

export async function createPDFBuffer(
  businessName: string,
  businessSize: string,
  industry: string,
  reportContentJson: string,
  scores: ScoreData
): Promise<Buffer> {

  // Vercel change: Initialize browser to null for finally block
  let browser = null;
  console.log('Starting PDF generation process...');

  try {
    console.log('Parsing report content...');
    const reportContent = JSON.parse(reportContentJson);
    console.log('Report sections available:', Object.keys(reportContent));

    // --- Vercel change: Browser Launch Configuration ---
    console.log("Determining executable path...");
    // Use @sparticuz/chromium's recommended settings for Vercel
    // It automatically downloads/finds the correct Chromium binary for the Lambda environment
    const executablePath = await chromium.executablePath();

    if (!executablePath) {
        // Handle the case where chromium executable couldn't be found (optional, for robustness)
        throw new Error("Chromium executable not found, cannot generate PDF.");
    }
    console.log(`Executable path: ${executablePath}`);

    console.log("Launching browser with Vercel compatible settings...");
    browser = await puppeteer.launch({
        args: [
            ...chromium.args, // Use recommended args
            '--font-render-hinting=none', // Potential fix for font issues on Linux
            '--no-sandbox', // Often required in containerized environments
            '--disable-setuid-sandbox', // Often required in containerized environments
            '--disable-dev-shm-usage' // Recommended for resource-constrained environments
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        // Vercel change: Use chromium.headless which handles 'new' vs boolean based on version
        headless: chromium.headless,

    });
    console.log("Browser launched successfully.");
    // --- End Vercel Browser Launch Configuration ---

    const page = await browser.newPage();
    console.log("New page created.");

    // --- Vercel change: Asynchronous Template Loading ---
    // Use a path relative to the project root (process.cwd() in Vercel)
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'reportTemplate.html');
    let html = '';
    console.log('Attempting to read template file from:', templatePath);
    try {
        html = await fs.readFile(templatePath, 'utf8');
        console.log('Template file read successfully.');
    } catch (readError) {
        console.error('Failed to read template file:', readError);
        // If reading fails, try a potential alternative if needed (e.g., if structure differs in build)
        // const alternativePath = path.join(process.cwd(), 'templates', 'reportTemplate.html');
        // console.log('Attempting alternative path:', alternativePath);
        // try {
        //     html = await fs.readFile(alternativePath, 'utf8');
        //     console.log('Template file read successfully from alternative path.');
        // } catch (altReadError) {
             console.error(`Failed to read template from primary path: ${templatePath}`);
             throw new Error(`Template file not found or could not be read. Ensure 'src/templates/reportTemplate.html' exists and is included in the deployment.`);
        // }
    }
    // --- End Asynchronous Template Loading ---


    // --- Data Injection (Your existing logic - no changes needed here) ---
    console.log('Injecting data into HTML template...');
    // Get current date as fallback
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Replace business profile placeholders
    html = html.replace(/{{businessName}}/g, businessName || 'Your Business');
    html = html.replace(/{{industry}}/g, industry || 'General Industry');
    html = html.replace(/{{size}}/g, businessSize || 'Small Business');
    html = html.replace(/{{businessProfile.assessmentDate}}/g,
      reportContent.businessProfile?.assessmentDate || currentDate);

    // Replace executive summary placeholders
    html = html.replace(/{{overallScore}}/g, reportContent.executiveSummary?.overallScore || '0.0');
    html = html.replace(/{{keyInsights}}/g, reportContent.executiveSummary?.keyInsights ||
      'This report provides initial insights into your regenerative business potential.');
    html = html.replace(/{{transformationReadinessLevel}}/g,
      reportContent.executiveSummary?.transformationReadinessLevel || 'Getting started');
    html = html.replace(/{{summaryMessage}}/g, reportContent.executiveSummary?.summaryMessage ||
      'Your business has potential for regenerative transformation.');

    // RESOURCE USE SECTION
    html = html.replace(/{{resourceUseScore}}/g, scores.resourceUse.toString());
    html = html.replace(/{{resourceUseKeyFindings}}/g,
      reportContent.dimensionalAssessment?.resourceUse?.keyFindings || 'Resource use needs assessment.');
    const immediateWins = Array.isArray(reportContent.dimensionalAssessment?.resourceUse?.recommendations?.immediateWins)
      ? reportContent.dimensionalAssessment.resourceUse.recommendations.immediateWins.join('</li><li>')
      : reportContent.dimensionalAssessment?.resourceUse?.recommendations?.immediateWins || 'Conduct a resource audit';
    const shortTermStrategies = Array.isArray(reportContent.dimensionalAssessment?.resourceUse?.recommendations?.shortTermStrategies)
      ? reportContent.dimensionalAssessment.resourceUse.recommendations.shortTermStrategies.join('</li><li>')
      : reportContent.dimensionalAssessment?.resourceUse?.recommendations?.shortTermStrategies || 'Develop resource use plan';
    const longTermTransformation = Array.isArray(reportContent.dimensionalAssessment?.resourceUse?.recommendations?.longTermTransformation)
      ? reportContent.dimensionalAssessment.resourceUse.recommendations.longTermTransformation.join('</li><li>')
      : reportContent.dimensionalAssessment?.resourceUse?.recommendations?.longTermTransformation || 'Implement regenerative practices';
    html = html.replace(/{{resourceUseRecommendations.immediateWins}}/g, immediateWins);
    html = html.replace(/{{resourceUseRecommendations.shortTermStrategies}}/g, shortTermStrategies);
    html = html.replace(/{{resourceUseRecommendations.longTermTransformation}}/g, longTermTransformation);

    // WASTE HANDLING SECTION
    html = html.replace(/{{wasteHandlingScore}}/g, scores.wasteHandling.toString());
    html = html.replace(/{{wasteHandlingKeyFindings}}/g,
      reportContent.dimensionalAssessment?.wasteHandling?.keyFindings || 'Waste handling processes need development.');
    const wasteImmediateWins = Array.isArray(reportContent.dimensionalAssessment?.wasteHandling?.recommendations?.immediateWins)
      ? reportContent.dimensionalAssessment.wasteHandling.recommendations.immediateWins.join('</li><li>')
      : reportContent.dimensionalAssessment?.wasteHandling?.recommendations?.immediateWins || 'Implement basic waste sorting';
    const wasteShortTermStrategies = Array.isArray(reportContent.dimensionalAssessment?.wasteHandling?.recommendations?.shortTermStrategies)
      ? reportContent.dimensionalAssessment.wasteHandling.recommendations.shortTermStrategies.join('</li><li>')
      : reportContent.dimensionalAssessment?.wasteHandling?.recommendations?.shortTermStrategies || 'Develop waste reduction goals';
    const wasteLongTermTransformation = Array.isArray(reportContent.dimensionalAssessment?.wasteHandling?.recommendations?.longTermTransformation)
      ? reportContent.dimensionalAssessment.wasteHandling.recommendations.longTermTransformation.join('</li><li>')
      : reportContent.dimensionalAssessment?.wasteHandling?.recommendations?.longTermTransformation || 'Implement circular systems';
    html = html.replace(/{{wasteHandlingRecommendations.immediateWins}}/g, wasteImmediateWins);
    html = html.replace(/{{wasteHandlingRecommendations.shortTermStrategies}}/g, wasteShortTermStrategies);
    html = html.replace(/{{wasteHandlingRecommendations.longTermTransformation}}/g, wasteLongTermTransformation);

    // TEAM DEVELOPMENT SECTION
    html = html.replace(/{{teamDevelopmentScore}}/g, scores.teamDevelopment.toString());
    html = html.replace(/{{teamDevelopmentKeyFindings}}/g,
      reportContent.dimensionalAssessment?.teamDevelopment?.keyFindings || 'Team development can be enhanced.');
    const teamImmediateWins = Array.isArray(reportContent.dimensionalAssessment?.teamDevelopment?.recommendations?.immediateWins)
      ? reportContent.dimensionalAssessment.teamDevelopment.recommendations.immediateWins.join('</li><li>')
      : reportContent.dimensionalAssessment?.teamDevelopment?.recommendations?.immediateWins || 'Implement regular feedback sessions';
    const teamShortTermStrategies = Array.isArray(reportContent.dimensionalAssessment?.teamDevelopment?.recommendations?.shortTermStrategies)
      ? reportContent.dimensionalAssessment.teamDevelopment.recommendations.shortTermStrategies.join('</li><li>')
      : reportContent.dimensionalAssessment?.teamDevelopment?.recommendations?.shortTermStrategies || 'Develop skills training program';
    const teamLongTermTransformation = Array.isArray(reportContent.dimensionalAssessment?.teamDevelopment?.recommendations?.longTermTransformation)
      ? reportContent.dimensionalAssessment.teamDevelopment.recommendations.longTermTransformation.join('</li><li>')
      : reportContent.dimensionalAssessment?.teamDevelopment?.recommendations?.longTermTransformation || 'Create a learning organization';
    html = html.replace(/{{teamDevelopmentRecommendations.immediateWins}}/g, teamImmediateWins);
    html = html.replace(/{{teamDevelopmentRecommendations.shortTermStrategies}}/g, teamShortTermStrategies);
    html = html.replace(/{{teamDevelopmentRecommendations.longTermTransformation}}/g, teamLongTermTransformation);

    // COMMUNITY IMPACT SECTION
    html = html.replace(/{{communityImpactScore}}/g, scores.communityImpact.toString());
    html = html.replace(/{{communityImpactKeyFindings}}/g,
      reportContent.dimensionalAssessment?.communityImpact?.keyFindings || 'Community engagement has potential for growth.');
    const communityImmediateWins = Array.isArray(reportContent.dimensionalAssessment?.communityImpact?.recommendations?.immediateWins)
      ? reportContent.dimensionalAssessment.communityImpact.recommendations.immediateWins.join('</li><li>')
      : reportContent.dimensionalAssessment?.communityImpact?.recommendations?.immediateWins || 'Identify community partnership opportunities';
    const communityShortTermStrategies = Array.isArray(reportContent.dimensionalAssessment?.communityImpact?.recommendations?.shortTermStrategies)
      ? reportContent.dimensionalAssessment.communityImpact.recommendations.shortTermStrategies.join('</li><li>')
      : reportContent.dimensionalAssessment?.communityImpact?.recommendations?.shortTermStrategies || 'Develop community engagement program';
    const communityLongTermTransformation = Array.isArray(reportContent.dimensionalAssessment?.communityImpact?.recommendations?.longTermTransformation)
      ? reportContent.dimensionalAssessment.communityImpact.recommendations.longTermTransformation.join('</li><li>')
      : reportContent.dimensionalAssessment?.communityImpact?.recommendations?.longTermTransformation || 'Become a community anchor institution';
    html = html.replace(/{{communityImpactRecommendations.immediateWins}}/g, communityImmediateWins);
    html = html.replace(/{{communityImpactRecommendations.shortTermStrategies}}/g, communityShortTermStrategies);
    html = html.replace(/{{communityImpactRecommendations.longTermTransformation}}/g, communityLongTermTransformation);

    // TRANSFORMATION ROADMAP SECTION
    const shortTermActions = Array.isArray(reportContent.transformationRoadmap?.shortTerm?.actions)
      ? reportContent.transformationRoadmap.shortTerm.actions.join('</li><li>')
      : reportContent.transformationRoadmap?.shortTerm?.actions || 'Implement quick wins in key areas';
    const midTermActions = Array.isArray(reportContent.transformationRoadmap?.midTerm?.actions)
      ? reportContent.transformationRoadmap.midTerm.actions.join('</li><li>')
      : reportContent.transformationRoadmap?.midTerm?.actions || 'Develop strategic initiatives for regenerative practices';
    const longTermActions = Array.isArray(reportContent.transformationRoadmap?.longTerm?.actions)
      ? reportContent.transformationRoadmap.longTerm.actions.join('</li><li>')
      : reportContent.transformationRoadmap?.longTerm?.actions || 'Transform business model for regenerative outcomes';
    html = html.replace(/{{transformationRoadmap.shortTerm.actions}}/g, `<ul><li>${shortTermActions}</li></ul>`);
    html = html.replace(/{{transformationRoadmap.midTerm.actions}}/g, `<ul><li>${midTermActions}</li></ul>`);
    html = html.replace(/{{transformationRoadmap.longTerm.actions}}/g, `<ul><li>${longTermActions}</li></ul>`);
    html = html.replace(/{{transformationRoadmap.shortTerm.estimatedImpact}}/g,
      reportContent.transformationRoadmap?.shortTerm?.estimatedImpact ||
      'Reduced resource costs, improved team engagement, and initial positive environmental impact.');
    html = html.replace(/{{transformationRoadmap.midTerm.estimatedImpact}}/g,
      reportContent.transformationRoadmap?.midTerm?.estimatedImpact ||
      'Significant cost savings, enhanced brand reputation, and measurable sustainability improvements.');
    html = html.replace(/{{transformationRoadmap.longTerm.estimatedImpact}}/g,
      reportContent.transformationRoadmap?.longTerm?.estimatedImpact ||
      'Transformative business model with competitive advantages, industry leadership, and regenerative outcomes.');

    // FINANCIAL IMPLICATIONS SECTION
    html = html.replace(/{{financialImplications.estimatedCosts}}/g,
      reportContent.financialImplications?.estimatedCosts ||
      'Initial costs vary based on scope of implementation and current practices.');
    html = html.replace(/{{financialImplications.potentialSavings}}/g,
      reportContent.financialImplications?.potentialSavings ||
      'Potential savings through resource efficiency, waste reduction, and improved operations.');
    html = html.replace(/{{financialImplications.newRevenueOpportunities}}/g,
      reportContent.financialImplications?.newRevenueOpportunities ||
      'New revenue streams through innovative products/services and regenerative business models.');
    html = html.replace(/{{financialImplications.ROIProjection}}/g,
      reportContent.financialImplications?.ROIProjection ||
      'ROI timeline depends on implementation scope, with many initiatives showing returns within 1-3 years.');

    // CLOSING INSIGHTS SECTION
    html = html.replace(/{{closingInsights.motivationalMessage}}/g,
      reportContent.closingInsights?.motivationalMessage ||
      'Your business has significant potential for regenerative transformation, creating multiple forms of value while contributing to a thriving future.');
    const nextSteps = Array.isArray(reportContent.closingInsights?.nextSteps)
      ? reportContent.closingInsights.nextSteps.join('</li><li>')
      : reportContent.closingInsights?.nextSteps || 'Schedule a follow-up consultation to develop your transformation plan';
    html = html.replace(/{{closingInsights.nextSteps}}/g, nextSteps);

    // Update the report content div
    html = html.replace('{{reportContent}}', '');

    // Update chart data script with actual score values
    const chartData = JSON.stringify({
      resourceUse: scores.resourceUse,
      wasteHandling: scores.wasteHandling,
      teamDevelopment: scores.teamDevelopment,
      communityImpact: scores.communityImpact,
      supplyChain: scores.supplyChain,
      innovationPotential: scores.innovationPotential,
      naturalCapital: scores.naturalCapital,
      socialCapital: scores.socialCapital,
      financialCapital: scores.financialCapital,
      culturalCapital: scores.culturalCapital,
      knowledgeCapital: scores.knowledgeCapital
    });

    // Inject chart data into the script tag
    const scriptPattern = '<script id="report-data" type="application/json">';
    const scriptEndPattern = '</script>';
    const scriptStartIndex = html.indexOf(scriptPattern);
    let scriptEndIndex = html.indexOf(scriptEndPattern, scriptStartIndex); // Find first occurrence after start

    if (scriptStartIndex !== -1 && scriptEndIndex !== -1) {
        // Ensure we grab the correct closing tag if there are multiple scripts
        scriptEndIndex = html.indexOf(scriptEndPattern, scriptStartIndex + scriptPattern.length);
        if (scriptEndIndex !== -1) {
            html = html.substring(0, scriptStartIndex + scriptPattern.length) +
                   chartData +
                   html.substring(scriptEndIndex);
        } else {
            console.warn('Could not find closing script tag for chart data injection.');
        }
    } else {
      console.warn('Could not find script tag with id="report-data" for chart data injection.');
    }
    console.log('Data injection complete.');
    // --- End Data Injection ---


    // --- PDF Generation ---
    console.log('Setting page content...');
    // Use 'networkidle0' to wait for network activity to cease (images, scripts, etc.)
    await page.setContent(html, { waitUntil: 'networkidle0' });
    console.log('Page content set.');

    // Optional: Add a delay if charts need more time to render after network idle
    // Be cautious with fixed delays in serverless - keep them short.
    console.log('Waiting for potential chart rendering (1000ms)...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Generating PDF buffer...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      }
    });
    console.log('PDF buffer generated successfully.');

    // Vercel change: Return the buffer directly (page.pdf already returns a Buffer)
    return Buffer.from(pdfBuffer);
    // --- End PDF Generation ---

  } catch (error) {
    console.error('Error occurred during PDF generation:', error);
    // Re-throw the error so the calling function (API route) knows it failed
    throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Vercel change: Ensure browser is closed in a finally block
    if (browser !== null) {
      console.log("Closing browser...");
      try {
          await browser.close();
          console.log("Browser closed successfully.");
      } catch (closeError) {
          console.error("Error closing browser:", closeError);
      }
    }
  }
}