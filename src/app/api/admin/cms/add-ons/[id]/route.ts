import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { addOns } from '@/lib/db/schema';
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

    const addOnId = parseInt(params.id);
    const body = await request.json();

    const { serviceTypeId, name, description, category, price, isFree, isActive, sortOrder } = body;

    const updateData: any = {};

    if (serviceTypeId !== undefined) updateData.serviceTypeId = serviceTypeId;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (isFree !== undefined) updateData.isFree = isFree;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const [updatedAddOn] = await db
      .update(addOns)
      .set(updateData)
      .where(eq(addOns.id, addOnId))
      .returning();

    if (!updatedAddOn) {
      return NextResponse.json(
        { error: 'Add-on not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ addOn: updatedAddOn });
  } catch (error: any) {
    console.error('Error updating add-on:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update add-on' },
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

    const addOnId = parseInt(params.id);

    await db
      .delete(addOns)
      .where(eq(addOns.id, addOnId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting add-on:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete add-on' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
