import Image from 'next/image';
import { ExternalLink, ArrowRight } from 'lucide-react';
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
      className="relative py-24 lg:py-32 bg-muted/30"
      aria-labelledby="portfolio-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
            Our Work
          </p>
          <h2
            id="portfolio-heading"
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6"
          >
            Recent projects
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            See how we&apos;ve helped Filipino businesses achieve their digital goals.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <article
              key={project.id || index}
              className="group bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-lg hover:shadow-violet-500/5"
            >
              {/* Project Image */}
              <div className="relative h-56 overflow-hidden bg-violet-100 dark:bg-violet-950/30">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-violet-200 dark:bg-violet-900/50 flex items-center justify-center">
                      <span className="text-3xl">🚀</span>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    aria-label={`View ${project.title} project`}
                  >
                    <span className="inline-flex items-center gap-2 text-background font-medium">
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      View Project
                    </span>
                  </a>
                )}

                {/* Category badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
                  {project.category}
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tags */}
                {project.technologies && (
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(project.technologies).map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="px-2.5 py-1 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="font-display text-2xl font-bold text-foreground tracking-tight mb-2">
                Ready to see your project here?
              </h3>
              <p className="text-muted-foreground">
                Join our growing portfolio of successful projects.
              </p>
            </div>
            <a
              href="#pricing"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-colors"
              aria-label="Start your project"
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
