import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * PATCH /api/tasks/[id]
 * Update task status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get Cloudflare context and database
  const context = getCloudflareContext();
  if (!context?.env?.DB) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    );
  }

  try {
    const db = drizzle(context.env.DB);
    const body = await request.json() as { status?: string; order?: number };
    const { id } = await params;
    const taskId = parseInt(id);

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['pending', 'to-do', 'in-progress', 'testing', 'done'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.order !== undefined) {
      updateData.order = body.order;
    }

    // Update task
    await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId));

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
