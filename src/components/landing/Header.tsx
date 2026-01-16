'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/shadcn-io/navbar-06';
import type { Session } from 'next-auth';

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration - only show scroll effects after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Check initial scroll position after mount
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  const navLinks = [
    { href: '#portfolio', label: 'Portfolio' },
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#process', label: 'Process' },
    { href: '#faq', label: 'FAQ' },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Skip Navigation Link - Accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to content
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          mounted && isScrolled
            ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/android-chrome-192x192.png"
                alt="Lunaxcode Logo"
                width={32}
                height={32}
                className="rounded-lg transition-transform group-hover:scale-105"
                priority
              />
              <span className="text-xl font-bold text-foreground font-display">
                Lunaxcode
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full" />
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted" />

              {session ? (
                <Link href={session.user?.role === 'admin' ? '/admin' : '/dashboard'} className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Login
                  </Button>
                </Link>
              )}

              <Button
                onClick={() => {
                  const element = document.querySelector('#pricing');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                size="sm"
                className="hidden sm:inline-flex bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-full px-5 shadow-md hover:shadow-lg transition-all"
              >
                Get Started
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-4 border-t border-border">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-3 mt-2 border-t border-border space-y-2">
                  {session ? (
                    <Link
                      href={session.user?.role === 'admin' ? '/admin' : '/dashboard'}
                      className="flex items-center justify-between px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                    >
                      Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center justify-between px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                    >
                      Login
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      const element = document.querySelector('#pricing');
                      element?.scrollIntoView({ behavior: 'smooth' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 mx-4 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium rounded-full"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
