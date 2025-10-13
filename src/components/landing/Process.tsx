import { CheckCircle2 } from 'lucide-react';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { processSteps } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackProcess } from '@/lib/db/fallback-data';

async function getProcessSteps() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback process data for development');
      return fallbackProcess;
    }

    const db = drizzle(context.env.DB);
    const steps = await db
      .select()
      .from(processSteps)
      .where(eq(processSteps.isActive, true))
      .orderBy(processSteps.order);

    return steps;
  } catch (error) {
    console.error('Error fetching process steps:', error);
    return fallbackProcess;
  }
}

export default async function Process() {
  const processSteps = await getProcessSteps();

  // Map database fields to component format
  const steps = processSteps.map((step: any, index: number) => ({
    number: String(index + 1).padStart(2, '0'),
    title: step.name,
    description: step.description,
  }));

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
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
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
