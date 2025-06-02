// src/app/api/capture-lead/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    
    console.log('Capturing lead:', formData.email);
    
    // Send initial data to GHL webhook
    const response = await fetch(process.env.GHL_WEBHOOK_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone, // Ensure phone is captured
        email: formData.email,
        businessName: formData.businessName,
        customField: {
          industry: formData.industry,
          businessSize: formData.businessSize,
          assessmentStatus: 'Started' // Marks the assessment as started
        },
        tags: ['Assessment Started'] // Adds an initial tag for tracking
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send lead to GHL');
    }

    return NextResponse.json({ success: true, message: 'Lead captured successfully' });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    );
  }
}
