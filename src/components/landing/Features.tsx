import {
  Sparkles,
  FileText,
  MessageSquare,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  Users,
  Clock,
  Star,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { features as featuresTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackFeatures } from '@/lib/db/fallback-data';

// Icon mapping for database icon names
const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  FileText,
  MessageSquare,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  Users,
  Clock,
  Star,
};

async function getFeatures() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback features data for development');
      return fallbackFeatures;
    }

    const db = drizzle(context.env.DB);
    const features = await db
      .select()
      .from(featuresTable)
      .where(eq(featuresTable.isActive, true))
      .orderBy(featuresTable.order);

    return features;
  } catch (error) {
    console.error('Error fetching features:', error);
    return fallbackFeatures;
  }
}

export default async function Features() {
  const features = await getFeatures();

  return (
    <section
      id="features"
      className="relative py-24 lg:py-32 bg-background"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
            Platform Features
          </p>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6"
          >
            Everything you need to succeed
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Modern project management powered by AI, designed specifically for Filipino businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.icon] || Star;
            return (
              <article
                key={feature.id || index}
                className="group relative bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-lg hover:shadow-violet-500/5"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-6 h-6 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                Ready to transform your business?
              </h3>
              <p className="text-muted-foreground">
                Join businesses across the Philippines already using Lunaxcode.
              </p>
            </div>
            <a
              href="#pricing"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-colors"
              aria-label="View pricing plans"
            >
              View Pricing
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
