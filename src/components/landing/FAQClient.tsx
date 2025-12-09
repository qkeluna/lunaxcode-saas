'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ArrowRight, HelpCircle, MessageCircle } from 'lucide-react';

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
      id="faq"
      className="relative py-24 lg:py-32 bg-muted/30 overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-to-r from-violet-100/50 via-transparent to-transparent dark:from-violet-950/30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-sm font-medium rounded-full mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <HelpCircle className="w-4 h-4" />
            Common Questions
          </div>
          <h2
            id="faq-heading"
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Frequently asked questions
          </h2>
          <p className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
                className={`bg-card border rounded-2xl overflow-hidden transition-all duration-500 ${
                  isOpen
                    ? 'border-violet-300 dark:border-violet-700 shadow-lg shadow-violet-500/5'
                    : 'border-border hover:border-violet-200 dark:hover:border-violet-800'
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 50 + 300}ms` }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left p-6"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-medium text-foreground pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? 'bg-violet-600 dark:bg-violet-500'
                        : 'bg-muted hover:bg-violet-100 dark:hover:bg-violet-950/50'
                    }`}
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 text-white'
                          : 'text-muted-foreground'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`grid transition-all duration-300 ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className={`mt-12 p-8 bg-card border border-border rounded-2xl text-center transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-950/50 dark:to-blue-950/50 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="text-foreground font-medium mb-2">
            Still have questions?
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            We&apos;re here to help. Get in touch and we&apos;ll respond within 2 hours.
          </p>
          <a
            href="mailto:lunaxcode2030@gmail.com"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
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
