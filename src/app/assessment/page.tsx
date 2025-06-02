// src/app/assessment/page.tsx
'use client';

import React, { Suspense } from 'react'; // Import React and Suspense
import { AssessmentForm } from '@/app/components/AssessmentForm';

export default function AssessmentPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Suspense fallback={<div className="text-center p-10">Loading Assessment Form...</div>}>
        <AssessmentForm />
      </Suspense>
    </main>
  );
}
