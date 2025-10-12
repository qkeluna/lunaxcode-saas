export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Projects</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">
          No projects found. Create your first project!
        </p>
        <a
          href="/onboarding"
          className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Project
        </a>
      </div>
    </div>
  );
}
