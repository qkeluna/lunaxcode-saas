'use client';

import { Star, Quote, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger navigation

const testimonials = [
  {
    name: 'Maria Santos',
    role: 'Restaurant Owner',
    company: 'Kusina ni Maria',
    rating: 5,
    text: 'Lunaxcode transformed our business! The online ordering system they built increased our sales by 150%. Their AI-powered project management made everything so smooth.',
    highlight: '150% sales increase',
  },
  {
    name: 'Juan dela Cruz',
    role: 'CEO',
    company: 'JDC Real Estate',
    rating: 5,
    text: 'Best decision we made! The property listing platform they developed is exactly what we needed. Fast turnaround, excellent communication, and affordable pricing.',
    highlight: 'Fast turnaround',
  },
  {
    name: 'Anna Garcia',
    role: 'Boutique Owner',
    company: "Anna's Fashion",
    rating: 5,
    text: 'I was amazed by how quickly they understood my vision. The e-commerce site is beautiful and works perfectly on mobile. My customers love it!',
    highlight: 'Mobile-perfect',
  },
  {
    name: 'Roberto Lim',
    role: 'Fitness Coach',
    company: 'FitLife PH',
    rating: 5,
    text: 'The booking system they created saves me hours every week. Clients can easily schedule sessions, and I get instant notifications. Worth every peso!',
    highlight: 'Hours saved weekly',
  },
  {
    name: 'Sofia Reyes',
    role: 'Photographer',
    company: 'Sofia Reyes Photography',
    rating: 5,
    text: 'My portfolio website is stunning! I get so many compliments from clients. The Lunaxcode team really understood the aesthetic I wanted.',
    highlight: 'Stunning design',
  },
  {
    name: 'Carlos Mendoza',
    role: 'Startup Founder',
    company: 'TechStart PH',
    rating: 5,
    text: 'From concept to launch in just 3 weeks! The AI-generated PRD was spot-on, and their dashboard let me track everything in real-time. Highly recommended!',
    highlight: '3-week delivery',
  },
];

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchCurrentRef = useRef<number>(0);

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

  // Auto-advance carousel on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchCurrentRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartRef.current.x;
    const diffY = currentY - touchStartRef.current.y;

    // Only track horizontal swipes (ignore vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault(); // Prevent vertical scroll when swiping horizontally
      touchCurrentRef.current = currentX;
      setSwipeOffset(diffX);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;

    const diffX = touchCurrentRef.current - touchStartRef.current.x;

    if (Math.abs(diffX) >= SWIPE_THRESHOLD) {
      if (diffX > 0) {
        // Swipe right - go to previous
        prevTestimonial();
      } else {
        // Swipe left - go to next
        nextTestimonial();
      }
    }

    // Reset touch tracking
    touchStartRef.current = null;
    touchCurrentRef.current = 0;
    setIsSwiping(false);
    setSwipeOffset(0);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative py-24 lg:py-32 bg-background overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-violet-100/30 via-transparent to-transparent dark:from-violet-950/20 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className={`text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Testimonials
          </p>
          <h2
            id="testimonials-heading"
            className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            What our clients say
          </h2>
          <p className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Real feedback from Filipino business owners who trusted us with their projects.
          </p>

          {/* Aggregate rating badge */}
          <div className={`inline-flex items-center gap-3 mt-6 px-5 py-3 bg-card border border-border rounded-full transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">5.0</span> from 50+ reviews
            </span>
          </div>
        </div>

        {/* Mobile Carousel */}
        <div
          className="lg:hidden relative touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="overflow-hidden">
            <div
              className={`flex ${isSwiping ? '' : 'transition-transform duration-500 ease-out'}`}
              style={{
                transform: `translateX(calc(-${currentIndex * 100}% + ${swipeOffset}px))`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <article
                  key={index}
                  className="w-full flex-shrink-0 px-2"
                >
                  <div className="bg-card border border-border rounded-2xl p-6">
                    {/* Highlight badge */}
                    <div className="inline-flex items-center px-3 py-1 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full mb-4">
                      {testimonial.highlight}
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Testimonial text */}
                    <blockquote className="text-muted-foreground leading-relaxed mb-6 text-sm">
                      &ldquo;{testimonial.text}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-medium text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-violet-300 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-6 bg-violet-600'
                      : 'bg-border hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-violet-300 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Swipe hint */}
          <p className="text-xs text-muted-foreground text-center mt-3">
            Swipe to see more reviews
          </p>
        </div>

        {/* Desktop Grid - Show first 3 prominently, rest smaller */}
        <div className="hidden lg:block">
          {/* Featured testimonials (first 3) */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <article
                key={index}
                className={`group relative bg-card border border-border rounded-2xl p-8 transition-all duration-500 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 100 + 400}ms` }}
              >
                {/* Quote icon */}
                <Quote
                  className="absolute top-6 right-6 w-10 h-10 text-violet-100 dark:text-violet-950/50"
                  aria-hidden="true"
                />

                {/* Highlight badge */}
                <div className="inline-flex items-center px-3 py-1 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full mb-4">
                  {testimonial.highlight}
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>

                {/* Testimonial text */}
                <blockquote className="text-muted-foreground leading-relaxed mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-6 border-t border-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Secondary testimonials (remaining 3) */}
          <div className="grid grid-cols-3 gap-8">
            {testimonials.slice(3).map((testimonial, index) => (
              <article
                key={index + 3}
                className={`group relative bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-lg hover:shadow-violet-500/5 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(index + 3) * 100 + 400}ms` }}
              >
                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>

                {/* Testimonial text */}
                <blockquote className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-xs font-medium text-violet-600 dark:text-violet-400">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Stats & CTA */}
        <div className={`mt-16 pt-16 border-t border-border transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex -space-x-3">
                {['M', 'J', 'A', 'R', 'S'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                  >
                    {initial}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/50 border-2 border-background flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400">
                  +45
                </div>
              </div>
              <p className="text-muted-foreground">
                Join <span className="font-semibold text-foreground">50+ satisfied clients</span> who trusted Lunaxcode
              </p>
            </div>

            <a
              href="#pricing"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Start Your Project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
