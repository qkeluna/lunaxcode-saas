import { FolderKanban, Users, CreditCard, CheckCircle2, Clock, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getDatabase } from '@/lib/db/client';
import { projects, users } from '@/lib/db/schema';
import { eq, count, sql } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';

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
      gradient: 'from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      href: '/admin/projects',
    },
    {
      name: 'Active Projects',
      value: stats?.activeProjects ?? 0,
      icon: Clock,
      gradient: 'from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10',
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      href: '/admin/projects?status=in-progress',
    },
    {
      name: 'Completed Projects',
      value: stats?.completedProjects ?? 0,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/20 to-green-500/20 dark:from-emerald-500/10 dark:to-green-500/10',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      href: '/admin/projects?status=completed',
    },
    {
      name: 'Total Clients',
      value: stats?.totalClients ?? 0,
      icon: Users,
      gradient: 'from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10',
      iconBg: 'bg-violet-500/10 dark:bg-violet-500/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      href: '/admin/clients',
    },
    {
      name: 'Pending Payments',
      value: stats?.pendingPayments ?? 0,
      icon: AlertCircle,
      gradient: 'from-rose-500/20 to-red-500/20 dark:from-rose-500/10 dark:to-red-500/10',
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      href: '/admin/payments?status=pending',
    },
    {
      name: 'Total Revenue',
      value: `₱${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      gradient: 'from-teal-500/20 to-cyan-500/20 dark:from-teal-500/10 dark:to-cyan-500/10',
      iconBg: 'bg-teal-500/10 dark:bg-teal-500/20',
      iconColor: 'text-teal-600 dark:text-teal-400',
      href: '/admin/payments',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Error Alert */}
      {hasError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading dashboard statistics</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Unable to fetch dashboard data. Please refresh the page or try again later.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-6 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50 transition-opacity duration-300 group-hover:opacity-100`} />

            <div className="relative flex items-start justify-between">
              <div className="space-y-3">
                <div className={`inline-flex rounded-lg ${stat.iconBg} p-2.5`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground/50 transition-all duration-300 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Recent Projects
            </h3>
          </div>
          <div className="p-6">
            {stats?.recentProjects && stats.recentProjects.length > 0 ? (
              <div className="space-y-2">
                {stats.recentProjects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}`}
                    className="group flex items-center justify-between p-3 -mx-3 rounded-lg transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.clientName}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`ml-3 shrink-0 ${
                        project.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : project.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}
                    >
                      {project.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent projects</p>
            )}
            <div className="mt-4 pt-4 border-t border-border/50">
              <Link
                href="/admin/projects"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all projects
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Pending Payments
            </h3>
          </div>
          <div className="p-6">
            {stats?.pendingPaymentsList && stats.pendingPaymentsList.length > 0 ? (
              <div className="space-y-2">
                {stats.pendingPaymentsList.map((project: any) => (
                  <div
                    key={project.id}
                    className="group flex items-center justify-between p-3 -mx-3 rounded-lg transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Balance: <span className="font-medium text-rose-600 dark:text-rose-400">₱{project.balance.toLocaleString()}</span>
                      </p>
                    </div>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="ml-3 shrink-0 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All payments are up to date!</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border/50">
              <Link
                href="/admin/payments"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all payments
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
        <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/admin/projects"
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 p-6 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10"
            >
              <div className="rounded-xl bg-blue-500/10 dark:bg-blue-500/20 p-3 mb-3 transition-transform duration-300 group-hover:scale-110">
                <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-foreground">Manage Projects</span>
              <span className="text-xs text-muted-foreground mt-1">View & edit all projects</span>
            </Link>
            <Link
              href="/admin/clients"
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 p-6 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10"
            >
              <div className="rounded-xl bg-violet-500/10 dark:bg-violet-500/20 p-3 mb-3 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm font-medium text-foreground">View Clients</span>
              <span className="text-xs text-muted-foreground mt-1">Manage client accounts</span>
            </Link>
            <Link
              href="/admin/cms/services"
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 p-6 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10"
            >
              <div className="rounded-xl bg-teal-500/10 dark:bg-teal-500/20 p-3 mb-3 transition-transform duration-300 group-hover:scale-110">
                <CreditCard className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-sm font-medium text-foreground">Manage Content</span>
              <span className="text-xs text-muted-foreground mt-1">Edit CMS & services</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
