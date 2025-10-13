import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { features } from '@/lib/db/schema';
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
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const allFeatures = await db
      .select()
      .from(features)
      .orderBy(desc(features.createdAt));

    return NextResponse.json({ features: allFeatures });
  } catch (error: any) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch features' },
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
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { title, description, icon, category, order, isActive } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const [newFeature] = await db
      .insert(features)
      .values({
        title,
        description,
        icon: icon || null,
        category: category || null,
        order: order !== undefined ? order : 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ feature: newFeature }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating feature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create feature' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
