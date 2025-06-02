// src/app/api/update-progress/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log('Saving assessment progress:', data);
    
    // Extract user identity information
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      businessName, 
      industry, 
      businessSize,
      isMember,
      memberId,
      step 
    } = data;
    
    // Generate a progress ID if none exists
    const progressId = memberId || `progress_${Date.now()}`;
    
    // Send progress update to GHL
    const response = await fetch(process.env.GHL_WEBHOOK_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone || "",
        businessName: businessName,
        customField: {
          industry: industry,
          businessSize: businessSize,
          assessmentStatus: 'In Progress',
          assessmentStep: step,
          progressId: progressId,
          lastUpdated: new Date().toISOString()
        },
        tags: ['Assessment In Progress']
      })
    });

    if (!response.ok) {
      console.error('Failed to update GHL:', await response.text());
      throw new Error('Failed to send progress update to GHL');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Progress saved successfully',
      progressId: progressId
    });
    
  } catch (error: any) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress', message: error.message },
      { status: 500 }
    );
  }
}