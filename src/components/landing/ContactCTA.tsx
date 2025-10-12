import { Mail, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ContactCTA() {
  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Get your project started today with our AI-powered platform. Free consultation, instant quote, and transparent pricing.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/onboarding"
            className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Your Project Free
          </Link>
          <a
            href="https://wa.me/639123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Contact methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <Mail className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold mb-1">Email Us</div>
            <a
              href="mailto:hello@lunaxcode.com"
              className="text-white/80 hover:text-white text-sm"
            >
              hello@lunaxcode.com
            </a>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <MessageCircle className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold mb-1">WhatsApp</div>
            <a
              href="https://wa.me/639123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white text-sm"
            >
              +63 912 345 6789
            </a>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <Phone className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold mb-1">Call Us</div>
            <a
              href="tel:+639123456789"
              className="text-white/80 hover:text-white text-sm"
            >
              +63 912 345 6789
            </a>
          </div>
        </div>

        {/* Response time badge */}
        <div className="mt-12 inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Average response time: Under 2 hours
        </div>
      </div>
    </section>
  );
}
