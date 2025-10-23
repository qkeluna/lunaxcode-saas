'use client';

import { useState } from 'react';
import { Mail, MessageCircle, Phone, Rocket, Facebook } from 'lucide-react';
import Link from 'next/link';
import ContactModal from '@/components/modals/ContactModal';

export default function ContactCTA() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <section
        id="contact"
        className="relative py-24 overflow-hidden bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-purple-900 dark:via-blue-900 dark:to-pink-900"
        aria-labelledby="contact-heading"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10" aria-hidden="true">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 dark:bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 dark:bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center" style={{ padding: '0 var(--sp-space-6)' }}>
          <div
            className="inline-flex items-center backdrop-blur-md bg-purple-200/60 dark:bg-white/20 border border-purple-300/50 dark:border-white/30 rounded-full font-bold mb-4"
            style={{ padding: 'var(--sp-space-2) var(--sp-space-4)', gap: 'var(--sp-space-2)' }}
          >
            <Rocket className="w-4 h-4 text-purple-700 dark:text-white" aria-hidden="true" />
            <span className="text-sm text-purple-700 dark:text-white">Let&apos;s Build Together</span>
          </div>

          <h2
            id="contact-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
            style={{ marginBottom: 'var(--sp-space-6)', letterSpacing: '-0.02em' }}
          >
            Ready to Transform Your Business?
          </h2>
          <p
            className="text-xl text-gray-700 dark:text-white/90 max-w-2xl mx-auto"
            style={{ marginBottom: 'var(--sp-space-8)' }}
          >
            Get your project started today with our AI-powered platform. Professional consultation, instant quote, and transparent pricing.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row justify-center"
            style={{ gap: 'var(--sp-space-4)', marginBottom: 'var(--sp-space-8)' }}
          >
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition-all duration-300"
              style={{ minHeight: '48px' }}
              aria-label="Request custom quote"
            >
              Request Custom Quote
            </button>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center px-8 py-3 bg-white/80 dark:bg-transparent text-gray-900 dark:text-white border-2 border-purple-300 dark:border-white rounded-xl font-bold text-lg hover:bg-white dark:hover:bg-white/20 transition-all duration-300"
              style={{ minHeight: '48px' }}
              aria-label="View pricing"
            >
              View Pricing
            </Link>
            <a
              href="https://wa.me/639190852974"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 bg-white/80 dark:bg-transparent text-gray-900 dark:text-white border-2 border-purple-300 dark:border-white rounded-xl font-bold text-lg hover:bg-white dark:hover:bg-white/20 transition-all duration-300"
              style={{ gap: 'var(--sp-space-2)', minHeight: '48px' }}
              aria-label="Chat with us on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              Chat on WhatsApp
            </a>
            <a
              href="https://m.me/373536033045669"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 bg-white/80 dark:bg-transparent text-gray-900 dark:text-white border-2 border-purple-300 dark:border-white rounded-xl font-bold text-lg hover:bg-white dark:hover:bg-white/20 transition-all duration-300"
              style={{ gap: 'var(--sp-space-2)', minHeight: '48px' }}
              aria-label="Chat with us on Messenger"
            >
              <Facebook className="w-5 h-5" aria-hidden="true" />
              Chat on Messenger
            </a>
          </div>

        {/* Contact methods */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 max-w-3xl mx-auto"
          style={{ gap: 'var(--sp-space-6)' }}
        >
          <div
            className="backdrop-blur-md bg-white/60 dark:bg-white/10 border border-purple-200 dark:border-white/20 rounded-2xl text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300"
            style={{ padding: 'var(--sp-space-6)' }}
          >
            <Mail className="w-8 h-8 mx-auto mb-3" aria-hidden="true" />
            <div className="font-bold mb-1">Email Us</div>
            <a
              href="mailto:hello@lunaxcode.com"
              className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
            >
              lunaxcode2030@gmail.com
            </a>
          </div>

          <div
            className="backdrop-blur-md bg-white/60 dark:bg-white/10 border border-purple-200 dark:border-white/20 rounded-2xl text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300"
            style={{ padding: 'var(--sp-space-6)' }}
          >
            <MessageCircle className="w-8 h-8 mx-auto mb-3" aria-hidden="true" />
            <div className="font-bold mb-1">WhatsApp</div>
            <a
              href="https://wa.me/639123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
            >
              +63 919 085 2974
            </a>
          </div>

          <div
            className="backdrop-blur-md bg-white/60 dark:bg-white/10 border border-purple-200 dark:border-white/20 rounded-2xl text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300"
            style={{ padding: 'var(--sp-space-6)' }}
          >
            <Phone className="w-8 h-8 mx-auto mb-3" aria-hidden="true" />
            <div className="font-bold mb-1">Call Us</div>
            <a
              href="tel:+639123456789"
              className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
            >
              +63 919 085 2974
            </a>
          </div>
        </div>

        {/* Response time badge */}
        <div
          className="mt-8 inline-flex items-center backdrop-blur-md bg-white/60 dark:bg-white/20 border border-purple-200 dark:border-white/30 rounded-full text-gray-900 dark:text-white font-bold shadow-lg"
          style={{ padding: 'var(--sp-space-3) var(--sp-space-5)', gap: 'var(--sp-space-2)' }}
        >
          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
          Average response time: Under 2 hours
        </div>
      </div>
    </section>

    {/* Contact Modal */}
    <ContactModal open={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
    </>
  );
}
