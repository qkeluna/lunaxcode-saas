import { CheckCircle2, Workflow } from 'lucide-react';
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
    title: step.title,
    description: step.description,
  }));

  return (
    <section
      id="process"
      className="relative py-24 bg-white overflow-hidden"
      aria-labelledby="process-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div
          className="absolute top-1/3 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--sp-colors-accent)' }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto" style={{ padding: '0 var(--sp-space-6)' }}>
        {/* Section Header */}
        <div className="text-center" style={{ marginBottom: 'var(--sp-space-8)' }}>
          <div
            className="inline-flex items-center backdrop-blur-sm bg-purple-100 text-purple-700 rounded-full font-bold mb-4"
            style={{ padding: 'var(--sp-space-2) var(--sp-space-4)', gap: 'var(--sp-space-2)' }}
          >
            <Workflow className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">How It Works</span>
          </div>

          <h2
            id="process-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900"
            style={{ marginBottom: 'var(--sp-space-4)', letterSpacing: '-0.02em' }}
          >
            Simple 5-Step Process
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From idea to launch in weeks, not months
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div
            className="hidden lg:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r"
            style={{ backgroundImage: `linear-gradient(to right, var(--sp-colors-accent), #a78bfa)` }}
            aria-hidden="true"
          ></div>

          {/* Steps grid */}
          <div
            className="grid grid-cols-1 lg:grid-cols-5"
            style={{ gap: 'var(--sp-space-6)' }}
          >
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step number circle */}
                <div
                  className="relative z-10 w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 bg-gradient-to-br"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--sp-colors-accent), #a78bfa)`,
                    marginBottom: 'var(--sp-space-6)'
                  }}
                >
                  <span className="text-3xl font-bold text-white">
                    {step.number}
                  </span>
                </div>

                {/* Step content */}
                <div className="text-center">
                  <h3
                    className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors"
                    style={{ marginBottom: 'var(--sp-space-3)' }}
                  >
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
        <div className="text-center" style={{ marginTop: 'var(--sp-space-8)' }}>
          <a
            href="/onboarding"
            className="inline-flex items-center font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r py-3 px-6"
            style={{
              minHeight: '48px',
              gap: 'var(--sp-space-2)',
              backgroundImage: `linear-gradient(to right, var(--sp-colors-accent), #a78bfa)`
            }}
            aria-label="Start your project now"
          >
            Start Your Project Now
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
