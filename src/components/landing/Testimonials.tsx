import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'Restaurant Owner',
      company: 'Kusina ni Maria',
      rating: 5,
      text: 'Lunaxcode transformed our business! The online ordering system they built increased our sales by 150%. Their AI-powered project management made everything so smooth.',
      avatar: '/avatars/maria.jpg',
    },
    {
      name: 'Juan dela Cruz',
      role: 'CEO',
      company: 'JDC Real Estate',
      rating: 5,
      text: 'Best decision we made! The property listing platform they developed is exactly what we needed. Fast turnaround, excellent communication, and affordable pricing.',
      avatar: '/avatars/juan.jpg',
    },
    {
      name: 'Anna Garcia',
      role: 'Boutique Owner',
      company: "Anna's Fashion",
      rating: 5,
      text: 'I was amazed by how quickly they understood my vision. The e-commerce site is beautiful and works perfectly on mobile. My customers love it!',
      avatar: '/avatars/anna.jpg',
    },
    {
      name: 'Roberto Lim',
      role: 'Fitness Coach',
      company: 'FitLife PH',
      rating: 5,
      text: 'The booking system they created saves me hours every week. Clients can easily schedule sessions, and I get instant notifications. Worth every peso!',
      avatar: '/avatars/roberto.jpg',
    },
    {
      name: 'Sofia Reyes',
      role: 'Photographer',
      company: 'Sofia Reyes Photography',
      rating: 5,
      text: 'My portfolio website is stunning! I get so many compliments from clients. The Lunaxcode team really understood the aesthetic I wanted.',
      avatar: '/avatars/sofia.jpg',
    },
    {
      name: 'Carlos Mendoza',
      role: 'Startup Founder',
      company: 'TechStart PH',
      rating: 5,
      text: 'From concept to launch in just 3 weeks! The AI-generated PRD was spot-on, and their dashboard let me track everything in real-time. Highly recommended!',
      avatar: '/avatars/carlos.jpg',
    },
  ];

  return (
    <section
      id="testimonials"
      className="relative py-24 lg:py-32 bg-background"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
            Testimonials
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6"
          >
            What our clients say
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Real feedback from Filipino business owners who trusted us with their projects.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <article
              key={index}
              className="group relative bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-lg hover:shadow-violet-500/5"
            >
              {/* Quote icon */}
              <Quote
                className="absolute top-6 right-6 w-8 h-8 text-violet-100 dark:text-violet-950"
                aria-hidden="true"
              />

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
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-sm font-medium text-violet-600 dark:text-violet-400">
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
            </article>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Join <span className="font-semibold text-foreground">50+ satisfied clients</span> who trusted Lunaxcode with their projects
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
