'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export default function CreateProjectPage() {
  const router = useRouter();
  const [stage, setStage] = useState<'loading' | 'generating' | 'complete' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    const createProject = async () => {
      try {
        // Retrieve onboarding data from sessionStorage
        const onboardingDataStr = sessionStorage.getItem('onboardingData');

        if (!onboardingDataStr) {
          setError('No onboarding data found. Please start from the beginning.');
          setStage('error');
          return;
        }

        const onboardingData = JSON.parse(onboardingDataStr);

        // Validate required fields
        if (!onboardingData.service || !onboardingData.description ||
            !onboardingData.clientName || !onboardingData.clientEmail) {
          setError('Incomplete onboarding data. Please start from the beginning.');
          setStage('error');
          return;
        }

        setStage('generating');
        setProgress(20);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return prev;
            return prev + 5;
          });
        }, 1000);

        // Call API to create project with AI generation
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service: onboardingData.service,
            description: onboardingData.description,
            features: onboardingData.features || [],
            timeline: onboardingData.timeline || 30,
            budget: onboardingData.budget || 50000,
            clientName: onboardingData.clientName,
            clientEmail: onboardingData.clientEmail,
            clientPhone: onboardingData.clientPhone || '',
          }),
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json() as { error?: string };
          throw new Error(errorData.error || 'Failed to create project');
        }

        const result = await response.json() as { projectId: number };

        setProgress(100);
        setProjectId(result.projectId);
        setStage('complete');

        // Clear onboarding data from sessionStorage
        sessionStorage.removeItem('onboardingData');

        // Redirect to project detail page after 2 seconds
        setTimeout(() => {
          router.push(`/projects/${result.projectId}`);
        }, 2000);
      } catch (err: any) {
        console.error('Error creating project:', err);
        setError(err.message || 'An unexpected error occurred');
        setStage('error');
      }
    };

    createProject();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Project Generation
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {stage === 'loading' && 'Preparing Your Project...'}
              {stage === 'generating' && 'Creating Your Project Plan'}
              {stage === 'complete' && 'Project Created Successfully!'}
              {stage === 'error' && 'Something Went Wrong'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {stage === 'loading' && 'Getting everything ready...'}
              {stage === 'generating' && 'Our AI is analyzing your requirements and generating a comprehensive plan'}
              {stage === 'complete' && 'Redirecting you to your project dashboard...'}
              {stage === 'error' && 'We encountered an issue while creating your project'}
            </p>
          </div>

          {/* Progress section */}
          {(stage === 'loading' || stage === 'generating') && (
            <div className="space-y-6">
              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {progress < 30 && 'Initializing...'}
                    {progress >= 30 && progress < 60 && 'Generating PRD with AI...'}
                    {progress >= 60 && progress < 90 && 'Creating task breakdown...'}
                    {progress >= 90 && 'Finalizing project...'}
                  </span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Status indicators */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  {progress < 30 ? (
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    Analyzing your requirements
                  </span>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  {progress < 60 ? (
                    <Clock className="w-5 h-5 text-gray-400" />
                  ) : progress < 90 ? (
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    Generating Project Requirements Document (PRD)
                  </span>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  {progress < 90 ? (
                    <Clock className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    Creating detailed task breakdown
                  </span>
                </div>
              </div>

              {/* Info note */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Please wait...</strong> This process typically takes 20-30 seconds.
                  We&apos;re using advanced AI to create a comprehensive project plan tailored to your needs.
                </p>
              </div>
            </div>
          )}

          {/* Success state */}
          {stage === 'complete' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg text-foreground">
                  Your project has been created with a comprehensive PRD and task breakdown!
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to your project dashboard...
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
              </div>
            </div>
          )}

          {/* Error state */}
          {stage === 'error' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="text-4xl">⚠️</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg text-foreground">
                  {error || 'An unexpected error occurred'}
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/onboarding')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
                >
                  Start Over
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
