import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin, error } = await checkIsAdmin(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: error || 'Forbidden' },
      { status: error === 'Unauthorized' ? 401 : 403 }
    );
  }

  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const projectId = parseInt(params.id);
    const body = await request.json();

    const { status, paymentStatus, startDate, endDate, timeline, budget, price } = body;

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (timeline !== undefined) updateData.timeline = timeline;
    if (budget !== undefined) updateData.budget = budget;
    if (price !== undefined) updateData.price = price;

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project: updatedProject });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin, error } = await checkIsAdmin(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: error || 'Forbidden' },
      { status: error === 'Unauthorized' ? 401 : 403 }
    );
  }

  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const projectId = parseInt(params.id);

    await db
      .delete(projects)
      .where(eq(projects.id, projectId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
