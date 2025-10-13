import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto" style={{ padding: 'var(--sp-space-8) var(--sp-space-6)' }}>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ gap: 'var(--sp-space-8)' }}
        >
          {/* Company Info */}
          <div>
            <h3
              className="text-2xl font-bold mb-4 bg-gradient-to-r text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(to right, var(--sp-colors-accent), #a78bfa)` }}
            >
              Lunaxcode
            </h3>
            <p
              className="text-gray-400 leading-relaxed"
              style={{ marginBottom: 'var(--sp-space-6)' }}
            >
              AI-powered web development for Filipino businesses. Turning ideas into digital reality since 2024.
            </p>
            {/* Social Links */}
            <div className="flex" style={{ gap: 'var(--sp-space-4)' }}>
              <a
                href="https://facebook.com/lunaxcode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-blue-500"
                style={{ color: 'var(--sp-colors-accent)' }}
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/lunaxcode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-pink-500"
                style={{ color: 'var(--sp-colors-accent)' }}
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/lunaxcode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-blue-400"
                style={{ color: 'var(--sp-colors-accent)' }}
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg" style={{ marginBottom: 'var(--sp-space-4)' }}>Quick Links</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-3)' }}>
              <li>
                <a href="#portfolio" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  Testimonials
                </a>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  Client Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg" style={{ marginBottom: 'var(--sp-space-4)' }}>Services</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-3)' }}>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  Landing Pages
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  Business Websites
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  E-Commerce Platforms
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  Web Applications
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors inline-flex items-center group" style={{ gap: 'var(--sp-space-2)' }}>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" aria-hidden="true" />
                  Mobile Apps
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg" style={{ marginBottom: 'var(--sp-space-4)' }}>Contact Us</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-space-4)' }}>
              <li className="flex items-start" style={{ gap: 'var(--sp-space-3)' }}>
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-gray-400 text-sm">
                  Metro Manila, Philippines
                </span>
              </li>
              <li className="flex items-start" style={{ gap: 'var(--sp-space-3)' }}>
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href="mailto:hello@lunaxcode.com"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  hello@lunaxcode.com
                </a>
              </li>
              <li className="flex items-start" style={{ gap: 'var(--sp-space-3)' }}>
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href="tel:+639123456789"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  +63 912 345 6789
                </a>
              </li>
            </ul>

            <div style={{ marginTop: 'var(--sp-space-6)' }}>
              <Link
                href="/onboarding"
                className="inline-flex items-center font-semibold text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r"
                style={{
                  padding: 'var(--sp-space-3) var(--sp-space-5)',
                  gap: 'var(--sp-space-2)',
                  backgroundImage: `linear-gradient(to right, var(--sp-colors-accent), #a78bfa)`
                }}
                aria-label="Get started"
              >
                Get Started
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="border-t border-gray-800"
          style={{ marginTop: 'var(--sp-space-8)', paddingTop: 'var(--sp-space-6)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center" style={{ gap: 'var(--sp-space-4)' }}>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Lunaxcode. All rights reserved.
            </p>
            <div className="flex text-sm" style={{ gap: 'var(--sp-space-6)' }}>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
