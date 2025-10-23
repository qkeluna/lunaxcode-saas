import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { MessageThread } from '@/components/MessageThread';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProjectMessagesPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectMessagesPage({ params }: ProjectMessagesPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
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

  // Verify user owns this project (unless admin)
  const isAdmin = session.user.role === 'admin';
  const userId = session.user.id || session.user.email;
  const isOwner = project.userId === userId;

  if (!isAdmin && !isOwner) {
    redirect('/dashboard');
  }

  const currentUserRole = isAdmin ? 'admin' : 'client';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${params.id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>
        </div>
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Project Messages • {currentUserRole === 'admin' ? 'Admin View' : 'Client View'}
          </p>
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-hidden">
        <MessageThread
          projectId={parseInt(params.id)}
          currentUserRole={currentUserRole}
          className="h-full"
        />
      </div>
    </div>
  );
}

export const runtime = 'edge';
