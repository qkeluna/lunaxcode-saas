import { ArrowRight } from 'lucide-react';
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
      className="relative py-24 lg:py-32 bg-background"
      aria-labelledby="process-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
            How It Works
          </p>
          <h2
            id="process-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6"
          >
            From idea to launch
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A simple, transparent process that gets your project done in weeks, not months.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div
            className="hidden lg:block absolute top-6 left-6 right-6 h-px bg-border"
            aria-hidden="true"
          />

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step number */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center mb-6 group-hover:border-violet-400 dark:group-hover:border-violet-500 transition-colors">
                  <span className="text-sm font-bold text-foreground">
                    {step.number}
                  </span>
                </div>

                {/* Mobile connecting line */}
                {index < steps.length - 1 && (
                  <div
                    className="lg:hidden absolute left-6 top-12 w-px h-8 bg-border -translate-x-1/2"
                    aria-hidden="true"
                  />
                )}

                {/* Step content */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <p className="text-lg text-muted-foreground">
              Ready to start your project?
            </p>
            <a
              href="#pricing"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-colors"
              aria-label="View pricing plans"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
