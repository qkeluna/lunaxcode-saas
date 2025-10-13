import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

async function getServices() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/services`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch services');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
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
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No hidden fees. Pay in installments with flexible payment options.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            50% deposit to start, 50% on completion
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular ? 'border-2 border-purple-500' : 'border border-gray-200'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Plan name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">₱{plan.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">One-time payment</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href="/onboarding"
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Need a custom solution? We'll create a tailored package for your specific needs.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700"
          >
            Request Custom Quote
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
