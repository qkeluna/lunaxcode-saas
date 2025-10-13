import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { features } from '@/lib/db/schema';
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

    const featureId = parseInt(params.id);
    const body = await request.json();

    const { title, description, icon, category, order, isActive } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (category !== undefined) updateData.category = category;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedFeature] = await db
      .update(features)
      .set(updateData)
      .where(eq(features.id, featureId))
      .returning();

    if (!updatedFeature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ feature: updatedFeature });
  } catch (error: any) {
    console.error('Error updating feature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update feature' },
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

    const featureId = parseInt(params.id);

    await db
      .delete(features)
      .where(eq(features.id, featureId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting feature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete feature' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
