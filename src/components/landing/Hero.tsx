'use client';

import Link from 'next/link';
import { ArrowRight, Check, Star } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Intersection observer for triggering animations
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

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const projectCount = useCounter(50, 2000, isVisible);
  const satisfactionCount = useCounter(100, 2000, isVisible);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center bg-background overflow-hidden"
      aria-label="Hero section"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-violet-100/60 via-violet-50/30 to-transparent dark:from-violet-950/40 dark:via-violet-900/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/40 via-transparent to-transparent dark:from-blue-950/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Eyebrow with badge */}
            <div className={`flex items-center gap-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-sm font-medium rounded-full">
                <Star className="w-3.5 h-3.5 fill-current" />
                Rated 5.0 by clients
              </span>
            </div>

            {/* Main Heading */}
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Beautiful websites that{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                  grow your business
                </span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-violet-200/50 dark:bg-violet-800/30 -rotate-1 rounded" aria-hidden="true" />
              </span>
            </h1>

            {/* Subheading */}
            <p className={`text-lg text-muted-foreground max-w-xl leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              We build professional websites for Filipino businesses. Fixed pricing starting at{' '}
              <span className="font-semibold text-foreground">₱8,000</span>. No surprises, just results.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                href="#pricing"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all hover:shadow-lg hover:shadow-foreground/20 hover:-translate-y-0.5"
              >
                View Pricing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#portfolio"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground font-medium rounded-full hover:bg-muted transition-all hover:border-violet-300 dark:hover:border-violet-700"
              >
                See Our Work
              </Link>
            </div>

            {/* Trust Points */}
            <div className={`flex flex-wrap gap-x-8 gap-y-3 pt-4 text-sm text-muted-foreground transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </span>
                Fixed pricing
              </span>
              <span className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </span>
                2-4 week delivery
              </span>
              <span className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </span>
                Unlimited revisions
              </span>
            </div>
          </div>

          {/* Right Column - Stats Card */}
          <div className={`hidden lg:block transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative">
              {/* Main stats card */}
              <div className="bg-card border border-border rounded-3xl p-10 shadow-xl shadow-violet-500/5">
                <p className="text-sm font-medium text-muted-foreground mb-8">Trusted by businesses across the Philippines</p>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="group">
                    <p className="text-5xl font-bold text-foreground tracking-tight tabular-nums">
                      {projectCount}+
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Projects delivered</p>
                  </div>
                  <div className="group">
                    <p className="text-5xl font-bold text-foreground tracking-tight tabular-nums">
                      {satisfactionCount}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Client satisfaction</p>
                  </div>
                  <div className="group">
                    <p className="text-5xl font-bold text-foreground tracking-tight">24/7</p>
                    <p className="text-sm text-muted-foreground mt-1">Support available</p>
                  </div>
                  <div className="group">
                    <p className="text-5xl font-bold text-foreground tracking-tight">&lt;30s</p>
                    <p className="text-sm text-muted-foreground mt-1">AI quote generation</p>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="border-t border-border pt-8">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground leading-relaxed">
                    &ldquo;We went from zero online presence to getting daily inquiries within a month. Best investment for our business.&rdquo;
                  </blockquote>
                  <p className="text-sm font-medium text-foreground mt-4">
                    Rem Luna
                    <span className="text-muted-foreground font-normal"> — K Click Self Photo Studio</span>
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-violet-200 to-blue-200 dark:from-violet-950/50 dark:to-blue-950/50 rounded-3xl" aria-hidden="true" />

              {/* Floating badge */}
              <div className="absolute -top-4 -left-4 px-4 py-2 bg-white dark:bg-card border border-border rounded-full shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">Available now</span>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Stats - Enhanced */}
        <div className={`lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-8 border-t border-border transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center p-4 rounded-2xl bg-card border border-border">
            <p className="text-3xl font-bold text-foreground tabular-nums">{projectCount}+</p>
            <p className="text-xs text-muted-foreground mt-1">Projects</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-card border border-border">
            <p className="text-3xl font-bold text-foreground tabular-nums">{satisfactionCount}%</p>
            <p className="text-xs text-muted-foreground mt-1">Satisfied</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-card border border-border">
            <p className="text-3xl font-bold text-foreground">24/7</p>
            <p className="text-xs text-muted-foreground mt-1">Support</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-card border border-border">
            <p className="text-3xl font-bold text-foreground">&lt;30s</p>
            <p className="text-xs text-muted-foreground mt-1">AI Speed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
