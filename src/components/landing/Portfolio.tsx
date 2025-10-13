import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
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
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <div className="text-6xl mb-4">🚀</div>
                      <p className="text-sm opacity-75">Project Screenshot</p>
                    </div>
                  </div>
                )}
                {/* Hover overlay */}
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <div className="text-white flex items-center gap-2 text-lg font-semibold">
                      <ExternalLink className="w-5 h-5" />
                      View Project
                    </div>
                  </a>
                )}
              </div>

              {/* Project Info */}
              <div className="p-6">
                <div className="text-sm text-purple-600 font-semibold mb-2">
                  {project.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 mb-4">{project.description}</p>

                {/* Tags */}
                {project.technologies && (
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(project.technologies).map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
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
      </div>
    </section>
  );
}
