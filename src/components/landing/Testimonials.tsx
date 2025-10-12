import { Star, Quote } from 'lucide-react';

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
    <section id="testimonials" className="py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real feedback from real Filipino business owners
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-purple-200">
                <Quote className="w-12 h-12" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-gray-700 mb-6 leading-relaxed relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6 text-lg">
            Join 50+ satisfied clients who trusted Lunaxcode with their projects
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Your Success Story
            <Star className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
