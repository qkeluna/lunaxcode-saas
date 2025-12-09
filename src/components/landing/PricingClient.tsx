'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight, Clock, Sparkles, Shield, Zap } from 'lucide-react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="pricing"
        className="relative py-24 lg:py-32 bg-muted/30 overflow-hidden"
        aria-labelledby="pricing-heading"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-violet-100/50 via-transparent to-transparent dark:from-violet-950/30 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/50 via-transparent to-transparent dark:from-blue-950/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className={`text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Pricing
            </p>
            <h2
              id="pricing-heading"
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Simple, transparent pricing
            </h2>
            <p className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              No hidden fees. Start with <span className="font-semibold text-foreground">50% deposit</span>, pay the rest on completion.
            </p>

            {/* Payment terms badge */}
            <div className={`inline-flex items-center gap-2 mt-6 px-4 py-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-full transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <Shield className="w-4 h-4" />
              7-Day Money-Back Guarantee
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative bg-card border rounded-3xl flex flex-col transition-all duration-500 ${
                  plan.popular
                    ? 'border-violet-400 dark:border-violet-600 ring-2 ring-violet-400/50 dark:ring-violet-600/50 shadow-xl shadow-violet-500/10 lg:scale-105 lg:-my-4'
                    : 'border-border hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-xl hover:shadow-violet-500/5'
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 100 + 400}ms` }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-medium rounded-full shadow-lg shadow-violet-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
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
                      <span className="text-lg font-medium text-muted-foreground">₱</span>
                      <span className="text-5xl font-bold text-foreground tracking-tight">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>

                  {/* Timeline with icon */}
                  <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-muted rounded-lg text-sm">
                    <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                    <span className="text-foreground font-medium">{plan.timeline}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        </span>
                        <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={`/onboarding?serviceId=${plan.id}`}
                    className={`group flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full font-medium text-center transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-700 hover:to-blue-700 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5'
                        : 'bg-foreground text-background hover:bg-foreground/90 hover:shadow-lg hover:-translate-y-0.5'
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
          <div className={`relative bg-card border border-border rounded-3xl p-8 md:p-12 overflow-hidden transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-50/50 via-transparent to-transparent dark:from-violet-950/20 pointer-events-none" aria-hidden="true" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-sm font-medium rounded-full mb-4">
                  <Zap className="w-3.5 h-3.5" />
                  Custom Solutions
                </div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                  Need something custom?
                </h3>
                <p className="text-muted-foreground">
                  We&apos;ll create a package tailored specifically for your business needs. Get a free consultation today.
                </p>
              </div>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
                aria-label="Request a custom quote"
              >
                Request Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-16 border-t border-border transition-all duration-700 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight mb-1">
                7 Days
              </p>
              <p className="text-sm text-muted-foreground">Money-Back Guarantee</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
                <Zap className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight mb-1">
                24/7
              </p>
              <p className="text-sm text-muted-foreground">Customer Support</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                <Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight mb-1">
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
