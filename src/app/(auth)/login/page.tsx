'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { Loader2 } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const fromOnboarding = searchParams.get('from') === 'onboarding';
  const callbackUrl = searchParams.get('callbackUrl');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm fromOnboarding={fromOnboarding} callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 md:p-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            <p className="text-gray-600 dark:text-gray-400 font-bold">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
