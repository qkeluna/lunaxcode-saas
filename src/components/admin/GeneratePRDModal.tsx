'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface GeneratePRDModalProps {
  projectId: number;
  projectName: string;
  onSuccess: () => void;
}

const loadingSteps = [
  { text: 'Analyzing project requirements...', duration: 3000 },
  { text: 'Consulting AI for optimal structure...', duration: 4000 },
  { text: 'Generating comprehensive PRD...', duration: 8000 },
  { text: 'Creating detailed task breakdown...', duration: 6000 },
  { text: 'Mapping dependencies and priorities...', duration: 4000 },
  { text: 'Finalizing project plan...', duration: 3000 },
];

export default function GeneratePRDModal({
  projectId,
  projectName,
  onSuccess,
}: GeneratePRDModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ prdLength: number; tasksCount: number } | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setIsGenerating(false);
    setCurrentStep(0);
    setIsComplete(false);
    setError(null);
    setResult(null);
  };

  const handleClose = () => {
    if (!isGenerating) {
      setIsOpen(false);
    }
  };

  const handleGenerate = async () => {
    // Check if AI is configured
    const aiProvider = localStorage.getItem('ai_provider');
    const aiApiKey = localStorage.getItem('ai_api_key');
    const aiModel = localStorage.getItem('ai_model');

    if (!aiProvider || !aiApiKey) {
      setError('Please configure your AI provider in Settings → AI Settings first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentStep(0);

    // Animate through steps
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < loadingSteps.length) {
        setCurrentStep(step);
      } else {
        clearInterval(stepInterval);
      }
    }, 4000); // Update every 4 seconds

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/generate-prd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiConfig: {
            provider: aiProvider,
            apiKey: aiApiKey,
            model: aiModel || 'gemini-2.5-pro'
          }
        })
      });

      const data = await response.json() as { prdLength: number; tasksCount: number; error?: string };
      clearInterval(stepInterval);

      if (response.ok) {
        setResult({ prdLength: data.prdLength, tasksCount: data.tasksCount });
        setIsComplete(true);
        setCurrentStep(loadingSteps.length - 1);
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
          onSuccess();
        }, 3000);
      } else {
        setError(data.error || 'Failed to generate PRD');
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError('Network error. Please try again.');
      console.error('Error generating PRD:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        title="Generate PRD & Tasks with AI"
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate PRD & Tasks with AI
            </DialogTitle>
            <DialogDescription>
              {projectName}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {!isGenerating && !isComplete && !error && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  This will use AI to generate:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                    Comprehensive Project Requirements Document (PRD)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                    15-25 detailed, actionable tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                    Time estimates and priorities
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                    Task dependencies mapping
                  </li>
                </ul>
                <div className="pt-4 border-t">
                  <p className="text-sm text-amber-600">
                    ⚠️ This will replace any existing PRD and tasks.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Expected time: 20-40 seconds
                  </p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="space-y-6">
                {loadingSteps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 transition-all duration-500 ${
                        isActive ? 'opacity-100 scale-100' : isCompleted ? 'opacity-60 scale-95' : 'opacity-30 scale-90'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : isActive ? (
                          <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          isActive ? 'text-purple-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isComplete && result && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    ✨ PRD Generated Successfully!
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-4 max-w-sm mx-auto">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-purple-600">
                        {result.prdLength.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">characters</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-blue-600">
                        {result.tasksCount}
                      </p>
                      <p className="text-xs text-gray-600">tasks</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 pt-2">
                    Closing automatically...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-4">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-3xl">❌</span>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-semibold text-red-600">
                    Failed to Generate PRD
                  </h4>
                  <div className="max-w-md mx-auto">
                    <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-md font-mono text-left">
                      {error}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 pt-2">
                    {error.includes('GEMINI_API_KEY') ? (
                      <>Set GEMINI_API_KEY in Cloudflare secrets</>
                    ) : error.includes('quota') ? (
                      <>API quota exceeded. Wait a moment and try again.</>
                    ) : (
                      <>Please try again or check the logs for details.</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {!isGenerating && !isComplete && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerate}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </>
            )}
            {error && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button 
                  onClick={handleGenerate}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Try Again
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

