'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
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
