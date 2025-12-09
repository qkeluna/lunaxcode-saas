'use client';

import { Shield, Zap, HeartHandshake, Award, TrendingUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export default function TrustBadges() {
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const badges = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security',
      stat: '100%',
      statLabel: 'Uptime',
    },
    {
      icon: Zap,
      title: 'Fast Delivery',
      description: '2-4 week turnaround',
      stat: '14',
      statLabel: 'Days avg',
    },
    {
      icon: HeartHandshake,
      title: 'Dedicated Support',
      description: '24/7 communication',
      stat: '<2hr',
      statLabel: 'Response',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Unlimited revisions',
      stat: '5.0',
      statLabel: 'Rating',
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Trust counter */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span>Trusted by 50+ Filipino businesses this year</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-950/50 dark:to-blue-950/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/10 transition-all duration-300">
                  <badge.icon className="w-7 h-7 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                </div>
                {/* Stat badge */}
                <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-foreground text-background text-xs font-bold rounded-full">
                  {badge.stat}
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {badge.title}
              </h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
