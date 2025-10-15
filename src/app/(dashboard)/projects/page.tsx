import { auth } from '@/auth';
import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { projects, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Fetch projects directly from database
async function getProjects(userEmail: string) {
  try {
    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      console.error('Database not available');
      return { projects: [], usingDatabase: false };
    }

    const db = drizzle(context.env.DB);

    // Get user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user) {
      console.error('User not found:', userEmail);
      return { projects: [], usingDatabase: false };
    }

    // Get user's projects
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(desc(projects.createdAt));

    return { projects: userProjects, usingDatabase: true };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projects: [], usingDatabase: false };
  }
}

export default async function ProjectsPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return <div>Please log in to view your projects</div>;
  }

  const { projects, usingDatabase } = await getProjects(session.user.email);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600 mt-1">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} total
          </p>
        </div>
        <Link
          href="/onboarding"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Project
        </Link>
      </div>

      {!usingDatabase && projects.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Projects are stored in memory and will be lost on server restart. Set up D1 database for persistence.
          </p>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg mb-4">
            No projects found. Create your first project!
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600">{project.service}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    project.paymentStatus === 'partially-paid' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {project.paymentStatus}
                  </span>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold text-gray-900">
                      ₱{project.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Timeline</span>
                  <span className="text-gray-900">
                    {project.timeline} days
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const runtime = 'edge';
