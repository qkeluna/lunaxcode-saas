import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { users, projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const debug: any = {
    step: 'start',
    timestamp: new Date().toISOString()
  };

  try {
    // Step 1: Check auth
    debug.step = 'auth';
    const session = await auth();
    debug.hasSession = !!session;
    debug.hasUser = !!session?.user;
    debug.hasEmail = !!session?.user?.email;
    debug.sessionUserId = session?.user?.id;
    debug.sessionUserEmail = session?.user?.email;

    if (!session?.user?.email) {
      debug.error = 'No session or email';
      return NextResponse.json(debug, { status: 401 });
    }

    // Step 2: Get database
    debug.step = 'database';
    const db = getDatabase();
    debug.hasDb = !!db;

    if (!db) {
      debug.error = 'Database not available';
      return NextResponse.json(debug, { status: 503 });
    }

    // Step 3: Get params
    debug.step = 'params';
    const { id } = await params;
    debug.projectId = id;
    debug.projectIdInt = parseInt(id);

    // Step 4: Look up user by email
    debug.step = 'user-lookup';
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    debug.userFound = !!user;
    debug.userId = user?.id;
    debug.userName = user?.name;

    if (!user) {
      debug.error = 'User not found in database';
      return NextResponse.json(debug, { status: 404 });
    }

    // Step 5: Look up project
    debug.step = 'project-lookup';
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, parseInt(id)),
          eq(projects.userId, user.id)
        )
      )
      .limit(1);

    debug.projectFound = !!project;
    debug.projectUserId = project?.userId;
    debug.projectName = project?.name;
    debug.projectPrd = project?.prd?.substring(0, 50) + '...';
    debug.projectPrdLength = project?.prd?.length;

    if (!project) {
      debug.error = 'Project not found or access denied';
      debug.userIdMatch = false;
      return NextResponse.json(debug, { status: 404 });
    }

    debug.step = 'success';
    debug.userIdMatch = project.userId === user.id;

    return NextResponse.json(debug);

  } catch (error: any) {
    debug.step = 'exception';
    debug.error = error.message;
    debug.errorStack = error.stack;
    return NextResponse.json(debug, { status: 500 });
  }
}
