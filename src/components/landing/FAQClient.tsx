'use client';

import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

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
    <section
      id="faq"
      className="relative py-24 lg:py-32 bg-muted/30"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6"
          >
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to know before starting your project.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id || index}
                className={`bg-card border rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? 'border-violet-200 dark:border-violet-800'
                    : 'border-border hover:border-violet-200 dark:hover:border-violet-800'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left p-5"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-medium text-foreground pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isOpen
                        ? 'bg-violet-100 dark:bg-violet-950/50'
                        : 'bg-muted'
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 text-violet-600 dark:text-violet-400'
                          : 'text-muted-foreground'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                >
                  <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:lunaxcode2030@gmail.com"
            className="group inline-flex items-center gap-2 text-foreground font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            aria-label="Contact us via email"
          >
            Contact us directly
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
