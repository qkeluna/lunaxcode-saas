import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import TrustBadges from '@/components/landing/TrustBadges';
import Portfolio from '@/components/landing/Portfolio';
import Features from '@/components/landing/Features';
import Process from '@/components/landing/Process';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import ContactCTA from '@/components/landing/ContactCTA';
import Footer from '@/components/landing/Footer';
import FloatingButtons from '@/components/landing/FloatingButtons';

// Force dynamic rendering for Cloudflare Pages
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <TrustBadges />
        <Portfolio />
        <Features />
        <Process />
        <Pricing />
        <Testimonials />
        <FAQ />
        <ContactCTA />
        <Footer />
        <FloatingButtons />
      </main>
    </>
  );
}
