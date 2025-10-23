import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { MessageThread } from '@/components/MessageThread';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminProjectMessagesPageProps {
  params: {
    id: string;
  };
}

export default async function AdminProjectMessagesPage({ params }: AdminProjectMessagesPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Admin check (this layout already handles it, but double-check)
  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const db = getDatabase();
  if (!db) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Database not available</p>
      </div>
    );
  }

  // Fetch project
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, parseInt(params.id)))
    .limit(1);

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/projects/${params.id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>
        </div>
        <div className="mt-3">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-muted-foreground">
              Client: {project.clientName} ({project.clientEmail})
            </p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Admin View
            </span>
          </div>
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-hidden bg-card rounded-b-lg">
        <MessageThread
          projectId={parseInt(params.id)}
          currentUserRole="admin"
          className="h-full"
        />
      </div>
    </div>
  );
}

export const runtime = 'edge';
