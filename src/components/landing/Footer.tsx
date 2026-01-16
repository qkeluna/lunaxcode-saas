import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/android-chrome-192x192.png"
                alt="Lunaxcode Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-foreground font-display">
                Lunaxcode
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              AI-powered web development for Filipino businesses. Turning ideas into digital reality since 2024.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com/lunaxcode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/lunaxcode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/lunaxcode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Client Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Landing Pages
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Business Websites
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  E-Commerce Platforms
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Web Applications
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mobile Apps
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">
                  Metro Manila, Philippines
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href="mailto:lunaxcode2030@gmail.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  lunaxcode2030@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href="tel:+639190852974"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  +63 919 085 2974
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Lunaxcode. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
