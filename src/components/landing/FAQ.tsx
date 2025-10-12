'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How long does it take to complete a project?',
      answer: 'Most projects are completed within 2-4 weeks, depending on complexity. Landing pages can be ready in 7-10 days, while complex web applications may take 4-6 weeks. We provide a detailed timeline during the initial consultation.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept GCash, PayMaya, bank transfer, and credit/debit cards through PayMongo. Payment is split into two: 50% deposit to start, 50% upon project completion.',
    },
    {
      question: 'Do you offer revisions?',
      answer: 'Yes! All packages include revisions. The number varies by package (2-3 rounds for basic packages, unlimited for premium). We want you to be 100% satisfied with the final result.',
    },
    {
      question: 'Will my website work on mobile devices?',
      answer: 'Absolutely! All our websites are fully responsive and optimized for mobile, tablet, and desktop devices. Mobile-first design is our standard practice.',
    },
    {
      question: 'Do you provide hosting and domain setup?',
      answer: 'Yes, we include free hosting for 1 year with most packages. We can also help you register a domain name or use your existing one. After the first year, hosting costs are minimal (₱2,000-5,000/year).',
    },
    {
      question: 'Can I update the website myself after launch?',
      answer: "Yes! For websites with CMS integration (content management system), you'll be able to update text, images, and blog posts yourself. We provide training and documentation.",
    },
    {
      question: 'What if I need changes after the project is completed?',
      answer: 'We offer ongoing support packages starting at ₱3,000/month for minor updates and maintenance. Major feature additions can be quoted separately.',
    },
    {
      question: 'How does your AI-powered process work?',
      answer: 'After you fill out our onboarding form, our AI generates a comprehensive Project Requirements Document and task breakdown in under 30 seconds. This ensures nothing is missed and gives you a clear picture of the entire project upfront.',
    },
    {
      question: 'Do you work with businesses outside Metro Manila?',
      answer: 'Yes! We work with clients all over the Philippines and even internationally. All communication is done online through our dashboard, video calls, and messaging.',
    },
    {
      question: 'What makes Lunaxcode different from other agencies?',
      answer: 'We combine AI-powered project management with human expertise, giving you transparency, speed, and quality. Our dashboard lets you track progress 24/7, and our pricing is competitive with no hidden fees.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know before starting your project
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <a
            href="mailto:hello@lunaxcode.com"
            className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700"
          >
            Contact us directly
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
