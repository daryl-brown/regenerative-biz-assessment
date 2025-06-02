import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

interface AssessmentSection {
  score: number;
  evidence: string;
}

interface AssessmentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  industry: string;
  businessSize: string;
  
  // Business Model Assessment sections
  resourceUse: AssessmentSection;
  wasteHandling: AssessmentSection;
  teamDevelopment: AssessmentSection;
  communityImpact: AssessmentSection;
  supplyChain: AssessmentSection;
  innovationPotential: AssessmentSection;
  
  // Value Creation Mapping sections
  naturalCapital: AssessmentSection;
  socialCapital: AssessmentSection;
  financialCapital: AssessmentSection;
  culturalCapital: AssessmentSection;
  knowledgeCapital: AssessmentSection;
  
  // Future Potential & Transformation
  transformationObjectives: string[];
  businessChallenge: string;
  successVision: string;
  regenerativeReadiness: string;
  supportPreferences: string[];
}

// Retry function for handling Claude API failures
async function callClaudeAPI(content: string, attempt = 1): Promise<unknown> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      messages: [{ role: "user", content }]
    });

    console.log('Claude API response received');

    // Ensure response is structured as JSON
    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('\n');

    return JSON.parse(responseText);
  } catch (error: unknown) {
    console.error(`Claude API attempt ${attempt} failed:`, error);

    if (attempt < 3 && (error as { status?: number }).status === 529) {
      console.log(`Retrying in ${attempt * 2} seconds...`);
      await new Promise(res => setTimeout(res, attempt * 2000));
      return callClaudeAPI(content, attempt + 1);
    }

    throw error;
  }
}

export async function generateRegenerativeReport(data: AssessmentData) {
  console.log('Generating report for:', data.businessName);

  // Calculate overall score across all sections
  const scores = [
    data.resourceUse.score,
    data.wasteHandling.score,
    data.teamDevelopment.score,
    data.communityImpact.score,
    data.supplyChain.score,
    data.innovationPotential.score,
    data.naturalCapital.score,
    data.socialCapital.score,
    data.financialCapital.score,
    data.culturalCapital.score,
    data.knowledgeCapital.score
  ];
  
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const currentDate = new Date().toLocaleDateString('en-AU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const prompt = `
You are a Regenerative Business Transformation Expert specializing in Australian businesses.
Your task is to generate a structured JSON report based on the provided assessment data.

### Business Profile:
- Name: ${data.businessName}
- Industry: ${data.industry}
- Size: ${data.businessSize}
- Phone: ${data.phone}

### Business Model Assessment:
- Resource Use (${data.resourceUse.score}/5): ${data.resourceUse.evidence}
- Waste Handling (${data.wasteHandling.score}/5): ${data.wasteHandling.evidence}
- Team Development (${data.teamDevelopment.score}/5): ${data.teamDevelopment.evidence}
- Community Impact (${data.communityImpact.score}/5): ${data.communityImpact.evidence}
- Supply Chain (${data.supplyChain.score}/5): ${data.supplyChain.evidence}
- Innovation Potential (${data.innovationPotential.score}/5): ${data.innovationPotential.evidence}

### Value Creation Mapping:
- Natural Capital (${data.naturalCapital.score}/5): ${data.naturalCapital.evidence}
- Social Capital (${data.socialCapital.score}/5): ${data.socialCapital.evidence}
- Financial Capital (${data.financialCapital.score}/5): ${data.financialCapital.evidence}
- Cultural Capital (${data.culturalCapital.score}/5): ${data.culturalCapital.evidence}
- Knowledge Capital (${data.knowledgeCapital.score}/5): ${data.knowledgeCapital.evidence}

### Future Potential & Transformation:
- Transformation Objectives: ${data.transformationObjectives.join(', ')}
- Business Challenge: ${data.businessChallenge}
- Success Vision: ${data.successVision}
- Regenerative Readiness: ${data.regenerativeReadiness}
- Support Preferences: ${data.supportPreferences.join(', ')}

Now, generate a JSON report with the following structured format:

{
  "executiveSummary": {
    "overallScore": ${overallScore.toFixed(1)},
    "keyInsights": "Summarize the major regenerative business insights based on the assessment data.",
    "transformationReadinessLevel": "Assess readiness based on scores and stated regenerative readiness.",
    "summaryMessage": "Provide a motivational message tailored to their specific industry and challenges."
  },
  "businessProfile": {
    "businessName": "${data.businessName}",
    "industry": "${data.industry}",
    "size": "${data.businessSize}",
    "phone": "${data.phone}",
    "assessmentDate": "${currentDate}"
  },
  "dimensionalAssessment": {
    "resourceUse": {
      "score": ${data.resourceUse.score},
      "keyFindings": "Extract key findings from the evidence on resource use.",
      "recommendations": {
        "immediateWins": ["Provide 2-3 immediate actionable recommendations based on their evidence"],
        "shortTermStrategies": ["Provide 2-3 short-term strategies (3-6 months) for resource use improvement"],
        "longTermTransformation": ["Provide 2-3 long-term transformational changes for resource management"]
      }
    },
    "wasteHandling": {
      "score": ${data.wasteHandling.score},
      "keyFindings": "Extract key findings from the waste handling evidence.",
      "recommendations": {
        "immediateWins": ["Provide 2-3 waste handling quick wins"],
        "shortTermStrategies": ["Provide 2-3 short-term waste strategies"],
        "longTermTransformation": ["Provide 2-3 long-term waste transformation approaches"]
      }
    },
    "teamDevelopment": {
      "score": ${data.teamDevelopment.score},
      "keyFindings": "Extract key findings from the team development evidence.",
      "recommendations": {
        "immediateWins": ["Provide 2-3 team development quick wins"],
        "shortTermStrategies": ["Provide 2-3 medium-term team capability strategies"],
        "longTermTransformation": ["Provide 2-3 long-term team transformation approaches"]
      }
    },
    "communityImpact": {
      "score": ${data.communityImpact.score},
      "keyFindings": "Extract key findings from the community impact evidence.",
      "recommendations": {
        "immediateWins": ["Provide 2-3 community impact quick wins"],
        "shortTermStrategies": ["Provide 2-3 medium-term community strategies"],
        "longTermTransformation": ["Provide 2-3 long-term community transformation approaches"]
      }
    },
    "supplyChain": {
      "score": ${data.supplyChain.score},
      "keyFindings": "Extract key findings from the supply chain evidence.",
      "recommendations": {
        "immediateWins": ["Provide 2-3 supply chain quick wins"],
        "shortTermStrategies": ["Provide 2-3 medium-term supply chain strategies"],
        "longTermTransformation": ["Provide 2-3 long-term supply chain transformation approaches"]
      }
    },
    "innovationPotential": {
      "score": ${data.innovationPotential.score},
      "keyFindings": "Extract key findings from the innovation potential evidence.",
      "recommendations": {
        "immediateWins": ["Provide 2-3 innovation quick wins"],
        "shortTermStrategies": ["Provide 2-3 medium-term innovation strategies"],
        "longTermTransformation": ["Provide 2-3 long-term innovation transformation approaches"]
      }
    }
  },
  "valueCreation": {
    "naturalCapital": {
      "score": ${data.naturalCapital.score},
      "keyFindings": "Extract key findings from the natural capital evidence.",
      "recommendations": ["Provide 2-3 specific recommendations for improving natural capital"]
    },
    "socialCapital": {
      "score": ${data.socialCapital.score},
      "keyFindings": "Extract key findings from the social capital evidence.",
      "recommendations": ["Provide 2-3 specific recommendations for improving social capital"]
    },
    "financialCapital": {
      "score": ${data.financialCapital.score},
      "keyFindings": "Extract key findings from the financial capital evidence.",
      "recommendations": ["Provide 2-3 specific recommendations for improving financial capital"]
    },
    "culturalCapital": {
      "score": ${data.culturalCapital.score},
      "keyFindings": "Extract key findings from the cultural capital evidence.",
      "recommendations": ["Provide 2-3 specific recommendations for improving cultural capital"]
    },
    "knowledgeCapital": {
      "score": ${data.knowledgeCapital.score},
      "keyFindings": "Extract key findings from the knowledge capital evidence.",
      "recommendations": ["Provide 2-3 specific recommendations for improving knowledge capital"]
    }
  },
  "transformationRoadmap": {
    "shortTerm": {
      "actions": ["Identify 3-4 quick wins based on assessment data and business challenges"],
      "estimatedImpact": "Describe specific projected benefits for their industry and size",
      "resourcesNeeded": ["List 2-3 specific resources required for implementation"]
    },
    "midTerm": {
      "actions": ["Outline 3-4 strategic improvements addressing their specific situation"],
      "estimatedImpact": "Project specific benefits from these medium-term changes",
      "resourcesNeeded": ["List 2-3 specific resources required for mid-term implementation"]
    },
    "longTerm": {
      "actions": ["Identify 3-4 system-level transformations tailored to their industry"],
      "estimatedImpact": "Describe long-term impact projections",
      "resourcesNeeded": ["List 2-3 specific resources required for long-term implementation"]
    }
  },
  "financialImplications": {
    "estimatedCosts": "Provide realistic cost estimates appropriate for their business size and industry",
    "potentialSavings": "Calculate projected cost savings based on their specific challenges and opportunities",
    "newRevenueOpportunities": "Identify specific new revenue streams relevant to their industry and current operations",
    "ROIProjection": "Estimate return on investment timeframe tailored to their situation"
  },
  "supportRecommendations": {
    "training": ["List 2-3 relevant training opportunities specific to their needs"],
    "networking": ["Suggest 2-3 specific networking connections beneficial for their situation"],
    "resources": ["Provide 2-3 relevant resources tailored to their industry and transformation goals"]
  },
  "closingInsights": {
    "motivationalMessage": "Provide an inspiring closing remark tailored to their specific business and goals.",
    "nextSteps": ["Outline 3-4 clear, specific next steps for engagement tailored to their current state."]
  }
}

Respond strictly in JSON format. Ensure all recommendations are specific, actionable, and tailored to their industry, business size, and the evidence they provided.
`;

  const reportContent = await callClaudeAPI(prompt);

  console.log("Generated JSON Report Structure:", Object.keys(reportContent as object));

  return reportContent;
}