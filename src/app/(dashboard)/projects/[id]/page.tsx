import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Project #{params.id}</h1>

        <div className="space-y-6">
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Setup Required</h2>
            <p className="text-gray-700 mb-4">
              To view project details, you need to set up the Cloudflare D1 database:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Run: <code className="bg-gray-200 px-2 py-1 rounded">wrangler d1 create lunaxcode-dev</code></li>
              <li>Copy the database_id to wrangler.toml</li>
              <li>Run: <code className="bg-gray-200 px-2 py-1 rounded">wrangler d1 migrations apply lunaxcode-dev --local</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Pending
              </span>
            </div>

            <div className="p-6 bg-white border rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Payment</h3>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                Not Paid
              </span>
            </div>

            <div className="p-6 bg-white border rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Progress</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }} />
                </div>
                <span className="text-sm font-medium">0%</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Project Requirements Document</h3>
            <p className="text-gray-600">
              PRD will be displayed here once the database is connected.
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Tasks</h3>
            <p className="text-gray-600">
              Task list will be displayed here once the database is connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
