import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { faqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const faqId = parseInt(params.id);
    const body = await request.json();

    const { question, answer, category, order, isActive } = body;

    const updateData: any = {};

    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (category !== undefined) updateData.category = category;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedFaq] = await db
      .update(faqs)
      .set(updateData)
      .where(eq(faqs.id, faqId))
      .returning();

    if (!updatedFaq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ faq: updatedFaq });
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const faqId = parseInt(params.id);

    await db
      .delete(faqs)
      .where(eq(faqs.id, faqId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
