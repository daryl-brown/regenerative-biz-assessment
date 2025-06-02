'use client';

import Link from 'next/link';

export default function ThankYouPage() {
  // Removed unused searchParams

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You for Completing the Assessment
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Your personalized regenerative business report is being generated and will be sent to your email shortly.
        </p>

        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}