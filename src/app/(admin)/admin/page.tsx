import { FolderKanban, Users, CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Fetch dashboard stats
async function getDashboardStats() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/stats`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const dashboardStats = [
    {
      name: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-blue-500',
      href: '/admin/projects',
    },
    {
      name: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      href: '/admin/projects?status=in-progress',
    },
    {
      name: 'Completed Projects',
      value: stats?.completedProjects || 0,
      icon: CheckCircle2,
      color: 'bg-green-500',
      href: '/admin/projects?status=completed',
    },
    {
      name: 'Total Clients',
      value: stats?.totalClients || 0,
      icon: Users,
      color: 'bg-purple-500',
      href: '/admin/clients',
    },
    {
      name: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      href: '/admin/payments?status=pending',
    },
    {
      name: 'Total Revenue',
      value: `₱${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-indigo-500',
      href: '/admin/payments',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to the admin panel. Here's what's happening with your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-md transition-shadow sm:p-6"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
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
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.clientName}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent projects</p>
            )}
            <div className="mt-4">
              <Link
                href="/admin/projects"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all projects →
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
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
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">
                        Balance: ₱{project.balance.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No pending payments</p>
            )}
            <div className="mt-4">
              <Link
                href="/admin/payments"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all payments →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/admin/projects"
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <FolderKanban className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Manage Projects
                </span>
              </div>
            </Link>
            <Link
              href="/admin/clients"
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <Users className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">View Clients</span>
              </div>
            </Link>
            <Link
              href="/admin/cms"
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <CreditCard className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
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
