'use client';

export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Supabase URL:</h2>
          <p className="bg-gray-100 p-2 rounded-md overflow-x-auto">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Supabase Anon Key:</h2>
          <p className="bg-gray-100 p-2 rounded-md overflow-x-auto">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
              ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` 
              : 'Not set'}
          </p>
        </div>
      </div>
    </div>
  );
}
