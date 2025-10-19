'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Chrome, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function LoginForm({
  className,
  fromOnboarding = false,
  callbackUrl,
  ...props
}: React.ComponentProps<'div'> & {
  fromOnboarding?: boolean;
  callbackUrl?: string | null;
}) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectUrl = callbackUrl || (fromOnboarding ? '/dashboard/create-project' : '/dashboard');
      await signIn('google', { callbackUrl: redirectUrl });
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden border-gray-200 shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col items-center text-center">
                <h1
                  className="text-3xl font-bold text-gray-900"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  Welcome to Lunaxcode
                </h1>
                <p className="text-balance text-gray-600 mt-2">
                  AI-Powered Project Management for Filipino Businesses
                </p>
              </div>

              {/* Onboarding Message */}
              {fromOnboarding && (
                <div
                  className="rounded-xl border-2 p-4"
                  style={{
                    borderColor: 'var(--sp-colors-accent)',
                    backgroundColor: 'var(--sp-colors-bg-active)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Sparkles
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: 'var(--sp-colors-accent)' }}
                      fill="currentColor"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Almost there!</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Sign in to create your account and we&apos;ll generate your personalized project
                        plan using AI.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-bold shadow-md hover:shadow-lg transition-all duration-200"
                style={{ minHeight: '48px' }}
                aria-label="Sign in with Google"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Chrome className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-200">
                <span className="relative z-10 bg-white px-2 text-gray-500 font-bold">
                  Secure Authentication
                </span>
              </div>

              {/* Features */}
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: 'var(--sp-colors-accent)' }}
                  />
                  <span className="text-gray-600 text-balance leading-relaxed">
                    Secure Google authentication—no password needed
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: 'var(--sp-colors-accent)' }}
                  />
                  <span className="text-gray-600 text-balance leading-relaxed">
                    Enterprise-grade encryption keeps your data safe
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: 'var(--sp-colors-accent)' }}
                  />
                  <span className="text-gray-600 text-balance leading-relaxed">
                    Start managing projects instantly
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600">
                  New to Lunaxcode?{' '}
                  <Link
                    href="/onboarding"
                    className="font-bold underline-offset-4 hover:underline"
                    style={{ color: 'var(--sp-colors-accent)' }}
                  >
                    Start your project
                  </Link>
                </span>
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div
            className="relative hidden bg-gradient-to-br from-purple-600 to-blue-600 md:block"
            style={{ backgroundColor: 'var(--sp-colors-accent)' }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
              <Sparkles className="w-16 h-16 mb-6" fill="currentColor" />
              <h2 className="text-2xl font-bold mb-4 text-center" style={{ letterSpacing: '-0.02em' }}>
                Transform Your Ideas Into Reality
              </h2>
              <p className="text-center text-white/90 max-w-sm leading-relaxed">
                Join hundreds of Filipino businesses using AI-powered project management to bring
                their vision to life.
              </p>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">500+</div>
                  <div className="text-xs text-white/80">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">98%</div>
                  <div className="text-xs text-white/80">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-xs text-white/80">Support</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Privacy */}
      <div className="text-balance text-center text-xs text-gray-600">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="underline underline-offset-4 hover:text-gray-900 font-bold">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-gray-900 font-bold">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
