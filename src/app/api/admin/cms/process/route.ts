import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { processSteps } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

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

    const allSteps = await db
      .select()
      .from(processSteps)
      .orderBy(desc(processSteps.order), desc(processSteps.createdAt));

    return NextResponse.json({ steps: allSteps });
  } catch (error: any) {
    console.error('Error fetching process steps:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch process steps' },
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
    const { title, description, icon, order, isActive } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const [newStep] = await db
      .insert(processSteps)
      .values({
        title,
        description,
        icon: icon || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ step: newStep }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating process step:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create process step' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
