import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { addOns, serviceTypes } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

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

    const allAddOns = await db
      .select({
        id: addOns.id,
        serviceTypeId: addOns.serviceTypeId,
        serviceName: serviceTypes.name,
        name: addOns.name,
        description: addOns.description,
        category: addOns.category,
        price: addOns.price,
        isFree: addOns.isFree,
        isActive: addOns.isActive,
        sortOrder: addOns.sortOrder,
        createdAt: addOns.createdAt,
      })
      .from(addOns)
      .leftJoin(serviceTypes, eq(addOns.serviceTypeId, serviceTypes.id))
      .orderBy(desc(addOns.createdAt));

    return NextResponse.json({ addOns: allAddOns });
  } catch (error: any) {
    console.error('Error fetching add-ons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch add-ons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { serviceTypeId, name, description, category, price, isFree, isActive, sortOrder } = body;

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    const [newAddOn] = await db
      .insert(addOns)
      .values({
        serviceTypeId: serviceTypeId || null,
        name,
        description,
        category,
        price: price !== undefined ? price : 0,
        isFree: isFree !== undefined ? isFree : false,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder !== undefined ? sortOrder : 0,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ addOn: newAddOn }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating add-on:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create add-on' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
