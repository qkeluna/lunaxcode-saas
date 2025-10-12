'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Lunaxcode
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Project Planning
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Start Your Project
            </h1>
            <p className="text-gray-600 text-lg">
              Tell us about your vision and we'll generate a comprehensive plan in seconds
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {step} of 3
              </span>
              <span className="text-sm text-gray-500">
                {step === 1 && 'Project Details'}
                {step === 2 && 'Requirements'}
                {step === 3 && 'Contact Information'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Tell us about your project</h2>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Service Type *
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your project in detail... What problem does it solve? Who are your target users?"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.description.length} / 500 characters (minimum 20)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Timeline (days)
                  </label>
                  <input
                    type="number"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: parseInt(e.target.value) })}
                    min="7"
                    max="365"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Estimated: {Math.ceil(formData.timeline / 7)} weeks
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Budget (₱)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                    min="10000"
                    step="5000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ₱{formData.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Select required features</h2>
              <p className="text-gray-600">Choose all the features you need for your project</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FEATURES.map((feature) => (
                  <label
                    key={feature}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.features.includes(feature)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
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
                      className="mr-3 w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{feature}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>{formData.features.length}</strong> features selected
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Client Info */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Information</h2>
              <p className="text-gray-600">How should we contact you about this project?</p>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+63 912 345 6789"
                />
              </div>

              {/* Summary */}
              <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Project Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Service:</strong> {formData.service}</p>
                  <p><strong>Timeline:</strong> {formData.timeline} days ({Math.ceil(formData.timeline / 7)} weeks)</p>
                  <p><strong>Budget:</strong> ₱{formData.budget.toLocaleString()}</p>
                  <p><strong>Features:</strong> {formData.features.length} selected</p>
                  <p><strong>Contact:</strong> {formData.clientName} ({formData.clientEmail})</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Next Step:</strong> After submitting, you'll create an account to access your personalized project plan and dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Home
              </Link>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceedStep3}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
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
