import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { projects, users } from '@/lib/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const paymentStatus = searchParams.get('paymentStatus');

    // Build query
    let query = db.select({
      project: projects,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      }
    })
    .from(projects)
    .leftJoin(users, eq(projects.userId, users.id))
    .orderBy(desc(projects.createdAt));

    let allProjects = await query;

    // Apply filters
    if (status) {
      allProjects = allProjects.filter((p) => p.project.status === status);
    }

    if (paymentStatus) {
      allProjects = allProjects.filter((p) => p.project.paymentStatus === paymentStatus);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      allProjects = allProjects.filter((p) =>
        p.project.name.toLowerCase().includes(searchLower) ||
        p.project.clientName.toLowerCase().includes(searchLower) ||
        p.project.clientEmail.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ projects: allProjects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
