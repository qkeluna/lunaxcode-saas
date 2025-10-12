import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Lunaxcode
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AI-powered web development for Filipino businesses. Turning ideas into digital reality since 2024.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com/lunaxcode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/lunaxcode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/lunaxcode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#portfolio" className="text-gray-400 hover:text-white transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                  Client Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors">
                  Landing Pages
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors">
                  Business Websites
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors">
                  E-Commerce Platforms
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors">
                  Web Applications
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors">
                  Mobile Apps
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Metro Manila, Philippines
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:hello@lunaxcode.com"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  hello@lunaxcode.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+639123456789"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  +63 912 345 6789
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/onboarding"
                className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Lunaxcode. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
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
