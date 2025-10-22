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
      className="relative py-24 bg-white overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div
          className="absolute top-1/4 right-0 w-96 h-96 rounded-full blur-3xl"
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
            <Sparkles className="w-4 h-4" fill="currentColor" aria-hidden="true" />
            <span className="text-sm">Powerful Features</span>
          </div>

          <h2
            id="features-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900"
            style={{ marginBottom: 'var(--sp-space-4)', letterSpacing: '-0.02em' }}
          >
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern project management powered by AI, designed specifically for Filipino businesses
          </p>
        </div>

        {/* Features Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 'var(--sp-space-6)' }}
        >
          {features.map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.icon] || Star;
            return (
              <div
                key={feature.id || index}
                className="group relative backdrop-blur-sm bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{ padding: 'var(--sp-space-8)' }}
              >
                {/* Hover gradient effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--sp-colors-accent), transparent)`
                  }}
                  aria-hidden="true"
                ></div>

                {/* Icon */}
                <div
                  className="relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 bg-gradient-to-br"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--sp-colors-accent), #a78bfa)`
                  }}
                >
                  <IconComponent className="w-7 h-7 text-white" aria-hidden="true" />
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors"
                  style={{ marginBottom: 'var(--sp-space-3)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative corner */}
                <div
                  className="absolute bottom-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity"
                  aria-hidden="true"
                >
                  <IconComponent className="w-full h-full text-purple-600" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className="text-center backdrop-blur-sm bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl shadow-sm"
          style={{ marginTop: 'var(--sp-space-8)', padding: 'var(--sp-space-8)' }}
        >
          <h3
            className="text-2xl font-bold text-gray-900"
            style={{ marginBottom: 'var(--sp-space-3)' }}
          >
            Ready to Transform Your Business?
          </h3>
          <p
            className="text-gray-600 max-w-xl mx-auto"
            style={{ marginBottom: 'var(--sp-space-4)' }}
          >
            Join hundreds of Filipino businesses already using Lunaxcode to streamline their projects
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r py-3 px-6"
            style={{
              minHeight: '48px',
              gap: 'var(--sp-space-2)',
              backgroundImage: `linear-gradient(to right, var(--sp-colors-accent), #a78bfa)`
            }}
            aria-label="View pricing"
          >
            View Pricing
            <Zap className="w-5 h-5" fill="currentColor" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
