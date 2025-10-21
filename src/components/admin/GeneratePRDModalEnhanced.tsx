'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, CheckCircle2, Loader2, Copy, Check, Eye, EyeOff, Code2 } from 'lucide-react';
import { loadAIConfig, getDefaultProviderConfig } from '@/lib/ai/storage';
import { getProvider } from '@/lib/ai/config';

interface GeneratePRDModalEnhancedProps {
  projectId: number;
  projectName: string;
  onSuccess: () => void;
}

interface PromptData {
  prd: {
    provider: string;
    model: string;
    googlePayload: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: any;
    };
    openaiLikePayload: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: any;
    };
    metadata: {
      serviceName: string;
      descriptionLength: number;
      requirementsCount: number;
      estimatedTokens: number;
    };
  };
  tasks: {
    provider: string;
    model: string;
    googlePayload: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: any;
    };
    openaiLikePayload: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: any;
    };
    metadata: {
      prdAvailable: boolean;
      prdLength: number;
      estimatedTokens: number;
    };
  };
  project: {
    id: number;
    name: string;
    service: string;
    description: string;
    questionAnswers: Record<string, any>;
  };
}

const loadingSteps = [
  { text: 'Analyzing project requirements...', duration: 3000 },
  { text: 'Consulting AI for optimal structure...', duration: 4000 },
  { text: 'Generating comprehensive PRD...', duration: 8000 },
  { text: 'Creating detailed task breakdown...', duration: 6000 },
  { text: 'Mapping dependencies and priorities...', duration: 4000 },
  { text: 'Finalizing project plan...', duration: 3000 },
];

export default function GeneratePRDModalEnhanced({
  projectId,
  projectName,
  onSuccess,
}: GeneratePRDModalEnhancedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ prdLength: number; tasksCount: number } | null>(null);

  // Prompt preview states
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [copiedPRD, setCopiedPRD] = useState(false);
  const [copiedTasks, setCopiedTasks] = useState(false);
  const [activePromptTab, setActivePromptTab] = useState('prd');

  const handleOpen = () => {
    setIsOpen(true);
    setIsGenerating(false);
    setCurrentStep(0);
    setIsComplete(false);
    setError(null);
    setResult(null);
    setShowPromptPreview(false);
    setPromptData(null);
  };

  const handleClose = () => {
    if (!isGenerating) {
      setIsOpen(false);
    }
  };

  // Load prompt preview
  const loadPromptPreview = async () => {
    setLoadingPrompt(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/preview-prompt`);
      const data = await response.json();

      if (response.ok && data.success) {
        setPromptData(data.data);
        setShowPromptPreview(true);
      } else {
        setError(data.error || 'Failed to load prompt preview');
      }
    } catch (err) {
      setError('Failed to load prompt preview');
      console.error('Error loading prompt:', err);
    } finally {
      setLoadingPrompt(false);
    }
  };

  // Copy to clipboard (JSON format)
  const copyToClipboard = async (payload: any, type: 'prd' | 'tasks') => {
    try {
      const jsonString = JSON.stringify(payload, null, 2);
      await navigator.clipboard.writeText(jsonString);
      if (type === 'prd') {
        setCopiedPRD(true);
        setTimeout(() => setCopiedPRD(false), 2000);
      } else {
        setCopiedTasks(true);
        setTimeout(() => setCopiedTasks(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleGenerate = async () => {
    // Check if AI is configured using new multi-provider system
    const config = loadAIConfig();
    const defaultProviderConfig = getDefaultProviderConfig(config);

    if (!defaultProviderConfig) {
      setError('Please configure a default AI provider in Settings → AI Settings first.');
      return;
    }

    const provider = getProvider(defaultProviderConfig.providerId);
    if (!provider) {
      setError('Invalid AI provider configuration.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentStep(0);
    setShowPromptPreview(false); // Hide preview during generation

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
            provider: defaultProviderConfig.providerId,
            apiKey: defaultProviderConfig.config.apiKey,
            model: defaultProviderConfig.config.model
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

  // JSON viewer with syntax highlighting
  const JsonViewer = ({ data }: { data: any }) => {
    const jsonString = JSON.stringify(data, null, 2);
    const lines = jsonString.split('\n');

    return (
      <div className="font-mono text-xs leading-relaxed">
        {lines.map((line, idx) => {
          // Property names (keys)
          if (line.includes(':')) {
            const [key, ...rest] = line.split(':');
            return (
              <div key={idx} className="text-gray-700">
                <span className="text-blue-600">{key}</span>
                <span>:{rest.join(':')}</span>
              </div>
            );
          }
          // String values
          if (line.includes('"') && !line.includes(':')) {
            return (
              <div key={idx} className="text-green-700">
                {line}
              </div>
            );
          }
          // Numbers and booleans
          if (/\d+/.test(line) || /true|false/.test(line)) {
            return (
              <div key={idx} className="text-orange-600">
                {line}
              </div>
            );
          }
          // Brackets and braces
          return (
            <div key={idx} className="text-gray-600">
              {line || '\u00A0'}
            </div>
          );
        })}
      </div>
    );
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
        <DialogContent className={showPromptPreview ? "sm:max-w-[95vw] max-h-[90vh]" : "sm:max-w-[600px]"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate PRD & Tasks with AI
            </DialogTitle>
            <DialogDescription>
              {projectName}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {!isGenerating && !isComplete && !error && (
              <div className="space-y-4">
                {/* Toggle Prompt Preview Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (showPromptPreview) {
                        setShowPromptPreview(false);
                      } else {
                        loadPromptPreview();
                      }
                    }}
                    disabled={loadingPrompt}
                    className="text-sm"
                  >
                    {loadingPrompt ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading Preview...
                      </>
                    ) : showPromptPreview ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide JSON Prompt
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview JSON Prompt
                      </>
                    )}
                  </Button>
                </div>

                <div className={`grid ${showPromptPreview ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}>
                  {/* Left Panel - Information */}
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

                    {promptData && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Project Details</h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div><span className="font-medium">Service:</span> {promptData.project.service}</div>
                          <div><span className="font-medium">Description:</span> {promptData.project.descriptionLength} chars</div>
                          <div><span className="font-medium">Requirements:</span> {promptData.prd.metadata.requirementsCount} items</div>
                          <div><span className="font-medium">Est. Tokens:</span> ~{promptData.prd.metadata.estimatedTokens.toLocaleString()}</div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <p className="text-sm text-amber-600">
                        ⚠️ This will replace any existing PRD and tasks.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Expected time: 20-40 seconds
                      </p>
                    </div>
                  </div>

                  {/* Right Panel - JSON Prompt Preview */}
                  {showPromptPreview && promptData && (
                    <div className="border-l pl-4 max-h-[500px] overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-purple-600" />
                          Prompt Preview
                        </h4>
                      </div>

                      <Tabs value={activePromptTab} onValueChange={setActivePromptTab} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="prd">PRD Request</TabsTrigger>
                          <TabsTrigger value="tasks">Tasks Request</TabsTrigger>
                        </TabsList>

                        <TabsContent value="prd" className="flex-1 overflow-y-auto mt-2 space-y-2">
                          {/* Google Gemini Format */}
                          <div className="border rounded-lg bg-gray-50 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold text-gray-700">Google Gemini Format</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(promptData.prd.googlePayload, 'prd')}
                                className="h-7 text-xs"
                              >
                                {copiedPRD ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy JSON
                                  </>
                                )}
                              </Button>
                            </div>
                            <JsonViewer data={promptData.prd.googlePayload} />
                          </div>

                          {/* OpenAI-like Format */}
                          <div className="border rounded-lg bg-gray-50 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold text-gray-700">OpenAI / Anthropic / Other Format</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(promptData.prd.openaiLikePayload, 'prd')}
                                className="h-7 text-xs"
                              >
                                {copiedPRD ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy JSON
                                  </>
                                )}
                              </Button>
                            </div>
                            <JsonViewer data={promptData.prd.openaiLikePayload} />
                          </div>
                        </TabsContent>

                        <TabsContent value="tasks" className="flex-1 overflow-y-auto mt-2 space-y-2">
                          {!promptData.tasks.metadata.prdAvailable && (
                            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                              ℹ️ Tasks request will use PRD after it&apos;s generated
                            </div>
                          )}

                          {/* Google Gemini Format */}
                          <div className="border rounded-lg bg-gray-50 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold text-gray-700">Google Gemini Format</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(promptData.tasks.googlePayload, 'tasks')}
                                className="h-7 text-xs"
                              >
                                {copiedTasks ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy JSON
                                  </>
                                )}
                              </Button>
                            </div>
                            <JsonViewer data={promptData.tasks.googlePayload} />
                          </div>

                          {/* OpenAI-like Format */}
                          <div className="border rounded-lg bg-gray-50 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold text-gray-700">OpenAI / Anthropic / Other Format</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(promptData.tasks.openaiLikePayload, 'tasks')}
                                className="h-7 text-xs"
                              >
                                {copiedTasks ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy JSON
                                  </>
                                )}
                              </Button>
                            </div>
                            <JsonViewer data={promptData.tasks.openaiLikePayload} />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
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
                    Error
                  </h4>
                  <div className="max-w-md mx-auto">
                    <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-md font-mono text-left">
                      {error}
                    </p>
                  </div>
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
                  disabled={loadingPrompt}
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
