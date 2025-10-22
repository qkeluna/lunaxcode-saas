import Image from 'next/image';
import { ExternalLink, Briefcase } from 'lucide-react';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { portfolio } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackPortfolio } from '@/lib/db/fallback-data';

async function getPortfolio() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback portfolio data for development');
      return fallbackPortfolio;
    }

    const db = drizzle(context.env.DB);
    const items = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.isActive, true))
      .orderBy(portfolio.order);

    return items;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return fallbackPortfolio;
  }
}

export default async function Portfolio() {
  const projects = await getPortfolio();

  return (
    <section
      id="portfolio"
      className="relative py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden"
      aria-labelledby="portfolio-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div
          className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--sp-colors-accent)' }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto" style={{ padding: '0 var(--sp-space-6)' }}>
        {/* Section Header */}
        <div className="text-center" style={{ marginBottom: 'var(--sp-space-8)' }}>
          <div
            className="inline-flex items-center backdrop-blur-sm bg-purple-100 text-purple-700 rounded-full font-bold mb-4"
            style={{ padding: 'var(--sp-space-2) var(--sp-space-4)', gap: 'var(--sp-space-2)' }}
          >
            <Briefcase className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Our Work</span>
          </div>

          <h2
            id="portfolio-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900"
            style={{ marginBottom: 'var(--sp-space-4)', letterSpacing: '-0.02em' }}
          >
            Recent Projects & Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how we&apos;ve helped Filipino businesses achieve their digital goals
          </p>
        </div>

        {/* Projects Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 'var(--sp-space-6)' }}
        >
          {projects.map((project, index) => (
            <div
              key={project.id || index}
              className="group relative backdrop-blur-sm bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Project Image */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, var(--sp-colors-accent), #a78bfa)` }}>
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white" style={{ padding: 'var(--sp-space-8)' }}>
                      <div className="text-6xl mb-4">🚀</div>
                      <p className="text-sm opacity-75">Project Screenshot</p>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm"
                    aria-label={`View ${project.title} project`}
                  >
                    <div className="text-white flex items-center font-bold text-lg" style={{ gap: 'var(--sp-space-2)' }}>
                      <ExternalLink className="w-5 h-5" aria-hidden="true" />
                      View Project
                    </div>
                  </a>
                )}

                {/* Category badge */}
                <div
                  className="absolute top-4 left-4 backdrop-blur-md bg-white/90 rounded-full font-bold text-xs shadow-md"
                  style={{ padding: 'var(--sp-space-2) var(--sp-space-3)', color: 'var(--sp-colors-accent)' }}
                >
                  {project.category}
                </div>
              </div>

              {/* Project Info */}
              <div style={{ padding: 'var(--sp-space-6)' }}>
                <h3
                  className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors"
                  style={{ marginBottom: 'var(--sp-space-2)' }}
                >
                  {project.title}
                </h3>
                <p className="text-gray-600 leading-relaxed" style={{ marginBottom: 'var(--sp-space-4)' }}>
                  {project.description}
                </p>

                {/* Tags */}
                {project.technologies && (
                  <div className="flex flex-wrap" style={{ gap: 'var(--sp-space-2)' }}>
                    {JSON.parse(project.technologies).map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="backdrop-blur-sm bg-purple-50 text-purple-700 text-xs font-medium rounded-lg"
                        style={{ padding: 'var(--sp-space-1) var(--sp-space-3)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center backdrop-blur-sm bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl shadow-sm"
          style={{ marginTop: 'var(--sp-space-8)', padding: 'var(--sp-space-8)' }}
        >
          <h3
            className="text-2xl font-bold text-gray-900"
            style={{ marginBottom: 'var(--sp-space-3)' }}
          >
            Ready to See Your Project Here?
          </h3>
          <p
            className="text-gray-600 max-w-xl mx-auto"
            style={{ marginBottom: 'var(--sp-space-4)' }}
          >
            Join our growing portfolio of successful projects
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
            <ExternalLink className="w-5 h-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
