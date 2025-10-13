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

  // Map services to plans format, marking the middle one as popular
  const plans = services.map((service: any, index: number) => ({
    name: service.name,
    price: (service.basePrice / 1000).toFixed(0) + ',000', // Convert from centavos and format
    description: service.description || '',
    features: service.features ? JSON.parse(service.features) : [],
    popular: index === 1, // Make the second item popular (typically mid-tier pricing)
  }));

  return (
    <section
      id="pricing"
      className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50"
      aria-labelledby="pricing-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--sp-colors-accent)' }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto" style={{ padding: '0 var(--sp-space-6)' }}>
        {/* Section Header */}
        <div className="text-center" style={{ marginBottom: 'var(--sp-space-8)' }}>
          <div
            className="inline-flex items-center backdrop-blur-sm bg-purple-100 text-purple-700 rounded-full font-medium mb-4"
            style={{ padding: 'var(--sp-space-2) var(--sp-space-4)', gap: 'var(--sp-space-2)' }}
          >
            <Star className="w-4 h-4" fill="currentColor" aria-hidden="true" />
            <span className="text-sm">Simple & Transparent Pricing</span>
          </div>

          <h2
            id="pricing-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900"
            style={{ marginBottom: 'var(--sp-space-4)' }}
          >
            Choose Your Perfect Plan
          </h2>
          <p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            style={{ marginBottom: 'var(--sp-space-6)' }}
          >
            No hidden fees. Flexible payment options with 50% deposit to start.
          </p>

          {/* Payment badge */}
          <div
            className="inline-flex items-center backdrop-blur-md bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full shadow-sm"
            style={{ padding: 'var(--sp-space-3) var(--sp-space-5)', gap: 'var(--sp-space-2)' }}
          >
            <Zap className="w-5 h-5 text-green-600" fill="currentColor" aria-hidden="true" />
            <span className="text-sm font-semibold text-green-800">
              Pay 50% now, 50% on completion
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ gap: 'var(--sp-space-6)' }}
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${
                plan.popular
                  ? 'bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl shadow-purple-500/20 scale-105 lg:scale-110'
                  : 'bg-white shadow-lg border border-gray-200'
              }`}
              style={{ padding: 'var(--sp-space-8)' }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[var(--sp-colors-accent)] to-purple-600 text-white px-4 py-1.5 text-xs font-bold rounded-full shadow-lg flex items-center"
                  style={{ gap: 'var(--sp-space-1)' }}
                >
                  <Sparkles className="w-3 h-3" fill="currentColor" aria-hidden="true" />
                  MOST POPULAR
                </div>
              )}

              {/* Plan name */}
              <h3
                className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}
                style={{ marginBottom: 'var(--sp-space-2)' }}
              >
                {plan.name}
              </h3>
              <p
                className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}
                style={{ marginBottom: 'var(--sp-space-6)' }}
              >
                {plan.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: 'var(--sp-space-6)' }}>
                <div className="flex items-baseline" style={{ gap: 'var(--sp-space-1)' }}>
                  <span className={`text-sm font-medium ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                    ₱
                  </span>
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                  One-time payment
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1" style={{ marginBottom: 'var(--sp-space-8)' }}>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start" style={{ gap: 'var(--sp-space-3)' }}>
                    <Check
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'text-green-400' : 'text-green-600'
                      }`}
                      aria-hidden="true"
                    />
                    <span className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href="/onboarding"
                className={`block w-full py-3.5 rounded-xl font-semibold text-center transition-all duration-300 mt-auto ${
                  plan.popular
                    ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-[var(--sp-colors-accent)] to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                }`}
                aria-label={`Get started with ${plan.name} plan`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* Custom solution CTA */}
        <div
          className="text-center backdrop-blur-sm bg-gray-50/50 border border-gray-200 rounded-2xl shadow-sm"
          style={{ marginTop: 'var(--sp-space-8)', padding: 'var(--sp-space-8)' }}
        >
          <h3 className="text-2xl font-bold text-gray-900" style={{ marginBottom: 'var(--sp-space-3)' }}>
            Need Something Unique?
          </h3>
          <p className="text-gray-600" style={{ marginBottom: 'var(--sp-space-4)' }}>
            We'll create a custom package tailored specifically for your business needs.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center font-semibold text-lg hover:scale-105 transition-transform"
            style={{
              gap: 'var(--sp-space-2)',
              padding: 'var(--sp-space-4) var(--sp-space-6)',
              background: `linear-gradient(to right, var(--sp-colors-accent), #a78bfa)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            aria-label="Request a custom quote"
          >
            Request Custom Quote
            <Sparkles className="w-5 h-5" style={{ color: 'var(--sp-colors-accent)' }} aria-hidden="true" />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginTop: 'var(--sp-space-8)' }}>
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: 'var(--sp-colors-accent)', marginBottom: 'var(--sp-space-2)' }}>
              7 Days
            </div>
            <p className="text-gray-600 text-sm">Money-Back Guarantee</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: 'var(--sp-colors-accent)', marginBottom: 'var(--sp-space-2)' }}>
              24/7
            </div>
            <p className="text-gray-600 text-sm">Customer Support</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: 'var(--sp-colors-accent)', marginBottom: 'var(--sp-space-2)' }}>
              Free
            </div>
            <p className="text-gray-600 text-sm">Revisions Included</p>
          </div>
        </div>
      </div>
    </section>
  );
}
