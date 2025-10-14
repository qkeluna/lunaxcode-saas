import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { processSteps } from '@/lib/db/schema';
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
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const stepId = parseInt(params.id);
    const body = await request.json();

    const { title, description, icon, order, isActive } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedStep] = await db
      .update(processSteps)
      .set(updateData)
      .where(eq(processSteps.id, stepId))
      .returning();

    if (!updatedStep) {
      return NextResponse.json(
        { error: 'Process step not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ step: updatedStep });
  } catch (error: any) {
    console.error('Error updating process step:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update process step' },
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
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const stepId = parseInt(params.id);

    await db
      .delete(processSteps)
      .where(eq(processSteps.id, stepId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting process step:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete process step' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
