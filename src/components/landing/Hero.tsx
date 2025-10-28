import Link from 'next/link';
import { ArrowRight, Code, Sparkles, Zap, Shield, Clock } from 'lucide-react';

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#161616] dark:via-[#292929] dark:to-[#161616]"
      aria-label="Hero section"
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute top-20 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{ backgroundColor: 'var(--sp-colors-accent)' }}
          aria-hidden="true"
        ></div>
        <div
          className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"
          aria-hidden="true"
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto w-full" style={{ padding: 'var(--sp-space-6)' }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Column - Content */}
          <div className="space-y-8 text-center lg:text-left">

            {/* Badge */}
            <div className="inline-flex items-center backdrop-blur-md bg-purple-100 dark:bg-white/10 border border-purple-200 dark:border-white/20 rounded-full shadow-lg" style={{ padding: 'var(--sp-space-3) var(--sp-space-5)', gap: 'var(--sp-space-2)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--sp-colors-accent)' }} aria-hidden="true" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Trusted by 50+ Filipino Businesses</span>
            </div>

            {/* Main Heading */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              Your Customers Are Searching.
              <br />
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--sp-colors-accent), #a78bfa)`
                }}
              >
                Are You There?
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">
              Professional websites starting at <strong className="text-gray-900 dark:text-white">₱8,000</strong>.
              AI-powered development means faster delivery, transparent pricing,
              and quality your business deserves. From landing pages to complete
              web applications—<strong className="text-gray-900 dark:text-white">we make going online easy for Filipino businesses.</strong>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start" style={{ gap: 'var(--sp-space-4)', paddingTop: 'var(--sp-space-6)' }}>
              <Link
                href="#pricing"
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[var(--sp-colors-accent)] to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-lg shadow-purple-500/50"
                style={{ gap: 'var(--sp-space-2)', minHeight: '48px' }}
                aria-label="View pricing"
              >
                See Our Pricing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                href="#portfolio"
                className="group w-full sm:w-auto px-8 py-4 bg-gray-200 dark:bg-white/10 backdrop-blur-sm text-gray-900 dark:text-white border-2 border-gray-300 dark:border-white/30 rounded-lg font-bold text-lg hover:bg-gray-300 dark:hover:bg-white/20 hover:border-gray-400 dark:hover:border-white/50 transition-all duration-300 flex items-center justify-center"
                style={{ gap: 'var(--sp-space-2)', minHeight: '48px' }}
                aria-label="View success stories"
              >
                <Code className="w-5 h-5" aria-hidden="true" />
                View Success Stories
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start" style={{ gap: 'var(--sp-space-6)', paddingTop: 'var(--sp-space-6)' }}>
              <div className="flex items-center text-gray-600 dark:text-gray-300" style={{ gap: 'var(--sp-space-2)' }}>
                <Shield className="w-5 h-5" style={{ color: 'var(--sp-colors-accent)' }} aria-hidden="true" />
                <span className="text-sm">Fixed Pricing, No Surprises</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300" style={{ gap: 'var(--sp-space-2)' }}>
                <Clock className="w-5 h-5" style={{ color: 'var(--sp-colors-accent)' }} aria-hidden="true" />
                <span className="text-sm">24/7 Support</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300" style={{ gap: 'var(--sp-space-2)' }}>
                <Zap className="w-5 h-5" style={{ color: 'var(--sp-colors-accent)' }} aria-hidden="true" />
                <span className="text-sm">Delivery in Weeks</span>
              </div>
            </div>
          </div>

          {/* Right Column - Stats Card */}
          <div className="hidden lg:block">
            <div
              className="relative backdrop-blur-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 border border-gray-200 dark:border-white/20 rounded-3xl shadow-2xl overflow-hidden"
              style={{ padding: 'var(--sp-space-8)' }}
            >
              {/* Decorative glow */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-50"
                style={{ backgroundColor: 'var(--sp-colors-accent)' }}
                aria-hidden="true"
              ></div>

              <div className="relative space-y-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Why Choose Lunaxcode?</h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">50+</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Projects Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">100%</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Client Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Support Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">&lt;30s</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">AI Response Time</div>
                  </div>
                </div>

                <div
                  className="border-t border-gray-200 dark:border-white/10"
                  style={{ paddingTop: 'var(--sp-space-6)', marginTop: 'var(--sp-space-6)' }}
                >
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    &quot;We went from zero online presence to getting daily inquiries
                    within a month. Lunaxcode made it affordable and stress-free.
                    Best investment for our business!&quot;
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-3">— Maria Santos, Online Store Owner</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Stats - Show below on mobile */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">50+</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">100%</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Satisfied</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Support</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">&lt;30s</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">AI Speed</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" aria-hidden="true">
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-gray-400 dark:bg-white/30 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
