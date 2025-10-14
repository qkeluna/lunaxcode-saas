'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

export default function CompleteOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('Checking authentication...');

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      // Not logged in, redirect to login
      router.push('/login?from=onboarding');
      return;
    }

    // User is authenticated, create project from onboarding data
    createProjectFromOnboarding();
  }, [status, router]);

  async function createProjectFromOnboarding() {
    try {
      setProgress('Loading onboarding data...');

      // Get onboarding data from sessionStorage
      const onboardingDataStr = sessionStorage.getItem('onboardingData');

      if (!onboardingDataStr) {
        setError('No onboarding data found. Please start from the beginning.');
        setTimeout(() => router.push('/#pricing'), 3000);
        return;
      }

      const onboardingData = JSON.parse(onboardingDataStr);

      setProgress('Creating your project...');

      // Call project creation API
      const response = await fetch('/api/projects/create-from-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project');
      }

      setProgress('Generating PRD and tasks with AI...');

      // Clear onboarding data
      sessionStorage.removeItem('onboardingData');

      // Wait a bit for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirect to project page
      router.push(result.redirectUrl || `/projects/${result.projectId}`);

    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project. Please try again.');
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/#pricing')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Loader2 className="w-16 h-16 text-purple-600 mx-auto animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Setting up your project...
        </h2>
        <p className="text-gray-600 mb-6">{progress}</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          This may take 30-60 seconds...
        </p>
      </div>
    </div>
  );
}
