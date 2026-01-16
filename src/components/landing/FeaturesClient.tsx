'use client';

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
import { useEffect, useState, useRef } from 'react';

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

interface Feature {
  id?: string;
  title: string;
  description: string;
  icon: string;
}

interface FeaturesClientProps {
  features: Feature[];
}

export default function FeaturesClient({ features }: FeaturesClientProps) {
  const [isVisible, setIsVisible] = useState(false);
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
    <section
      ref={sectionRef}
      id="features"
      className="relative py-24 lg:py-32 bg-background overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-100/40 via-transparent to-transparent dark:from-violet-950/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-blue-100/40 via-transparent to-transparent dark:from-blue-950/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className={`text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Platform Features
          </p>
          <h2
            id="features-heading"
            className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Everything you need to succeed
          </h2>
          <p className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Modern project management powered by AI, designed specifically for Filipino businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature: Feature, index: number) => {
            const IconComponent = iconMap[feature.icon] || Star;
            return (
              <article
                key={feature.id || index}
                className={`group relative bg-card border border-border rounded-2xl p-8 transition-all duration-500 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 50 + 300}ms` }}
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon */}
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-950/50 dark:to-blue-950/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/20 transition-all duration-300">
                  <IconComponent className="w-7 h-7 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                </div>

                {/* Content */}
                <h3 className="relative text-lg font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="relative text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className={`mt-16 pt-16 border-t border-border transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="font-display text-2xl font-bold text-foreground tracking-tight mb-2">
                Ready to transform your business?
              </h3>
              <p className="text-muted-foreground">
                Join businesses across the Philippines already using Lunaxcode.
              </p>
            </div>
            <a
              href="#pricing"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all hover:shadow-lg hover:shadow-foreground/20 hover:-translate-y-0.5"
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
