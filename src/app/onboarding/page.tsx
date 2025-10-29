'use client';

/**
 * Onboarding Page - Multi-step form for project creation
 * 
 * SessionStorage Strategy:
 * - Service-scoped caching: Data is stored per service type (e.g., onboardingFormData_1, onboardingFormData_3)
 * - This prevents data mixing when users switch between different service types
 * - Allows users to preserve progress if they go back and select a different service
 * - Cache is cleared after successful submission
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Check, Rocket, Target, Users } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { loadAIConfig, getDefaultProviderConfig } from '@/lib/ai/storage';
import { useAlertDialog } from '@/hooks/use-alert-dialog';
import { AddOnsSelection } from '@/components/onboarding/AddOnsSelection';
import { formatPrice } from '@/lib/utils/pricing';

interface ServiceType {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  timeline: string;
}

interface Question {
  id: number;
  serviceId: number;
  questionKey: string;
  questionText: string;
  questionType: string;
  required: boolean;
  sortOrder: number;
  options: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { showAlert, showError, AlertDialog } = useAlertDialog();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formData, setFormData] = useState({
    serviceId: '',
    serviceName: '',
    description: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    questionAnswers: {} as Record<string, any>,
    selectedAddOnIds: [] as number[],
  });
  const [addOnsTotal, setAddOnsTotal] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Restore form data from sessionStorage on mount (scoped by serviceId)
  useEffect(() => {
    // Get serviceId from URL first
    const urlParams = new URLSearchParams(window.location.search);
    const serviceIdFromUrl = urlParams.get('serviceId');
    
    if (serviceIdFromUrl) {
      // Use service-scoped keys
      const savedFormData = sessionStorage.getItem(`onboardingFormData_${serviceIdFromUrl}`);
      const savedStep = sessionStorage.getItem(`onboardingStep_${serviceIdFromUrl}`);

      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          // Only restore if serviceId matches
          if (parsedData.serviceId === serviceIdFromUrl) {
            setFormData(parsedData);
          }
        } catch (error) {
          console.error('Error restoring form data:', error);
        }
      }

      if (savedStep) {
        setStep(parseInt(savedStep));
      }
    }
  }, []);

  // Auto-save form data to sessionStorage whenever it changes (scoped by serviceId)
  useEffect(() => {
    if (formData.serviceId) {
      // Use service-scoped keys to prevent data mixing between different services
      sessionStorage.setItem(`onboardingFormData_${formData.serviceId}`, JSON.stringify(formData));
      sessionStorage.setItem(`onboardingStep_${formData.serviceId}`, step.toString());
    }
  }, [formData, step]);

  // Fetch service details on mount (from URL param or sessionStorage)
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        // Get serviceId from URL params or sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        const serviceIdFromUrl = urlParams.get('serviceId');
        const serviceIdFromStorage = sessionStorage.getItem('selectedServiceId');
        const serviceId = serviceIdFromUrl || serviceIdFromStorage;

        if (!serviceId) {
          // If no service selected, redirect to pricing page
          router.push('/#pricing');
          return;
        }

        // Fetch the specific service details from public API
        const response = await fetch('/api/public/services');
        if (response.ok) {
          const services = await response.json();
          const service = services.find((s: any) => s.id === parseInt(serviceId));

          if (service) {
            setSelectedService(service);
            setFormData((prev) => ({
              ...prev,
              serviceId: service.id.toString(),
              serviceName: service.name,
            }));
            // Store in sessionStorage for page refreshes
            sessionStorage.setItem('selectedServiceId', service.id.toString());
          } else {
            router.push('/#pricing');
          }
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServiceDetails();
  }, [router]);

  // Fetch questions when service is selected
  useEffect(() => {
    if (formData.serviceId) {
      const fetchQuestions = async () => {
        setQuestionsLoading(true);
        try {
          const response = await fetch(`/api/questions/${formData.serviceId}`);
          if (response.ok) {
            const data = await response.json();
            const sortedQuestions = data.questions.sort((a: Question, b: Question) => a.sortOrder - b.sortOrder);
            setQuestions(sortedQuestions);

            // Pre-select essential sections for Landing Page (supports both 'required_sections' and 'sections' keys)
            const requiredSectionsQuestion = sortedQuestions.find(
              (q: Question) => q.questionKey === 'required_sections' || q.questionKey === 'sections'
            );
            if (requiredSectionsQuestion) {
              const existingAnswer = formData.questionAnswers[requiredSectionsQuestion.questionKey];
              // Only pre-select if there's no existing answer OR if the answer is empty
              const hasNoAnswer = !existingAnswer || (Array.isArray(existingAnswer) && existingAnswer.length === 0);

              if (hasNoAnswer) {
                // Pre-check must-have sections for landing pages
                const mustHaveSections = [
                  'Header (Logo, Navigation)',
                  'Hero Section',
                  'Features/Benefits',
                  'Contact Form',
                  'Footer (Copyright, Links)'
                ];

                setFormData(prev => ({
                  ...prev,
                  questionAnswers: {
                    ...prev.questionAnswers,
                    [requiredSectionsQuestion.questionKey]: mustHaveSections
                  }
                }));
              }
            }

            // Pre-select essential pages for "pages" checkbox question (Business Website)
            const pagesQuestion = sortedQuestions.find((q: Question) => q.questionKey === 'pages');
            if (pagesQuestion) {
              const existingAnswer = formData.questionAnswers[pagesQuestion.questionKey];
              const hasNoAnswer = !existingAnswer || (Array.isArray(existingAnswer) && existingAnswer.length === 0);

              if (hasNoAnswer) {
                // Pre-check essential pages for business websites
                const essentialPages = [
                  'Header (Logo, Navigation)',
                  'Home',
                  'About Us',
                  'Services',
                  'Contact',
                  'Footer (Copyright, Links, Social)'
                ];

                setFormData(prev => ({
                  ...prev,
                  questionAnswers: {
                    ...prev.questionAnswers,
                    [pagesQuestion.questionKey]: essentialPages
                  }
                }));
              }
            }

            // Pre-select essential features for "features" checkbox question (Business Website)
            const featuresQuestion = sortedQuestions.find((q: Question) => q.questionKey === 'features');
            if (featuresQuestion) {
              const existingAnswer = formData.questionAnswers[featuresQuestion.questionKey];
              const hasNoAnswer = !existingAnswer || (Array.isArray(existingAnswer) && existingAnswer.length === 0);

              if (hasNoAnswer) {
                // Pre-check essential features for business websites
                const essentialFeatures = [
                  'Contact Form',
                  'Google Maps'
                ];

                setFormData(prev => ({
                  ...prev,
                  questionAnswers: {
                    ...prev.questionAnswers,
                    [featuresQuestion.questionKey]: essentialFeatures
                  }
                }));
              }
            }
          }
        } catch (error) {
          console.error('Error fetching questions:', error);
        } finally {
          setQuestionsLoading(false);
        }
      };

      fetchQuestions();
    }
  }, [formData.serviceId]);

  // Generate AI suggestions
  const handleGenerateSuggestions = async () => {
    if (!selectedService) return;

    // Get AI config from new multi-provider storage
    const config = loadAIConfig();
    const defaultProviderConfig = getDefaultProviderConfig(config);

    if (!defaultProviderConfig) {
      showError('Please configure a default AI provider in Admin Settings > AI Settings');
      return;
    }

    const aiProvider = defaultProviderConfig.providerId;
    const aiApiKey = defaultProviderConfig.config.apiKey;
    const aiModel = defaultProviderConfig.config.model;

    setSuggestionsLoading(true);
    try {
      const response = await fetch('/api/ai/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: selectedService.name,
          mode: 'generate',
          aiConfig: {
            provider: aiProvider,
            apiKey: aiApiKey,
            model: aiModel || 'gemini-1.5-flash'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions || []);
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      showError('Failed to generate suggestions. Please check your AI settings.');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Enhance existing description
  const handleEnhanceDescription = async () => {
    if (!selectedService || !formData.description) return;

    // Get AI config from new multi-provider storage
    const config = loadAIConfig();
    const defaultProviderConfig = getDefaultProviderConfig(config);

    if (!defaultProviderConfig) {
      showError('Please configure a default AI provider in Admin Settings > AI Settings');
      return;
    }

    const aiProvider = defaultProviderConfig.providerId;
    const aiApiKey = defaultProviderConfig.config.apiKey;
    const aiModel = defaultProviderConfig.config.model;

    setSuggestionsLoading(true);
    try {
      const response = await fetch('/api/ai/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: selectedService.name,
          mode: 'enhance',
          currentDescription: formData.description,
          aiConfig: {
            provider: aiProvider,
            apiKey: aiApiKey,
            model: aiModel || 'gemini-1.5-flash'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.enhanced) {
          setFormData({ ...formData, description: data.enhanced });
        }
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to enhance description');
      }
    } catch (error) {
      console.error('Error enhancing description:', error);
      showError('Failed to enhance description. Please check your AI settings.');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleQuestionAnswer = (questionKey: string, value: any) => {
    setFormData({
      ...formData,
      questionAnswers: {
        ...formData.questionAnswers,
        [questionKey]: value,
      },
    });
  };

  const handleUseSuggestion = (suggestion: string) => {
    setFormData({ ...formData, description: suggestion });
    setAiSuggestions([]); // Clear suggestions after use
  };

  const handleAddOnsChange = (addOnIds: number[], total: number) => {
    setFormData({ ...formData, selectedAddOnIds: addOnIds });
    setAddOnsTotal(total);
  };

  const canProceedStep1 = formData.serviceId && formData.description.length > 20;

  const canProceedStep2 = () => {
    if (questions.length === 0) return true; // No questions for this service

    // Check if all required questions are answered
    const requiredQuestions = questions.filter((q) => q.required);
    return requiredQuestions.every((q) => {
      const answer = formData.questionAnswers[q.questionKey];
      if (q.questionType === 'checkbox') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== null && answer !== '';
    });
  };

  const canProceedStep3 = formData.clientName && formData.clientEmail;

  const renderQuestion = (question: Question) => {
    const value = formData.questionAnswers[question.questionKey];

    switch (question.questionType) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleQuestionAnswer(question.questionKey, e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            style={{
              padding: 'var(--sp-space-3) var(--sp-space-4)',
              fontSize: 'var(--sp-font-size)',
            }}
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleQuestionAnswer(question.questionKey, e.target.value)}
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            style={{
              padding: 'var(--sp-space-4)',
              fontSize: 'var(--sp-font-size)',
            }}
            required={question.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleQuestionAnswer(question.questionKey, e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            style={{
              padding: 'var(--sp-space-3) var(--sp-space-4)',
              fontSize: 'var(--sp-font-size)',
            }}
            required={question.required}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => handleQuestionAnswer(question.questionKey, val)}
            required={question.required}
          >
            <SelectTrigger
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              style={{
                padding: 'var(--sp-space-3) var(--sp-space-4)',
                fontSize: 'var(--sp-font-size)',
                minHeight: '48px',
              }}
              aria-label={question.questionText}
            >
              <SelectValue placeholder="Select an option" className="text-gray-900 dark:text-white" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-[320px]">
              {question.options.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-3)' }}>
            {question.options.map((option) => (
              <label
                key={option}
                className={`flex items-center border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  value === option
                    ? 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/30'
                    : 'border-gray-200 dark:border-gray-700 bg-transparent dark:bg-transparent'
                }`}
                style={{ padding: 'var(--sp-space-3)' }}
              >
                <input
                  type="radio"
                  name={question.questionKey}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleQuestionAnswer(question.questionKey, e.target.value)}
                  className="w-4 h-4 accent-purple-600 dark:accent-purple-500"
                  style={{ marginRight: 'var(--sp-space-3)' }}
                  required={question.required}
                />
                <span className="text-sm font-bold text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div>
            {(question.questionKey === 'required_sections' || question.questionKey === 'sections') && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  💡 <strong>5 essential sections are pre-selected</strong> (Header, Hero, Features, Contact Form, Footer). You can uncheck them if not needed or add more sections.
                </p>
              </div>
            )}
            {question.questionKey === 'pages' && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  💡 <strong>6 essential pages are pre-selected</strong> (Header, Home, About Us, Services, Contact, Footer). You can uncheck them if not needed or add more pages.
                </p>
              </div>
            )}
            {question.questionKey === 'features' && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  💡 <strong>2 essential features are pre-selected</strong> (Contact Form, Google Maps). You can uncheck them if not needed or add more features.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--sp-space-3)' }}>
              {question.options.map((option) => {
                const checkedValues = (value as string[]) || [];
                const isChecked = checkedValues.includes(option);

                return (
                  <label
                    key={option}
                    className={`flex items-center border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isChecked
                        ? 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/30'
                        : 'border-gray-200 dark:border-gray-700 bg-transparent dark:bg-transparent'
                    }`}
                    style={{ padding: 'var(--sp-space-4)' }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const currentValues = (value as string[]) || [];
                        if (e.target.checked) {
                          handleQuestionAnswer(question.questionKey, [...currentValues, option]);
                        } else {
                          handleQuestionAnswer(
                            question.questionKey,
                            currentValues.filter((v) => v !== option)
                          );
                        }
                      }}
                      className="w-5 h-5 rounded accent-purple-600 dark:accent-purple-500"
                      style={{ marginRight: 'var(--sp-space-3)' }}
                    />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      default:
        return <p className="text-gray-500">Unsupported question type: {question.questionType}</p>;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Store onboarding data in sessionStorage for post-login processing
    sessionStorage.setItem('onboardingData', JSON.stringify(formData));
    
    // Clear service-scoped cache since submission is complete
    if (formData.serviceId) {
      sessionStorage.removeItem(`onboardingFormData_${formData.serviceId}`);
      sessionStorage.removeItem(`onboardingStep_${formData.serviceId}`);
    }

    // Small delay for visual feedback
    setTimeout(() => {
      // Redirect to login with onboarding context
      // After login, user will be redirected to /onboarding/complete
      router.push('/login?callbackUrl=/onboarding/complete');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10" aria-hidden="true">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600 dark:bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500 dark:bg-blue-600 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto" style={{ padding: 'var(--sp-space-4) var(--sp-space-6)' }}>
          <Link href="/" className="flex items-center" style={{ gap: 'var(--sp-space-2)' }}>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              Lunaxcode
            </span>
          </Link>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto" style={{ padding: 'var(--sp-space-6)' }}>
        <div
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl"
          style={{ padding: 'var(--sp-space-8)' }}
        >
          {/* Header */}
          <div className="text-center" style={{ marginBottom: 'var(--sp-space-8)' }}>
            <div className="inline-flex items-center backdrop-blur-sm rounded-full text-sm font-bold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400" style={{ gap: 'var(--sp-space-2)', padding: 'var(--sp-space-2) var(--sp-space-5)', marginBottom: 'var(--sp-space-4)' }}>
              <Sparkles className="w-4 h-4" fill="currentColor" />
              <span>AI-Powered Project Planning</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white" style={{ marginBottom: 'var(--sp-space-4)', letterSpacing: '-0.02em' }}>
              Start Your Project
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              Tell us about your vision and we&apos;ll generate a comprehensive plan in seconds
            </p>
          </div>

          {/* Visual Step Indicator */}
          <div style={{ marginBottom: 'var(--sp-space-8)' }}>
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {stepNum > 1 && (
                      <div
                        className="flex-1 h-1 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: step >= stepNum ? 'var(--sp-colors-accent)' : '#e5e7eb',
                        }}
                      />
                    )}
                    <div
                      className="relative flex items-center justify-center rounded-full font-bold transition-all duration-500"
                      style={{
                        width: 'var(--sp-space-8)',
                        height: 'var(--sp-space-8)',
                        backgroundColor: step >= stepNum ? 'var(--sp-colors-accent)' : '#e5e7eb',
                        color: step >= stepNum ? 'white' : '#9ca3af',
                        transform: step === stepNum ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      {step > stepNum ? (
                        <Check className="w-5 h-5" />
                      ) : stepNum === 1 ? (
                        <Target className="w-4 h-4" />
                      ) : stepNum === 2 ? (
                        <Rocket className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </div>
                    {stepNum < 3 && (
                      <div
                        className="flex-1 h-1 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: step > stepNum ? 'var(--sp-colors-accent)' : '#e5e7eb',
                        }}
                      />
                    )}
                  </div>
                  <span
                    className="text-xs font-bold mt-2 text-center"
                    style={{
                      color: step >= stepNum ? 'var(--sp-colors-accent)' : '#9ca3af',
                    }}
                  >
                    {stepNum === 1 && 'Details'}
                    {stepNum === 2 && 'Features'}
                    {stepNum === 3 && 'Contact'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Project Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-6)' }}>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white" style={{ marginBottom: 'var(--sp-space-2)', letterSpacing: '-0.02em' }}>
                  Why do you want to build this?
                </h2>
                <p className="text-gray-600 dark:text-gray-300">Share your goals and what you&apos;re trying to achieve</p>
              </div>

              {/* Selected Service Display */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Selected Service
                </label>
                {servicesLoading ? (
                  <div
                    className="border-2 rounded-xl animate-pulse"
                    style={{
                      padding: 'var(--sp-space-4)',
                      borderColor: '#e5e7eb',
                      backgroundColor: '#f9fafb',
                    }}
                    role="status"
                    aria-label="Loading service details"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="h-8 bg-gray-300 rounded w-20 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ) : selectedService ? (
                  <div className="border-2 rounded-xl border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30" style={{ padding: 'var(--sp-space-4)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{selectedService.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedService.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          ₱{(selectedService.basePrice / 1000).toFixed(0)}k
                        </p>
                        {selectedService.timeline && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedService.timeline}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  <label
                    htmlFor="project-description"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300"
                  >
                    Project Description <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>

                  {/* AI Action Buttons */}
                  <div className="flex items-center gap-2">
                    {formData.description.length === 0 ? (
                      <button
                        type="button"
                        onClick={handleGenerateSuggestions}
                        disabled={suggestionsLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 disabled:opacity-50"
                        style={{ minHeight: '32px' }}
                      >
                        {suggestionsLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" fill="currentColor" />
                            <span>Generate</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnhanceDescription}
                        disabled={suggestionsLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 disabled:opacity-50"
                        style={{ minHeight: '32px' }}
                      >
                        {suggestionsLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Enhancing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" fill="currentColor" />
                            <span>Enhance</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        Example intentions - Click to use or get inspired
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleUseSuggestion(suggestion)}
                          className="text-left p-3 text-sm border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all duration-200 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 group"
                        >
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                            <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className={`w-full border rounded-xl transition-all duration-200 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                    formData.description.length > 0 && formData.description.length < 20
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500'
                      : formData.description.length >= 20
                      ? 'border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  style={{
                    padding: 'var(--sp-space-4)',
                    fontSize: 'var(--sp-font-size)',
                  }}
                  placeholder="Tell us WHY you want to build this project... What problem are you trying to solve? What are your goals?"
                  required
                  aria-describedby="description-hint description-counter"
                  aria-invalid={formData.description.length > 0 && formData.description.length < 20}
                />
                <div className="flex items-center justify-between mt-2">
                  <p id="description-hint" className="text-xs text-gray-600 dark:text-gray-400">
                    {formData.description.length === 0
                      ? 'Minimum 20 characters required'
                      : formData.description.length < 20
                      ? `${20 - formData.description.length} more characters needed`
                      : '✓ Great! Your description looks good'
                    }
                  </p>
                  <p
                    id="description-counter"
                    className={`text-xs font-bold ${
                      formData.description.length >= 20 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formData.description.length} characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Questions */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-6)' }}>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white" style={{ marginBottom: 'var(--sp-space-2)', letterSpacing: '-0.02em' }}>
                  Project Requirements
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {questionsLoading
                    ? 'Loading questions...'
                    : questions.length > 0
                    ? 'Tell us more about your specific needs'
                    : 'No additional questions for this service'}
                </p>
              </div>

              {questionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
                </div>
              ) : questions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-5)' }}>
                  {questions.map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300" style={{ marginBottom: 'var(--sp-space-2)' }}>
                        {question.questionText}
                        {question.required && <span className="text-purple-600 dark:text-purple-400"> *</span>}
                      </label>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="p-6 rounded-xl border text-center"
                  style={{
                    backgroundColor: 'var(--sp-colors-bg-active)',
                    borderColor: 'var(--sp-colors-accent)',
                  }}
                >
                  <Check className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--sp-colors-accent)' }} />
                  <p className="text-sm font-bold" style={{ color: 'var(--sp-colors-accent)' }}>
                    No additional requirements needed
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    You can proceed to the next step
                  </p>
                </div>
              )}

              {questions.length > 0 && !questionsLoading && (
                <div
                  className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--sp-colors-bg-active)',
                    borderColor: 'var(--sp-colors-accent)',
                  }}
                >
                  <div className="flex items-center" style={{ gap: 'var(--sp-space-2)' }}>
                    <Check className="w-5 h-5" style={{ color: 'var(--sp-colors-accent)' }} />
                    <p className="text-sm font-bold" style={{ color: 'var(--sp-colors-accent)' }}>
                      {(() => {
                        const requiredQuestions = questions.filter(q => q.required);
                        const answeredRequired = requiredQuestions.filter(q => {
                          const answer = formData.questionAnswers[q.questionKey];
                          if (q.questionType === 'checkbox') {
                            return Array.isArray(answer) && answer.length > 0;
                          }
                          return answer !== undefined && answer !== null && answer !== '';
                        }).length;
                        return `${answeredRequired} of ${requiredQuestions.length} required question${requiredQuestions.length !== 1 ? 's' : ''} answered`;
                      })()}
                    </p>
                  </div>
                </div>
              )}

              {/* Add-ons Selection */}
              {selectedService && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div style={{ marginBottom: 'var(--sp-space-4)' }}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ marginBottom: 'var(--sp-space-2)' }}>
                      Optional Add-ons
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Enhance your project with additional integrations and services
                    </p>
                  </div>
                  <AddOnsSelection
                    selectedAddOnIds={formData.selectedAddOnIds}
                    onSelectionChange={handleAddOnsChange}
                    basePrice={selectedService.basePrice}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Client Info */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-6)' }}>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white" style={{ marginBottom: 'var(--sp-space-2)', letterSpacing: '-0.02em' }}>
                  Your Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300">How should we contact you about this project?</p>
              </div>

              <div>
                <label
                  htmlFor="client-name"
                  className="block text-sm font-bold text-gray-700 dark:text-gray-300"
                  style={{ marginBottom: 'var(--sp-space-2)' }}
                >
                  Your Name <span className="text-purple-600 dark:text-purple-400">*</span>
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className={`w-full border rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    formData.clientName.length > 0
                      ? 'border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  style={{
                    padding: 'var(--sp-space-3) var(--sp-space-4)',
                    fontSize: 'var(--sp-font-size)',
                  }}
                  placeholder="John Doe"
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="client-email"
                  className="block text-sm font-bold text-gray-700 dark:text-gray-300"
                  style={{ marginBottom: 'var(--sp-space-2)' }}
                >
                  Your Email <span className="text-purple-600 dark:text-purple-400">*</span>
                </label>
                <input
                  id="client-email"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className={`w-full border rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    formData.clientEmail.length > 0 && !formData.clientEmail.includes('@')
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500'
                      : formData.clientEmail.includes('@') && formData.clientEmail.includes('.')
                      ? 'border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  style={{
                    padding: 'var(--sp-space-3) var(--sp-space-4)',
                    fontSize: 'var(--sp-font-size)',
                  }}
                  placeholder="john@example.com"
                  required
                  aria-required="true"
                  aria-describedby="email-hint"
                  aria-invalid={formData.clientEmail.length > 0 && !formData.clientEmail.includes('@')}
                />
                {formData.clientEmail.length > 0 && !formData.clientEmail.includes('@') && (
                  <p id="email-hint" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Please enter a valid email address
                  </p>
                )}
                {formData.clientEmail.includes('@') && formData.clientEmail.includes('.') && (
                  <p id="email-hint" className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Email looks good!
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="client-phone"
                  className="block text-sm font-bold text-gray-700 dark:text-gray-300"
                  style={{ marginBottom: 'var(--sp-space-2)' }}
                >
                  Phone Number <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  id="client-phone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-500 dark:focus:border-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  style={{
                    padding: 'var(--sp-space-3) var(--sp-space-4)',
                    fontSize: 'var(--sp-font-size)',
                  }}
                  placeholder="+63 912 345 6789"
                  aria-describedby="phone-hint"
                />
                <p id="phone-hint" className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  For faster communication. We&apos;ll use this for urgent project updates.
                </p>
              </div>

              {/* Summary */}
              <div className="border-2 rounded-2xl overflow-hidden border-purple-200 dark:border-purple-800" style={{ marginTop: 'var(--sp-space-4)' }}>
                <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center" style={{ gap: 'var(--sp-space-2)', marginBottom: 'var(--sp-space-4)' }}>
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" />
                    Project Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--sp-space-4)' }}>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">Service</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{formData.serviceName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">Base Price</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {selectedService ? formatPrice(selectedService.basePrice) : 'N/A'}
                      </p>
                    </div>
                    {addOnsTotal > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">Add-ons ({formData.selectedAddOnIds.length})</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatPrice(addOnsTotal)}
                        </p>
                      </div>
                    )}
                    {(selectedService && addOnsTotal > 0) && (
                      <div className="md:col-span-2 pt-3 border-t border-purple-200 dark:border-purple-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">Total Project Cost</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {formatPrice(selectedService.basePrice + addOnsTotal)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          50% deposit: {formatPrice((selectedService.basePrice + addOnsTotal) / 2)}
                        </p>
                      </div>
                    )}
                    {selectedService?.timeline && (
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">Estimated Timeline</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedService.timeline}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">Requirements Answered</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {(() => {
                          const requiredQuestions = questions.filter(q => q.required);
                          const answeredRequired = requiredQuestions.filter(q => {
                            const answer = formData.questionAnswers[q.questionKey];
                            if (q.questionType === 'checkbox') {
                              return Array.isArray(answer) && answer.length > 0;
                            }
                            return answer !== undefined && answer !== null && answer !== '';
                          }).length;
                          return `${answeredRequired} of ${requiredQuestions.length} required`;
                        })()}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">Contact Information</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {formData.clientName} • {formData.clientEmail}
                        {formData.clientPhone && ` • ${formData.clientPhone}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Next Step:</strong> After submitting, you&apos;ll create an account to access your personalized project plan and dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div
            className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700"
            style={{ marginTop: 'var(--sp-space-8)', paddingTop: 'var(--sp-space-6)' }}
          >
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-bold hover:shadow-md py-3 px-6"
                style={{
                  gap: 'var(--sp-space-2)',
                  minHeight: '48px',
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-bold"
                style={{ gap: 'var(--sp-space-2)', padding: 'var(--sp-space-3)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2()}
                className="flex items-center text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl hover:scale-105 py-3 px-8"
                style={{
                  gap: 'var(--sp-space-2)',
                  minHeight: '48px',
                  background: `linear-gradient(to right, var(--sp-colors-accent), #6366f1)`,
                }}
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceedStep3}
                className="flex items-center text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl hover:scale-105 py-3 px-8"
                style={{
                  gap: 'var(--sp-space-2)',
                  minHeight: '48px',
                  background: loading
                    ? '#9ca3af'
                    : 'linear-gradient(to right, #10b981, #059669)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" fill="currentColor" />
                    Continue to Account Creation
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
