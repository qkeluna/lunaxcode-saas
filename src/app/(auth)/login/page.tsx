'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chrome, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const fromOnboarding = searchParams.get('from') === 'onboarding';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // If coming from onboarding, redirect to project creation page
      const callbackUrl = fromOnboarding ? '/dashboard/create-project' : '/dashboard';
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Lunaxcode</h1>
          <p className="mt-2 text-gray-600">AI-Powered Project Management</p>
        </div>

        {/* Onboarding message */}
        {fromOnboarding && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Almost there!</h3>
                <p className="text-sm text-gray-600">
                  Sign in to create your account and we'll generate your personalized project plan using AI.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sign in button */}
        <div className="mt-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Chrome className="w-5 h-5" />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
