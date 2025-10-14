import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { users, projects } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { isAdmin, error } = await checkIsAdmin(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: error || 'Forbidden' },
      { status: error === 'Unauthorized' ? 401 : 403 }
    );
  }

  try {
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    // Get all clients (users with role='client')
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, 'client'))
      .orderBy(desc(users.createdAt));

    // Get project counts for each client
    const clientsWithProjects = await Promise.all(
      allUsers.map(async (user) => {
        const userProjects = await db
          .select()
          .from(projects)
          .where(eq(projects.userId, user.id));

        const totalSpent = userProjects.reduce((sum, p) => sum + (p.depositAmount || 0), 0);
        const activeProjects = userProjects.filter(p => p.status === 'in-progress').length;
        const completedProjects = userProjects.filter(p => p.status === 'completed').length;

        return {
          ...user,
          stats: {
            totalProjects: userProjects.length,
            activeProjects,
            completedProjects,
            totalSpent,
          },
        };
      })
    );

    return NextResponse.json({ clients: clientsWithProjects });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
