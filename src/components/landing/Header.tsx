'use client';

import Link from 'next/link';
import { Navbar06, ThemeToggle } from '@/components/ui/shadcn-io/navbar-06';
import type { Navbar06NavItem } from '@/components/ui/shadcn-io/navbar-06';
import { BriefcaseIcon, SparklesIcon, DollarSignIcon, WorkflowIcon, HelpCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Session } from 'next-auth';

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const navLinks: Navbar06NavItem[] = [
    { href: '#portfolio', label: 'Portfolio', icon: BriefcaseIcon },
    { href: '#features', label: 'Features', icon: SparklesIcon },
    { href: '#pricing', label: 'Pricing', icon: DollarSignIcon },
    { href: '#process', label: 'Process', icon: WorkflowIcon },
    { href: '#faq', label: 'FAQ', icon: HelpCircleIcon },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStartedClick = () => {
    const element = document.querySelector('#pricing');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const logo = (
    <Link href="/" className="flex items-center gap-2">
      <img
        src="/android-chrome-192x192.png"
        alt="Lunaxcode Logo"
        className="w-8 h-8"
      />
      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Lunaxcode
      </span>
    </Link>
  );

  const customActions = (
    <div className="flex items-center gap-1 md:gap-2">
      <ThemeToggle className="text-white hover:text-purple-300 hover:bg-white/10" />
      {session ? (
        <Link href={session.user?.role === 'admin' ? '/admin' : '/dashboard'} className="hidden sm:inline-flex">
          <Button variant="ghost" className="text-sm md:text-base font-medium text-white hover:text-purple-300 hover:bg-white/10">
            Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/login" className="hidden sm:inline-flex">
          <Button variant="ghost" className="text-sm md:text-base font-medium text-white hover:text-purple-300 hover:bg-white/10">
            Login
          </Button>
        </Link>
      )}
      <Button
        onClick={handleGetStartedClick}
        className="text-sm md:text-base font-medium bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-3 md:px-4"
      >
        Get Started
      </Button>
    </div>
  );

  return (
    <Navbar06
      logo={logo}
      navigationLinks={navLinks}
      onNavItemClick={handleNavClick}
      showUserMenu={false}
      showLanguageSelector={false}
      customActions={customActions}
      className="bg-gradient-to-r from-purple-900 to-indigo-900 border-none [&_a]:text-white/90 [&_a:hover]:text-white [&_a:hover]:bg-white/10"
    />
  );
}
