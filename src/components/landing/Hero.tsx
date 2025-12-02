import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export default function Hero() {
  return (
    <section
      className="relative min-h-[90vh] flex items-center bg-background"
      aria-label="Hero section"
    >
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-violet-50/50 via-transparent to-transparent dark:from-violet-950/20 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto w-full px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <p className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400">
              Web Development Agency
            </p>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Beautiful websites that grow your business
            </h1>

            {/* Subheading */}
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              We build professional websites for Filipino businesses. Fixed pricing starting at ₱8,000. No surprises, just results.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="#pricing"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-colors"
              >
                View Pricing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#portfolio"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground font-medium rounded-full hover:bg-muted transition-colors"
              >
                See Our Work
              </Link>
            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Fixed pricing
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                2-4 week delivery
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Unlimited revisions
              </span>
            </div>
          </div>

          {/* Right Column - Stats Card */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main stats card */}
              <div className="bg-card border border-border rounded-3xl p-10 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground mb-8">Trusted by businesses across the Philippines</p>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div>
                    <p className="text-5xl font-bold text-foreground tracking-tight">50+</p>
                    <p className="text-sm text-muted-foreground mt-1">Projects delivered</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-foreground tracking-tight">100%</p>
                    <p className="text-sm text-muted-foreground mt-1">Client satisfaction</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-foreground tracking-tight">24/7</p>
                    <p className="text-sm text-muted-foreground mt-1">Support available</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-foreground tracking-tight">&lt;30s</p>
                    <p className="text-sm text-muted-foreground mt-1">AI quote generation</p>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="border-t border-border pt-8">
                  <blockquote className="text-muted-foreground leading-relaxed">
                    &ldquo;We went from zero online presence to getting daily inquiries within a month. Best investment for our business.&rdquo;
                  </blockquote>
                  <p className="text-sm font-medium text-foreground mt-4">
                    Rem Luna
                    <span className="text-muted-foreground font-normal"> — K Click Self Photo Studio</span>
                  </p>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-violet-100 dark:bg-violet-950/30 rounded-3xl" aria-hidden="true" />
            </div>
          </div>

        </div>

        {/* Mobile Stats */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">50+</p>
            <p className="text-xs text-muted-foreground mt-1">Projects</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">100%</p>
            <p className="text-xs text-muted-foreground mt-1">Satisfied</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">24/7</p>
            <p className="text-xs text-muted-foreground mt-1">Support</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">&lt;30s</p>
            <p className="text-xs text-muted-foreground mt-1">AI Speed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
