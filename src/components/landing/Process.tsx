import { CheckCircle2 } from 'lucide-react';

export default function Process() {
  const steps = [
    {
      number: '01',
      title: 'Tell Us Your Vision',
      description: 'Fill out our simple onboarding form with your project details. Takes only 5 minutes.',
      duration: '5 minutes',
    },
    {
      number: '02',
      title: 'Get Instant PRD & Quote',
      description: 'Our AI generates a comprehensive Project Requirements Document and accurate pricing in under 30 seconds.',
      duration: '30 seconds',
    },
    {
      number: '03',
      title: 'Review & Confirm',
      description: 'Review the automated task breakdown, timeline, and pricing. Request any adjustments needed.',
      duration: '1 day',
    },
    {
      number: '04',
      title: 'Development Begins',
      description: 'Make your deposit and we start building immediately. Track progress in your dashboard 24/7.',
      duration: '2-4 weeks',
    },
    {
      number: '05',
      title: 'Launch & Support',
      description: 'After final review and full payment, we deploy your project and provide ongoing support.',
      duration: 'Ongoing',
    },
  ];

  return (
    <section id="process" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple 5-Step Process
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From idea to launch in weeks, not months
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step number circle */}
                <div className="relative z-10 w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {step.number}
                  </span>
                </div>

                {/* Step content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Your Project Now
            <CheckCircle2 className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
