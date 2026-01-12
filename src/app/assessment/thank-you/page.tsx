'use client';

import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You! Your Assessment is Complete
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            What Happens Next?
          </h2>
          <div className="text-left space-y-3 text-gray-700">
            <p className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Your personalized regenerative business report is being generated</span>
            </p>
            <p className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>The report includes detailed recommendations, transformation roadmap, and financial projections</span>
            </p>
            <p className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>You&apos;ll receive your comprehensive PDF report via email within the next <strong>48 hours</strong></span>
            </p>
            <p className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Our team will be in touch to discuss your transformation journey</span>
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6 text-left">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Notice</h3>
          <p className="text-sm text-gray-700 mb-2">
            This assessment report is <strong>indicative and educational only</strong>. It provides preliminary insights based on the information you&apos;ve provided.
          </p>
          <p className="text-sm text-gray-700 mb-2">
            As a coaching business, we may not have all the information required for key investment decisions. Any actions you take based on the contents of this report are your own responsibility. You are advised to conduct your own due diligence and seek appropriate professional advice before making business decisions.
          </p>
          <p className="text-sm text-gray-700">
            The recommendations provided are general guidance to support your regenerative business journey.
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Please check your spam folder if you don&apos;t see the email within 48 hours
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