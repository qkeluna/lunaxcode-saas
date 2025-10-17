import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { projects, users, tasks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ProjectsListClient } from '@/components/projects/ProjectsListClient';
import { ProjectsSkeleton } from '@/components/projects/ProjectsSkeleton';

// Fetch projects with tasks from database
async function getProjectsWithTasks(userEmail: string) {
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

    // Get tasks for each project
    const projectsWithTasks = await Promise.all(
      userProjects.map(async (project) => {
        const projectTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.projectId, project.id));

        return {
          ...project,
          tasks: projectTasks,
        };
      })
    );

    return { projects: projectsWithTasks, usingDatabase: true };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projects: [], usingDatabase: false };
  }
}

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const { projects, usingDatabase } = await getProjectsWithTasks(session.user.email);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600 mt-1">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} total
          </p>
        </div>
        <Link
          href="/onboarding"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsListClient projects={projects} />
      </Suspense>
    </div>
  );
}

export const runtime = 'edge';
