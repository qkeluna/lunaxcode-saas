import { getServerSession } from 'next-auth';

export default async function DashboardPage() {
  const session = await getServerSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session!.user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your projects
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Projects', value: '0', color: 'bg-blue-500' },
          { title: 'Active', value: '0', color: 'bg-yellow-500' },
          { title: 'Completed', value: '0', color: 'bg-green-500' },
          { title: 'Pending Payment', value: '0', color: 'bg-red-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">{stat.title}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
            <div className={`${stat.color} h-1 mt-4 rounded`} />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/onboarding"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <p className="font-medium text-gray-900">Create New Project</p>
            <p className="text-sm text-gray-600 mt-1">
              Start a new project with AI
            </p>
          </a>
          <a
            href="/projects"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <p className="font-medium text-gray-900">View All Projects</p>
            <p className="text-sm text-gray-600 mt-1">
              Browse your projects
            </p>
          </a>
          <a
            href="/settings"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <p className="font-medium text-gray-900">Settings</p>
            <p className="text-sm text-gray-600 mt-1">
              Configure your account
            </p>
          </a>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        <div className="text-center py-12 text-gray-500">
          <p>No projects yet. Create your first project to get started!</p>
        </div>
      </div>
    </div>
  );
}
