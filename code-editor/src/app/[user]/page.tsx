'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import CodeEditor from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES } from '@/config/piston';

export default function UserPage({ params }: { params: Promise<{ user: string }> }) {
  const resolvedParams = React.use(params);
  const username = resolvedParams.user;
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('javascript');
  

  useEffect(() => {
    if (!isLoaded) return;

    // If user is not signed in, redirect to sign-in
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Check if the requested username matches the logged-in user's username
    if (user?.username !== username) {
      setError('You are not authorized to view this page');
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    // If we get here, user is authorized
    setIsAuthorized(true);
    setIsLoading(false);
  }, [isLoaded, isSignedIn, user, username, router]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !isAuthorized) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto mt-10">
          <strong className="font-bold">Access Denied: </strong>
          <span className="block sm:inline">{error || 'You are not authorized to view this page'}</span>
          <div className="mt-4">
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="mr-2"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col min-h-screen bg-gray-50"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Header with Title and User Info */}
      <header>
        <div className="container mx-auto px-4 py-3 pr-2">
          <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.firstName || user?.username || 'User'}
              </p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto p-4 h-full">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <CodeEditor 
              code="// Start coding here..."
              language={language}
              onLanguageChange={setLanguage}
              onCodeChange={(code) => console.log('Code changed:', code)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
