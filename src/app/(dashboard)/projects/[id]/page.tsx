import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import TaskList from '@/components/projects/TaskList';
import FilesSection from '@/components/projects/FilesSection';
import MessagingCenter from '@/components/projects/MessagingCenter';
import PaymentReminder from '@/components/projects/PaymentReminder';
import ProgressTracker from '@/components/projects/ProgressTracker';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { projects, users, tasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Fetch single project with tasks directly from database
async function getProject(projectId: string, userEmail: string) {
  try {
    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      console.error('Database not available');
      return { error: true };
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
      return { error: true };
    }

    // Get project by ID and verify ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, parseInt(projectId)),
          eq(projects.userId, user.id)
        )
      )
      .limit(1);

    if (!project) {
      return { notFound: true };
    }

    // Get tasks for this project
    const projectTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, project.id))
      .orderBy(tasks.order);

    return {
      project: {
        ...project,
        tasks: projectTasks
      }
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return { error: true };
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const { id } = await params;
  const result = await getProject(id, session.user.email);

  // Handle different error states
  if (result.notFound) {
    notFound();
  }

  if (result.error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Project</h2>
          <p className="text-red-600">Failed to load project details. Please try again later.</p>
          <Link
            href="/projects"
            className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const { project } = result;
  const tasks = project.tasks || [];

  // Format dates
  const startDate = project.startDate
    ? new Date(project.startDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not set';
  const endDate = project.endDate
    ? new Date(project.endDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not set';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/projects"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.service}</p>
        </div>
      </div>

      {/* Payment Reminder */}
      <PaymentReminder
        projectId={project.id}
        paymentStatus={project.paymentStatus}
        totalAmount={project.price}
        depositAmount={project.depositAmount || 0}
        timeline={project.timeline}
        startDate={project.startDate}
      />

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Status</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'completed' ? 'bg-green-100 text-green-800' :
            project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Payment Status</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            project.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
            project.paymentStatus === 'partially-paid' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {project.paymentStatus}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Budget</h3>
          <p className="text-2xl font-bold text-gray-900">
            ₱{project.price?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Timeline</h3>
          <p className="text-2xl font-bold text-gray-900">
            {project.timeline || 0} days
          </p>
        </div>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker
        tasks={tasks}
        timeline={project.timeline}
        startDate={project.startDate}
        endDate={project.endDate}
        projectStatus={project.status}
      />

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Start Date</p>
                <p className="text-sm font-medium text-gray-900">{startDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">End Date</p>
                <p className="text-sm font-medium text-gray-900">{endDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Client Information</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600">Name</p>
              <p className="text-sm font-medium text-gray-900">{project.clientName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Email</p>
              <p className="text-sm font-medium text-gray-900">{project.clientEmail}</p>
            </div>
            {project.clientPhone && (
              <div>
                <p className="text-xs text-gray-600">Phone</p>
                <p className="text-sm font-medium text-gray-900">{project.clientPhone}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Financial</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600">Total Budget</p>
              <p className="text-lg font-bold text-gray-900">
                ₱{project.price?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Deposit Paid</p>
              <p className="text-sm font-medium text-gray-900">
                ₱{project.depositAmount?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Balance</p>
              <p className="text-sm font-medium text-gray-900">
                ₱{((project.price || 0) - (project.depositAmount || 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PRD Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Project Requirements Document
        </h2>
        <div className="prose prose-slate max-w-none">
          {project.prd ? (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {project.prd}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium">Generating PRD with AI...</p>
                <p className="text-sm mt-2">This may take 30-60 seconds</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Section - Interactive */}
      <TaskList initialTasks={tasks} projectId={project.id} />

      {/* Files Section */}
      <FilesSection projectId={project.id} />

      {/* Messaging Center */}
      <MessagingCenter projectId={project.id} clientName={project.clientName} />
    </div>
  );
}

export const runtime = 'edge';
