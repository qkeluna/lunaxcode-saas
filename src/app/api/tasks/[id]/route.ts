import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { updateTaskStatus } from '@/lib/db/queries';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Try to get D1 database
  const db = getDatabase();

  if (!db) {
    return NextResponse.json(
      {
        error: 'Database not connected',
        message: 'Please set up D1 database to update tasks',
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { status } = body;
    const { id } = await params;
    const taskId = parseInt(id);

    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, in-progress, or completed' },
        { status: 400 }
      );
    }

    const updatedTask = await updateTaskStatus(db, taskId, status);

    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
