'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQClientProps {
  faqs: FAQ[];
}

export default function FAQClient({ faqs }: FAQClientProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden" aria-labelledby="faq-heading">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--sp-colors-accent)' }}
        ></div>
      </div>

      <div className="relative max-w-4xl mx-auto" style={{ padding: '0 var(--sp-space-6)' }}>
        {/* Section Header */}
        <div className="text-center" style={{ marginBottom: 'var(--sp-space-8)' }}>
          <div
            className="inline-flex items-center backdrop-blur-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold mb-4"
            style={{ padding: 'var(--sp-space-2) var(--sp-space-4)', gap: 'var(--sp-space-2)' }}
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Got Questions?</span>
          </div>

          <h2
            id="faq-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
            style={{ marginBottom: 'var(--sp-space-4)', letterSpacing: '-0.02em' }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know before starting your project with us
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id || index}
                className={`backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-purple-300 dark:border-purple-700 shadow-lg shadow-purple-100 dark:shadow-purple-900/50'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 shadow-sm hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                  style={{ padding: 'var(--sp-space-5) var(--sp-space-6)' }}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span
                    className={`font-bold pr-8 transition-colors ${
                      isOpen ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? 'bg-gradient-to-br shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                    style={
                      isOpen
                        ? { backgroundImage: `linear-gradient(to bottom right, var(--sp-colors-accent), #a78bfa)` }
                        : {}
                    }
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-all duration-300 ${
                        isOpen ? 'transform rotate-180 text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                >
                  <div
                    className="text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700"
                    style={{ padding: 'var(--sp-space-5) var(--sp-space-6)' }}
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div
          className="text-center backdrop-blur-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl shadow-sm"
          style={{ marginTop: 'var(--sp-space-8)', padding: 'var(--sp-space-6)' }}
        >
          <h3
            className="text-xl font-bold text-gray-900 dark:text-white"
            style={{ marginBottom: 'var(--sp-space-2)' }}
          >
            Still Have Questions?
          </h3>
          <p className="text-gray-600 dark:text-gray-300" style={{ marginBottom: 'var(--sp-space-4)' }}>
            Our team is ready to help you with anything you need
          </p>
          <a
            href="mailto:lunaxcode2030@gmail.com"
            className="inline-flex items-center font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r py-3 px-6"
            style={{
              minHeight: '48px',
              gap: 'var(--sp-space-2)',
              backgroundImage: `linear-gradient(to right, var(--sp-colors-accent), #a78bfa)`
            }}
            aria-label="Contact us via email"
          >
            Contact Us Directly
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
