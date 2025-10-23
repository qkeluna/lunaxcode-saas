import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { FolderKanban, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { projects, users, payments } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import DashboardSkeleton, {
  StatCardSkeleton,
  ChartSkeleton,
  FinancialSummarySkeleton,
  ActivityTimelineSkeleton,
  ProjectListSkeleton,
} from '@/components/dashboard/DashboardSkeleton';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import FinancialSummary from '@/components/dashboard/FinancialSummary';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';

// Fetch projects and payments directly from database
async function getDashboardData(userEmail: string) {
  try {
    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      console.error('Database not available');
      return { projects: [], payments: [], usingDatabase: false };
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
      return { projects: [], payments: [], usingDatabase: false };
    }

    // Get user's projects and payments in parallel
    const [userProjects, userPayments] = await Promise.all([
      db
        .select()
        .from(projects)
        .where(eq(projects.userId, user.id))
        .orderBy(desc(projects.createdAt)),
      db
        .select()
        .from(payments)
        .where(eq(payments.userId, user.id))
        .orderBy(desc(payments.createdAt)),
    ]);

    return { projects: userProjects, payments: userPayments, usingDatabase: true };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { projects: [], payments: [], usingDatabase: false };
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  // Redirect admins to /admin dashboard
  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  const { projects, payments, usingDatabase } = await getDashboardData(session.user.email);

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'in-progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    pendingPayment: projects.filter((p) => p.paymentStatus === 'pending').length,
  };

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with your projects
        </p>
        {!usingDatabase && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Using in-memory storage. Projects will reset on server restart.
              <Link href="/setup" className="underline ml-1 hover:text-yellow-900 dark:hover:text-yellow-100">Set up D1 database</Link>
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Projects', value: stats.total, icon: FolderKanban, color: 'bg-blue-500' },
            { title: 'Active', value: stats.active, icon: Clock, color: 'bg-yellow-500' },
            { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-500' },
            { title: 'Pending Payment', value: stats.pendingPayment, icon: AlertCircle, color: 'bg-red-500' },
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Suspense>

      {/* Financial Summary */}
      <Suspense fallback={<FinancialSummarySkeleton />}>
        <FinancialSummary projects={projects} payments={payments} />
      </Suspense>

      {/* Charts Section */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      }>
        <DashboardCharts projects={projects} />
      </Suspense>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/onboarding"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
          >
            <p className="font-medium text-gray-900 dark:text-white">Create New Project</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Start a new project with AI
            </p>
          </Link>
          <Link
            href="/projects"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
          >
            <p className="font-medium text-gray-900 dark:text-white">View All Projects</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Browse your projects
            </p>
          </Link>
          <Link
            href="/settings"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
          >
            <p className="font-medium text-gray-900 dark:text-white">Settings</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure your account
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Projects and Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ProjectListSkeleton />}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Projects</h2>
                {projects.length > 0 && (
                  <Link href="/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    View all →
                  </Link>
                )}
              </div>

              {recentProjects.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p>No projects yet. Create your first project to get started!</p>
                  <Link
                    href="/onboarding"
                    className="inline-block mt-4 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Create Project
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.service}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            project.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            project.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {project.status}
                          </span>
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            project.paymentStatus === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            project.paymentStatus === 'partially-paid' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
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
          </Suspense>
        </div>

        {/* Activity Timeline - Takes 1 column */}
        <Suspense fallback={<ActivityTimelineSkeleton />}>
          <ActivityTimeline projects={projects} maxActivities={8} />
        </Suspense>
      </div>
    </div>
  );
}

export const runtime = 'edge';
