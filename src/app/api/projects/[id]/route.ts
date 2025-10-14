import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { getProjectWithTasks } from '@/lib/db/queries';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Try to get D1 database
  const db = getDatabase((request as any).env);

  try {
    const { id } = await params;
    const projectId = parseInt(id);

    if (!db) {
      return NextResponse.json({
        error: 'Database not connected',
        message: 'Please set up D1 database to view project details',
        setupRequired: true,
      }, { status: 503 });
    }

    // Get user ID from database using email (session.user.id is OAuth provider ID, not DB ID)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        message: 'Please try logging in again',
      }, { status: 404 });
    }

    const project = await getProjectWithTasks(db, projectId, user.id);

    if (!project) {
      return NextResponse.json({
        error: 'Project not found',
        message: 'This project does not exist or you do not have access to it',
      }, { status: 404 });
    }

    return NextResponse.json({
      project,
      usingDatabase: true,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
