import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { serviceTypes } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // @ts-ignore
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const allServices = await db
      .select()
      .from(serviceTypes)
      .orderBy(desc(serviceTypes.createdAt));

    return NextResponse.json({ services: allServices });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // @ts-ignore
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, description, basePrice, features, isActive } = body;

    if (!name || basePrice === undefined) {
      return NextResponse.json(
        { error: 'Name and base price are required' },
        { status: 400 }
      );
    }

    const [newService] = await db
      .insert(serviceTypes)
      .values({
        name,
        description: description || null,
        basePrice,
        features: features ? JSON.stringify(features) : null,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
