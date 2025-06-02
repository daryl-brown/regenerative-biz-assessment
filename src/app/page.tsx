import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Regenerative Business Assessment
        </h1>
        
        <p className="text-xl text-gray-600">
          Discover your business&#39;s regenerative potential and get a personalized transformation roadmap.
        </p>

        <Link 
          href="/assessment" 
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Your Assessment
        </Link>
      </div>
    </main>
  );
}