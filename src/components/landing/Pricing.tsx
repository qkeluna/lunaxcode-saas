import { Check, Sparkles, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { serviceTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackServices } from '@/lib/db/fallback-data';

async function getServices() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback services data for development');
      return fallbackServices;
    }

    const db = drizzle(context.env.DB);
    const services = await db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.isActive, true));

    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return fallbackServices;
  }
}

export default async function Pricing() {
  const services = await getServices();

  // Map services to plans format - limit to 3 most important
  const plans = services
    .sort((a: any, b: any) => {
      // Sort: popular first, then by price
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.basePrice - b.basePrice;
    })
    .slice(0, 3) // Limit to 3 plans
    .map((service: any) => ({
      id: service.id,
      name: service.name,
      price: (service.basePrice / 1000).toFixed(0) + 'k', // Format as 15k, 35k, etc.
      pricePerMonth: Math.round(service.basePrice / 1000), // Numeric value
      description: service.description || '',
      features: service.features ? JSON.parse(service.features) : [],
      timeline: service.timeline || 'Contact for estimate',
      popular: service.popular === true || service.popular === 1,
    }));

  return (
    <section
      id="pricing"
      className="relative py-24 overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black"
      aria-labelledby="pricing-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header - RULE 6: Reduced letter spacing for large text */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-4 py-2 gap-2 mb-6 font-bold text-sm"
          >
            <Star className="w-4 h-4" fill="currentColor" aria-hidden="true" />
            <span>Simple & Transparent Pricing</span>
          </div>

          <h2
            id="pricing-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ letterSpacing: '-0.03em' }} // RULE 6: Large text letter spacing
          >
            Choose the plan that works for you and your team.
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            No hidden fees. Flexible payment options with 50% deposit to start.
          </p>

          {/* Payment toggle - RULE 7: Multiple indicators (color + border + icon) */}
          {/* <div className="inline-flex items-center bg-green-500/10 border border-green-500/30 rounded-full px-5 py-3 gap-2">
            <Zap className="w-5 h-5 text-green-400" fill="currentColor" aria-hidden="true" />
            <span className="text-sm font-bold text-green-400">
              Pay annually (save 20%)
            </span>
          </div> */}
        </div>

        {/* Pricing Grid - RULE 1: 8-point grid spacing (24px gap) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col ${
                plan.popular
                  ? 'bg-gradient-to-br from-gray-900 to-gray-950 border-purple-500/30 shadow-xl shadow-purple-500/20 scale-[1.02]'
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Popular badge - RULE 7: Color + border + icon (multiple indicators) */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1.5 text-xs font-bold rounded-full shadow-lg border border-purple-400/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" fill="currentColor" aria-hidden="true" />
                  POPULAR
                </div>
              )}

              {/* RULE 1: Consistent 32px padding (8-point grid) */}
              <div className="p-8 flex flex-col flex-grow">
                {/* Plan header - RULE 8: Single alignment (left) */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price - RULE 9: Text has 4.5:1 contrast */}
                <div className="mb-8 text-center">
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-sm font-bold text-gray-400">₱</span>
                    <span className="text-5xl font-bold text-white" style={{ letterSpacing: '-0.04em' }}>
                      {plan.price}
                    </span>
                    <span className="text-sm font-normal text-gray-500">
                      / project
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">One-time payment</p>

                  {/* Timeline badge - RULE 14: Balanced icon-text pairs */}
                  <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-2">
                    <Zap
                      className="w-4 h-4 text-purple-400"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-purple-400">
                      {plan.timeline}
                    </span>
                  </div>
                </div>

                {/* Features - RULE 14: Balanced icon-text (same color, proper weight) */}
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 flex-shrink-0 text-green-400 mt-0.5"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-gray-300 leading-relaxed font-normal">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - RULE 3: Single primary button (only popular), RULE 4: 48px min height */}
                <Link
                  href={`/onboarding?serviceId=${plan.id}`}
                  className={`block w-full py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 ${
                    plan.popular
                      ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
                      : 'bg-transparent border-2 border-gray-700 text-white hover:border-gray-600 hover:bg-gray-800/50'
                  }`}
                  style={{ minHeight: '48px' }} // RULE 4: Minimum button size
                  aria-label={`Get started with ${plan.name} plan`}
                >
                  {plan.popular ? 'Get Pro' : `Get ${plan.name}`}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Custom solution CTA - RULE 10: Removed container, use spacing instead */}
        <div className="text-center py-12 border-t border-gray-800">
          <h3 className="text-2xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Need Something Unique?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            We'll create a custom package tailored specifically for your business needs.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            style={{ minHeight: '48px' }}
            aria-label="Request a custom quote"
          >
            Request Custom Quote
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>

        {/* Trust indicators - RULE 1: 8-point spacing (24px gap) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-800">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2" style={{ letterSpacing: '-0.03em' }}>
              7 Days
            </div>
            <p className="text-sm text-gray-400 font-medium">Money-Back Guarantee</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2" style={{ letterSpacing: '-0.03em' }}>
              24/7
            </div>
            <p className="text-sm text-gray-400 font-medium">Customer Support</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2" style={{ letterSpacing: '-0.03em' }}>
              Free
            </div>
            <p className="text-sm text-gray-400 font-medium">Revisions Included</p>
          </div>
        </div>
      </div>
    </section>
  );
}
