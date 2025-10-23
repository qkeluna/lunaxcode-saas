import { Star, Quote, MessageCircle } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'Restaurant Owner',
      company: 'Kusina ni Maria',
      rating: 5,
      text: 'Lunaxcode transformed our business! The online ordering system they built increased our sales by 150%. Their AI-powered project management made everything so smooth.',
      avatar: '👩‍🍳',
    },
    {
      name: 'Juan dela Cruz',
      role: 'CEO',
      company: 'JDC Real Estate',
      rating: 5,
      text: 'Best decision we made! The property listing platform they developed is exactly what we needed. Fast turnaround, excellent communication, and affordable pricing.',
      avatar: '👨‍💼',
    },
    {
      name: 'Anna Garcia',
      role: 'Boutique Owner',
      company: 'Anna\'s Fashion',
      rating: 5,
      text: 'I was amazed by how quickly they understood my vision. The e-commerce site is beautiful and works perfectly on mobile. My customers love it!',
      avatar: '👗',
    },
    {
      name: 'Roberto Lim',
      role: 'Fitness Coach',
      company: 'FitLife PH',
      rating: 5,
      text: 'The booking system they created saves me hours every week. Clients can easily schedule sessions, and I get instant notifications. Worth every peso!',
      avatar: '💪',
    },
    {
      name: 'Sofia Reyes',
      role: 'Photographer',
      company: 'Sofia Reyes Photography',
      rating: 5,
      text: 'My portfolio website is stunning! I get so many compliments from clients. The Lunaxcode team really understood the aesthetic I wanted.',
      avatar: '📸',
    },
    {
      name: 'Carlos Mendoza',
      role: 'Startup Founder',
      company: 'TechStart PH',
      rating: 5,
      text: 'From concept to launch in just 3 weeks! The AI-generated PRD was spot-on, and their dashboard let me track everything in real-time. Highly recommended!',
      avatar: '🚀',
    },
  ];

  return (
    <section
      id="testimonials"
      className="relative py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--sp-colors-accent)' }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto" style={{ padding: '0 var(--sp-space-6)' }}>
        {/* Section Header */}
        <div className="text-center" style={{ marginBottom: 'var(--sp-space-8)' }}>
          <div
            className="inline-flex items-center backdrop-blur-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold mb-4"
            style={{ padding: 'var(--sp-space-2) var(--sp-space-4)', gap: 'var(--sp-space-2)' }}
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Client Testimonials</span>
          </div>

          <h2
            id="testimonials-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
            style={{ marginBottom: 'var(--sp-space-4)', letterSpacing: '-0.02em' }}
          >
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real feedback from real Filipino business owners
          </p>
        </div>

        {/* Testimonials Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 'var(--sp-space-6)' }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative backdrop-blur-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              style={{ padding: 'var(--sp-space-8)' }}
            >
              {/* Hover gradient effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--sp-colors-accent), transparent)`
                }}
                aria-hidden="true"
              ></div>

              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-purple-100 dark:text-purple-900/50" aria-hidden="true">
                <Quote className="w-12 h-12" />
              </div>

              {/* Rating */}
              <div className="flex mb-4" style={{ gap: 'var(--sp-space-1)' }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                ))}
              </div>

              {/* Testimonial text */}
              <p
                className="text-gray-700 dark:text-gray-300 leading-relaxed relative z-10"
                style={{ marginBottom: 'var(--sp-space-6)' }}
              >
                &quot;{testimonial.text}&quot;
              </p>

              {/* Author */}
              <div
                className="flex items-center pt-4 border-t border-gray-100 dark:border-gray-700"
                style={{ gap: 'var(--sp-space-4)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md bg-gradient-to-br"
                  style={{ backgroundImage: `linear-gradient(to bottom right, var(--sp-colors-accent), #a78bfa)` }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div
          className="text-center backdrop-blur-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl shadow-sm"
          style={{ marginTop: 'var(--sp-space-8)', padding: 'var(--sp-space-8)' }}
        >
          <p
            className="text-gray-700 dark:text-gray-300 text-lg font-bold"
            style={{ marginBottom: 'var(--sp-space-4)' }}
          >
            Join 50+ satisfied clients who trusted Lunaxcode with their projects
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r py-3 px-6"
            style={{
              minHeight: '48px',
              gap: 'var(--sp-space-2)',
              backgroundImage: `linear-gradient(to right, var(--sp-colors-accent), #a78bfa)`
            }}
            aria-label="View pricing"
          >
            View Pricing
            <Star className="w-5 h-5" fill="currentColor" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
