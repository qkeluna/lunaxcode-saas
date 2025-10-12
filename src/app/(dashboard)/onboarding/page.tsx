'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

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
  const [error, setError] = useState('');
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
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const data = await response.json();
      router.push(`/projects/${data.projectId}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">
            Tell us about your project and our AI will generate a comprehensive plan
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
              {step === 3 && 'Client Information'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your project in detail... What problem does it solve? Who are your target users?"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length} / 500 characters (minimum 20)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((feature) => (
                <label
                  key={feature}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.features.includes(feature)
                      ? 'border-blue-500 bg-blue-50'
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
                    className="mr-3 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">{feature}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{formData.features.length}</strong> features selected
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Client Info */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Client Information</h2>
            <p className="text-gray-600">Who is this project for?</p>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Client Email *
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Client Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+63 912 345 6789"
              />
            </div>

            {/* Summary */}
            <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Project Summary</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Service:</strong> {formData.service}</p>
                <p><strong>Timeline:</strong> {formData.timeline} days ({Math.ceil(formData.timeline / 7)} weeks)</p>
                <p><strong>Budget:</strong> ₱{formData.budget.toLocaleString()}</p>
                <p><strong>Features:</strong> {formData.features.length} selected</p>
                <p><strong>Client:</strong> {formData.clientName} ({formData.clientEmail})</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canProceedStep3}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating PRD with AI...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
