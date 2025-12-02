'use client';

import { useState } from 'react';
import { Mail, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ContactModal from '@/components/modals/ContactModal';

export default function ContactCTA() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <section
        id="contact"
        className="relative py-24 lg:py-32 bg-background"
        aria-labelledby="contact-heading"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Main CTA */}
          <div className="relative bg-card border border-border rounded-3xl overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-violet-50/50 via-transparent to-transparent dark:from-violet-950/20 pointer-events-none" aria-hidden="true" />

            <div className="relative p-8 md:p-12 lg:p-16">
              <div className="max-w-2xl">
                <p className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
                  Get Started
                </p>
                <h2
                  id="contact-heading"
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6"
                >
                  Ready to transform your business?
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Get your project started today. Professional consultation, instant quote, and transparent pricing.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-colors"
                    aria-label="Request custom quote"
                  >
                    Request Quote
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Link
                    href="#pricing"
                    className="inline-flex items-center justify-center px-8 py-4 border border-border text-foreground font-medium rounded-full hover:bg-muted transition-colors"
                    aria-label="View pricing"
                  >
                    View Pricing
                  </Link>
                </div>

                {/* Response time */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
                  Average response time: Under 2 hours
                </div>
              </div>
            </div>
          </div>

          {/* Contact methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <a
              href="mailto:lunaxcode2030@gmail.com"
              className="group flex items-center gap-4 p-6 bg-card border border-border rounded-2xl hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Email Us</p>
                <p className="text-sm text-muted-foreground">lunaxcode2030@gmail.com</p>
              </div>
            </a>

            <a
              href="https://wa.me/639190852974"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-6 bg-card border border-border rounded-2xl hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">WhatsApp</p>
                <p className="text-sm text-muted-foreground">+63 919 085 2974</p>
              </div>
            </a>

            <a
              href="tel:+639190852974"
              className="group flex items-center gap-4 p-6 bg-card border border-border rounded-2xl hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Call Us</p>
                <p className="text-sm text-muted-foreground">+63 919 085 2974</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal open={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
    </>
  );
}
