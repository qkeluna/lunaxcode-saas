'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Check, Rocket, Target, Users } from 'lucide-react';
import Link from 'next/link';

const SERVICES = [
  'E-commerce Website',
  'Business Website',
  'Portfolio Website',
  'Web Application',
  'Mobile App',
  'Custom Development',
];

const FEATURES = [
  'User Authentication',
  'Payment Integration',
  'Admin Dashboard',
  'Content Management',
  'Search Functionality',
  'Email Notifications',
  'File Uploads',
  'Analytics',
  'API Integration',
  'Mobile Responsive',
  'Social Media Integration',
  'Live Chat Support',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service: '',
    description: '',
    features: [] as string[],
    timeline: 30,
    budget: 50000,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceedStep1 = formData.service && formData.description.length > 20;
  const canProceedStep2 = formData.features.length > 0;
  const canProceedStep3 = formData.clientName && formData.clientEmail;

  const handleSubmit = async () => {
    setLoading(true);

    // Store onboarding data in sessionStorage
    sessionStorage.setItem('onboardingData', JSON.stringify(formData));

    // Simulate AI generation delay
    setTimeout(() => {
      // Redirect to signup/login with onboarding context
      router.push('/login?from=onboarding');
    }, 2000);
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

              <div>
                <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Service Type <span style={{ color: 'var(--sp-colors-accent)' }}>*</span>
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
                  style={{
                    padding: 'var(--sp-space-3) var(--sp-space-4)',
                    fontSize: 'var(--sp-font-size)',
                  }}
                  required
                >
                  <option value="">Select a service</option>
                  {SERVICES.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
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

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--sp-space-5)' }}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: 'var(--sp-space-2)' }}>
                    Timeline (days)
                  </label>
                  <input
                    type="number"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: parseInt(e.target.value) })}
                    min="7"
                    max="365"
                    className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
                    style={{
                      padding: 'var(--sp-space-3) var(--sp-space-4)',
                      fontSize: 'var(--sp-font-size)',
                    }}
                  />
                  <p className="text-xs text-gray-500" style={{ marginTop: 'var(--sp-space-2)' }}>
                    Estimated: {Math.ceil(formData.timeline / 7)} weeks
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: 'var(--sp-space-2)' }}>
                    Budget (₱)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                    min="10000"
                    step="5000"
                    className="w-full border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
                    style={{
                      padding: 'var(--sp-space-3) var(--sp-space-4)',
                      fontSize: 'var(--sp-font-size)',
                    }}
                  />
                  <p className="text-xs text-gray-500" style={{ marginTop: 'var(--sp-space-2)' }}>
                    ₱{formData.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-6)' }}>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ marginBottom: 'var(--sp-space-2)' }}>
                  Select required features
                </h2>
                <p className="text-gray-600">Choose all the features you need for your project</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--sp-space-3)' }}>
                {FEATURES.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
                    style={{
                      padding: 'var(--sp-space-4)',
                      borderColor: formData.features.includes(feature) ? 'var(--sp-colors-accent)' : '#e5e7eb',
                      backgroundColor: formData.features.includes(feature) ? 'var(--sp-colors-bg-active)' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            features: [...formData.features, feature],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            features: formData.features.filter((f) => f !== feature),
                          });
                        }
                      }}
                      className="w-5 h-5 rounded"
                      style={{
                        accentColor: 'var(--sp-colors-accent)',
                        marginRight: 'var(--sp-space-3)',
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">{feature}</span>
                  </label>
                ))}
              </div>

              <div
                className="p-5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--sp-colors-bg-active)',
                  borderColor: 'var(--sp-colors-accent)',
                  gap: 'var(--sp-space-2)',
                }}
              >
                <div className="flex items-center" style={{ gap: 'var(--sp-space-2)' }}>
                  <Check className="w-5 h-5" style={{ color: 'var(--sp-colors-accent)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--sp-colors-accent)' }}>
                    {formData.features.length} feature{formData.features.length !== 1 && 's'} selected
                  </p>
                </div>
              </div>
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
                      <p className="text-sm font-semibold text-gray-900">{formData.service}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Timeline</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formData.timeline} days ({Math.ceil(formData.timeline / 7)} weeks)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Budget</p>
                      <p className="text-sm font-semibold text-gray-900">₱{formData.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Features</p>
                      <p className="text-sm font-semibold text-gray-900">{formData.features.length} selected</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-600 font-medium mb-1">Contact</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formData.clientName} • {formData.clientEmail}
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
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
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
