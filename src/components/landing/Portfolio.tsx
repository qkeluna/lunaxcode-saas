import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

export default function Portfolio() {
  const projects = [
    {
      title: 'E-Commerce Platform',
      category: 'Web Application',
      description: 'Full-featured online store with payment integration',
      image: '/portfolio/ecommerce.jpg',
      tags: ['Next.js', 'PayMongo', 'Tailwind'],
    },
    {
      title: 'Restaurant Website',
      category: 'Landing Page',
      description: 'Modern responsive website with online ordering',
      image: '/portfolio/restaurant.jpg',
      tags: ['React', 'Animation', 'Mobile-First'],
    },
    {
      title: 'Real Estate Portal',
      category: 'Web Application',
      description: 'Property listing platform with advanced search',
      image: '/portfolio/realestate.jpg',
      tags: ['Next.js', 'Maps API', 'CMS'],
    },
    {
      title: 'Corporate Website',
      category: 'Business Website',
      description: 'Professional company website with CMS',
      image: '/portfolio/corporate.jpg',
      tags: ['WordPress', 'SEO', 'Analytics'],
    },
    {
      title: 'Booking System',
      category: 'Web Application',
      description: 'Appointment scheduling with calendar integration',
      image: '/portfolio/booking.jpg',
      tags: ['React', 'Calendar', 'Email'],
    },
    {
      title: 'Portfolio Website',
      category: 'Landing Page',
      description: 'Stunning portfolio for creative professional',
      image: '/portfolio/portfolio.jpg',
      tags: ['Next.js', 'Animation', 'Gallery'],
    },
  ];

  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Recent Work
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how we've helped Filipino businesses achieve their digital goals
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Project Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-sm opacity-75">Project Screenshot</p>
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white flex items-center gap-2 text-lg font-semibold">
                    <ExternalLink className="w-5 h-5" />
                    View Project
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <div className="text-sm text-purple-600 font-semibold mb-2">
                  {project.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4">{project.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
