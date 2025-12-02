'use client';

import { useState } from 'react';
import { Check, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import ContactModal from '@/components/modals/ContactModal';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  pricePerMonth: number;
  description: string;
  features: string[];
  timeline: string;
  popular: boolean;
}

interface PricingClientProps {
  plans: PricingPlan[];
}

export default function PricingClient({ plans }: PricingClientProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <section
        id="pricing"
        className="relative py-24 lg:py-32 bg-muted/30"
        aria-labelledby="pricing-heading"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
              Pricing
            </p>
            <h2
              id="pricing-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6"
            >
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              No hidden fees. Start with 50% deposit, pay the rest on completion.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-card border rounded-2xl flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 ${
                  plan.popular
                    ? 'border-violet-400 dark:border-violet-600 ring-1 ring-violet-400 dark:ring-violet-600'
                    : 'border-border hover:border-violet-200 dark:hover:border-violet-800'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full">
                    Popular
                  </div>
                )}

                <div className="p-8 flex flex-col flex-grow">
                  {/* Plan header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">₱</span>
                      <span className="text-4xl font-bold text-foreground tracking-tight">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>{plan.timeline}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 flex-shrink-0 text-violet-600 dark:text-violet-400 mt-0.5" aria-hidden="true" />
                        <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={`/onboarding?serviceId=${plan.id}`}
                    className={`group flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full font-medium text-center transition-all duration-300 ${
                      plan.popular
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : 'bg-card border border-border text-foreground hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30'
                    }`}
                    aria-label={`Get started with ${plan.name} plan`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Custom solution CTA */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                  Need something custom?
                </h3>
                <p className="text-muted-foreground">
                  We&apos;ll create a package tailored specifically for your business needs.
                </p>
              </div>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground font-medium rounded-full hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all"
                aria-label="Request a custom quote"
              >
                Request Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-16 border-t border-border">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground tracking-tight mb-1">
                7 Days
              </p>
              <p className="text-sm text-muted-foreground">Money-Back Guarantee</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground tracking-tight mb-1">
                24/7
              </p>
              <p className="text-sm text-muted-foreground">Customer Support</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground tracking-tight mb-1">
                Unlimited
              </p>
              <p className="text-sm text-muted-foreground">Revisions Included</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal open={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
    </>
  );
}
