import { FolderKanban, Users, CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getDatabase } from '@/lib/db/client';
import { projects, users } from '@/lib/db/schema';
import { eq, count, sql } from 'drizzle-orm';

// Fetch dashboard stats directly from database
async function getDashboardStats() {
  try {
    const db = getDatabase();

    if (!db) {
      throw new Error('Database not connected');
    }

    // Optimized: Use SQL aggregation for counts
    const [{ totalProjects }] = await db
      .select({ totalProjects: count() })
      .from(projects);

    const [{ activeProjects }] = await db
      .select({ activeProjects: count() })
      .from(projects)
      .where(eq(projects.status, 'in-progress'));

    const [{ completedProjects }] = await db
      .select({ completedProjects: count() })
      .from(projects)
      .where(eq(projects.status, 'completed'));

    const [{ totalClients }] = await db
      .select({ totalClients: count() })
      .from(users)
      .where(eq(users.role, 'client'));

    const [{ pendingPayments }] = await db
      .select({ pendingPayments: count() })
      .from(projects)
      .where(
        sql`${projects.paymentStatus} IN ('pending', 'partially-paid')`
      );

    // Calculate total revenue
    const allProjects = await db.select().from(projects);

    const totalRevenue = allProjects.reduce((sum, project) => {
      if (project.paymentStatus === 'paid') {
        return sum + (project.price || 0);
      } else if (project.paymentStatus === 'partially-paid') {
        return sum + (project.depositAmount || 0);
      }
      return sum;
    }, 0);

    // Get recent projects
    const recentProjectsRaw = await db
      .select({
        id: projects.id,
        name: projects.name,
        clientName: projects.clientName,
        status: projects.status,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .orderBy(sql`${projects.createdAt} DESC`)
      .limit(5);

    const recentProjects = recentProjectsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      status: p.status,
    }));

    // Get pending payments list
    const pendingPaymentsRaw = await db
      .select({
        id: projects.id,
        name: projects.name,
        price: projects.price,
        depositAmount: projects.depositAmount,
      })
      .from(projects)
      .where(
        sql`${projects.paymentStatus} IN ('pending', 'partially-paid')`
      )
      .limit(5);

    const pendingPaymentsList = pendingPaymentsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      balance: (p.price || 0) - (p.depositAmount || 0),
    }));

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalClients,
      pendingPayments,
      totalRevenue,
      recentProjects,
      pendingPaymentsList,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

export default async function AdminDashboardPage() {
  // Note: Authentication and admin role check is handled by the layout
  let stats;
  let hasError = false;

  try {
    stats = await getDashboardStats();
  } catch (error) {
    hasError = true;
    console.error('Failed to load dashboard stats:', error);
  }

  const dashboardStats = [
    {
      name: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      color: 'bg-blue-500',
      href: '/admin/projects',
    },
    {
      name: 'Active Projects',
      value: stats?.activeProjects ?? 0,
      icon: Clock,
      color: 'bg-yellow-500',
      href: '/admin/projects?status=in-progress',
    },
    {
      name: 'Completed Projects',
      value: stats?.completedProjects ?? 0,
      icon: CheckCircle2,
      color: 'bg-green-500',
      href: '/admin/projects?status=completed',
    },
    {
      name: 'Total Clients',
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: 'bg-purple-500',
      href: '/admin/clients',
    },
    {
      name: 'Pending Payments',
      value: stats?.pendingPayments ?? 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      href: '/admin/payments?status=pending',
    },
    {
      name: 'Total Revenue',
      value: `₱${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-indigo-500',
      href: '/admin/payments',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to the admin panel. Here&apos;s what&apos;s happening with your business.
        </p>
      </div>

      {/* Error Alert */}
      {hasError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard statistics</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Unable to fetch dashboard data. Please refresh the page or try again later.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="overflow-hidden rounded-lg bg-card border px-4 py-5 shadow hover:shadow-md transition-shadow sm:p-6"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-muted-foreground">{stat.name}</dt>
                  <dd className="text-2xl font-semibold text-foreground">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="rounded-lg bg-card border shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-foreground mb-4">
              Recent Projects
            </h3>
            {stats?.recentProjects && stats.recentProjects.length > 0 ? (
              <div className="space-y-3">
                {stats.recentProjects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}`}
                    className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.clientName}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : project.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent projects</p>
            )}
            <div className="mt-4">
              <Link
                href="/admin/projects"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 dark:text-blue-300 hover:text-blue-500"
              >
                View all projects →
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="rounded-lg bg-card border shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-foreground mb-4">
              Pending Payments
            </h3>
            {stats?.pendingPaymentsList && stats.pendingPaymentsList.length > 0 ? (
              <div className="space-y-3">
                {stats.pendingPaymentsList.map((project: any) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Balance: ₱{project.balance.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 dark:text-blue-300 hover:text-blue-500"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending payments</p>
            )}
            <div className="mt-4">
              <Link
                href="/admin/payments"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 dark:text-blue-300 hover:text-blue-500"
              >
                View all payments →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-card border shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/admin/projects"
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" />
                <span className="mt-2 block text-sm font-medium text-foreground">
                  Manage Projects
                </span>
              </div>
            </Link>
            <Link
              href="/admin/clients"
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                <span className="mt-2 block text-sm font-medium text-foreground">View Clients</span>
              </div>
            </Link>
            <Link
              href="/admin/cms"
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                <span className="mt-2 block text-sm font-medium text-foreground">
                  Manage Content
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
