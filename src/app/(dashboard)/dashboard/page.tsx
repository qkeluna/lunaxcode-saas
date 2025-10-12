import { auth } from '@/auth';
import Link from 'next/link';
import { FolderKanban, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Fetch projects from API
async function getProjects() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/projects`, {
      cache: 'no-store',
    });

    if (!response.ok) return { projects: [], usingDatabase: false };

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projects: [], usingDatabase: false };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  const { projects, usingDatabase } = await getProjects();

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'in-progress').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
    pendingPayment: projects.filter((p: any) => p.paymentStatus === 'pending').length,
  };

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session!.user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your projects
        </p>
        {!usingDatabase && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Using in-memory storage. Projects will reset on server restart.
              <Link href="/setup" className="underline ml-1">Set up D1 database</Link>
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Projects', value: stats.total, icon: FolderKanban, color: 'bg-blue-500' },
          { title: 'Active', value: stats.active, icon: Clock, color: 'bg-yellow-500' },
          { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-500' },
          { title: 'Pending Payment', value: stats.pendingPayment, icon: AlertCircle, color: 'bg-red-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/onboarding"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <p className="font-medium text-gray-900">Create New Project</p>
            <p className="text-sm text-gray-600 mt-1">
              Start a new project with AI
            </p>
          </Link>
          <Link
            href="/projects"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <p className="font-medium text-gray-900">View All Projects</p>
            <p className="text-sm text-gray-600 mt-1">
              Browse your projects
            </p>
          </Link>
          <Link
            href="/settings"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <p className="font-medium text-gray-900">Settings</p>
            <p className="text-sm text-gray-600 mt-1">
              Configure your account
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          {projects.length > 0 && (
            <Link href="/projects" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No projects yet. Create your first project to get started!</p>
            <Link
              href="/onboarding"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project: any) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{project.service}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      project.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      project.paymentStatus === 'partially-paid' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.paymentStatus}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const runtime = 'edge';
