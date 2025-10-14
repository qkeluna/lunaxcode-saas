'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Check, Rocket, Target, Users } from 'lucide-react';
import Link from 'next/link';

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
  });

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

        // Fetch the specific service details
        const response = await fetch('/api/admin/cms/services');
        if (response.ok) {
          const data = await response.json();
          const service = data.services.find((s: any) => s.id === parseInt(serviceId));

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
            setQuestions(data.questions.sort((a: Question, b: Question) => a.sortOrder - b.sortOrder));
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
            className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
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
            className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400 resize-none"
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
            className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
            style={{
              padding: 'var(--sp-space-3) var(--sp-space-4)',
              fontSize: 'var(--sp-font-size)',
            }}
            required={question.required}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleQuestionAnswer(question.questionKey, e.target.value)}
            className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
            style={{
              padding: 'var(--sp-space-3) var(--sp-space-4)',
              fontSize: 'var(--sp-font-size)',
            }}
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-3)' }}>
            {question.options.map((option) => (
              <label
                key={option}
                className="flex items-center border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{
                  padding: 'var(--sp-space-3)',
                  borderColor: value === option ? 'var(--sp-colors-accent)' : '#e5e7eb',
                  backgroundColor: value === option ? 'var(--sp-colors-bg-active)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name={question.questionKey}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleQuestionAnswer(question.questionKey, e.target.value)}
                  className="w-4 h-4"
                  style={{
                    accentColor: 'var(--sp-colors-accent)',
                    marginRight: 'var(--sp-space-3)',
                  }}
                  required={question.required}
                />
                <span className="text-sm font-medium text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--sp-space-3)' }}>
            {question.options.map((option) => {
              const checkedValues = (value as string[]) || [];
              const isChecked = checkedValues.includes(option);

              return (
                <label
                  key={option}
                  className="flex items-center border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
                  style={{
                    padding: 'var(--sp-space-4)',
                    borderColor: isChecked ? 'var(--sp-colors-accent)' : '#e5e7eb',
                    backgroundColor: isChecked ? 'var(--sp-colors-bg-active)' : 'transparent',
                  }}
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
                    className="w-5 h-5 rounded"
                    style={{
                      accentColor: 'var(--sp-colors-accent)',
                      marginRight: 'var(--sp-space-3)',
                    }}
                  />
                  <span className="text-sm font-medium text-gray-900">{option}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return <p className="text-gray-500">Unsupported question type: {question.questionType}</p>;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Store onboarding data in sessionStorage
    sessionStorage.setItem('onboardingData', JSON.stringify(formData));

    // Small delay for visual feedback
    setTimeout(() => {
      // Redirect to login with onboarding context
      // After login, user will be redirected to /onboarding/complete
      router.push('/login?callbackUrl=/onboarding/complete');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--sp-colors-accent)' }}
        />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto" style={{ padding: 'var(--sp-space-4) var(--sp-space-6)' }}>
          <Link href="/" className="flex items-center" style={{ gap: 'var(--sp-space-2)' }}>
            <span
              className="text-2xl font-bold"
              style={{
                background: `linear-gradient(to right, var(--sp-colors-accent), #6366f1)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Lunaxcode
            </span>
          </Link>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto" style={{ padding: 'var(--sp-space-6)' }}>
        <div
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl"
          style={{ padding: 'var(--sp-space-8)' }}
        >
          {/* Header */}
          <div className="text-center" style={{ marginBottom: 'var(--sp-space-8)' }}>
            <div
              className="inline-flex items-center backdrop-blur-sm rounded-full text-sm font-medium"
              style={{
                gap: 'var(--sp-space-2)',
                padding: 'var(--sp-space-2) var(--sp-space-5)',
                backgroundColor: 'var(--sp-colors-bg-active)',
                color: 'var(--sp-colors-accent)',
                marginBottom: 'var(--sp-space-4)',
              }}
            >
              <Sparkles className="w-4 h-4" fill="currentColor" />
              <span>AI-Powered Project Planning</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900" style={{ marginBottom: 'var(--sp-space-4)' }}>
              Start Your Project
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              Tell us about your vision and we'll generate a comprehensive plan in seconds
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
                      className="relative flex items-center justify-center rounded-full font-semibold transition-all duration-500"
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
                    className="text-xs font-medium mt-2 text-center"
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
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Tell us about your project
                </h2>
                <p className="text-gray-600">Share your vision and we'll bring it to life</p>
              </div>

              {/* Selected Service Display */}
              <div>
                <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Selected Service
                </label>
                {servicesLoading ? (
                  <div className="flex items-center border border-gray-300 rounded-xl" style={{ padding: 'var(--sp-space-3) var(--sp-space-4)' }}>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" style={{ color: 'var(--sp-colors-accent)' }} />
                    <span className="text-gray-500">Loading service...</span>
                  </div>
                ) : selectedService ? (
                  <div
                    className="border-2 rounded-xl"
                    style={{
                      padding: 'var(--sp-space-4)',
                      borderColor: 'var(--sp-colors-accent)',
                      backgroundColor: 'var(--sp-colors-bg-active)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{selectedService.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: 'var(--sp-colors-accent)' }}>
                          ₱{(selectedService.basePrice / 1000).toFixed(0)}k
                        </p>
                        {selectedService.timeline && (
                          <p className="text-xs text-gray-600 mt-1">{selectedService.timeline}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Project Description <span style={{ color: 'var(--sp-colors-accent)' }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400 resize-none"
                  style={{
                    padding: 'var(--sp-space-4)',
                    fontSize: 'var(--sp-font-size)',
                  }}
                  placeholder="Describe your project in detail... What problem does it solve? Who are your target users?"
                  required
                />
                <p
                  className="text-xs mt-1"
                  style={{
                    color: formData.description.length >= 20 ? '#10b981' : '#9ca3af',
                    marginTop: 'var(--sp-space-2)',
                  }}
                >
                  {formData.description.length} / 500 characters {formData.description.length >= 20 && '✓'}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Project Questions */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-6)' }}>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Project Requirements
                </h2>
                <p className="text-gray-600">
                  {questionsLoading
                    ? 'Loading questions...'
                    : questions.length > 0
                    ? 'Tell us more about your specific needs'
                    : 'No additional questions for this service'}
                </p>
              </div>

              {questionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--sp-colors-accent)' }} />
                </div>
              ) : questions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-5)' }}>
                  {questions.map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: 'var(--sp-space-2)' }}>
                        {question.questionText}
                        {question.required && <span style={{ color: 'var(--sp-colors-accent)' }}> *</span>}
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
                  <p className="text-sm font-semibold" style={{ color: 'var(--sp-colors-accent)' }}>
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
                    <p className="text-sm font-semibold" style={{ color: 'var(--sp-colors-accent)' }}>
                      {Object.keys(formData.questionAnswers).length} of {questions.length} question
                      {questions.length !== 1 && 's'} answered
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Client Info */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-6)' }}>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Your Information
                </h2>
                <p className="text-gray-600">How should we contact you about this project?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Your Name <span style={{ color: 'var(--sp-colors-accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
                  style={{
                    padding: 'var(--sp-space-3) var(--sp-space-4)',
                    fontSize: 'var(--sp-font-size)',
                  }}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Your Email <span style={{ color: 'var(--sp-colors-accent)' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
                  style={{
                    padding: 'var(--sp-space-3) var(--sp-space-4)',
                    fontSize: 'var(--sp-font-size)',
                  }}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
                  style={{
                    padding: 'var(--sp-space-3) var(--sp-space-4)',
                    fontSize: 'var(--sp-font-size)',
                  }}
                  placeholder="+63 912 345 6789"
                />
              </div>

              {/* Summary */}
              <div
                className="border-2 rounded-2xl overflow-hidden"
                style={{
                  marginTop: 'var(--sp-space-4)',
                  borderColor: 'var(--sp-colors-accent)',
                }}
              >
                <div
                  className="p-5"
                  style={{
                    background: `linear-gradient(135deg, var(--sp-colors-bg-active) 0%, rgba(120, 40, 200, 0.05) 100%)`,
                  }}
                >
                  <h3 className="font-bold text-gray-900 flex items-center" style={{ gap: 'var(--sp-space-2)', marginBottom: 'var(--sp-space-4)' }}>
                    <Sparkles className="w-5 h-5" style={{ color: 'var(--sp-colors-accent)' }} fill="currentColor" />
                    Project Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--sp-space-4)' }}>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Service</p>
                      <p className="text-sm font-semibold text-gray-900">{formData.serviceName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Base Price</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ₱{selectedService ? (selectedService.basePrice / 1000).toFixed(0) + 'k' : 'N/A'}
                      </p>
                    </div>
                    {selectedService?.timeline && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Estimated Timeline</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedService.timeline}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Requirements Answered</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {Object.keys(formData.questionAnswers).length} of {questions.length}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-600 font-medium mb-1">Contact Information</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formData.clientName} • {formData.clientEmail}
                        {formData.clientPhone && ` • ${formData.clientPhone}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900">
                  <strong>Next Step:</strong> After submitting, you'll create an account to access your personalized project plan and dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div
            className="flex items-center justify-between border-t border-gray-200"
            style={{ marginTop: 'var(--sp-space-8)', paddingTop: 'var(--sp-space-6)' }}
          >
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold hover:shadow-md"
                style={{
                  gap: 'var(--sp-space-2)',
                  padding: 'var(--sp-space-3) var(--sp-space-6)',
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
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
                className="flex items-center text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                style={{
                  gap: 'var(--sp-space-2)',
                  padding: 'var(--sp-space-4) var(--sp-space-8)',
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
                className="flex items-center text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                style={{
                  gap: 'var(--sp-space-2)',
                  padding: 'var(--sp-space-4) var(--sp-space-8)',
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
    </div>
  );
}
