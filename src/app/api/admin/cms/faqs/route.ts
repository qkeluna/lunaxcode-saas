import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { faqs } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

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

    const allFaqs = await db
      .select()
      .from(faqs)
      .orderBy(desc(faqs.order), desc(faqs.createdAt));

    return NextResponse.json({ faqs: allFaqs });
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch FAQs' },
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
    const { question, answer, category, order, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const [newFaq] = await db
      .insert(faqs)
      .values({
        question,
        answer,
        category: category || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ faq: newFaq }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
