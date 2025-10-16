import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { tasks } from '@/lib/db/schema';
import { checkIsAdmin } from '@/lib/auth/check-admin';

export const runtime = 'edge';

/**
 * POST /api/admin/projects/[id]/tasks
 * Create a new task manually
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const { isAdmin, error } = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get Cloudflare context and database
    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const db = drizzle(context.env.DB);
    const { id } = await params;
    const projectId = parseInt(id);

    // Get request body
    const body = await request.json() as {
      title: string;
      description: string;
      section: string;
      priority: string;
      status: string;
      estimatedHours: number;
      dependencies: string;
      order: number;
    };

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    // Insert new task
    await db.insert(tasks).values({
      projectId: projectId,
      title: body.title,
      description: body.description || '',
      section: body.section || 'Custom',
      priority: body.priority || 'medium',
      status: body.status || 'pending',
      estimatedHours: body.estimatedHours || 0,
      dependencies: body.dependencies || '',
      order: body.order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

