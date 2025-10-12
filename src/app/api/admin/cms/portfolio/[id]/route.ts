import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { portfolio } from '@/lib/db/schema';
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

    const portfolioId = parseInt(params.id);
    const body = await request.json();

    const { title, description, client, category, imageUrl, liveUrl, technologies, results, testimonial, order, isActive } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (client !== undefined) updateData.client = client;
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
    if (technologies !== undefined) updateData.technologies = JSON.stringify(technologies);
    if (results !== undefined) updateData.results = JSON.stringify(results);
    if (testimonial !== undefined) updateData.testimonial = testimonial;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedPortfolio] = await db
      .update(portfolio)
      .set(updateData)
      .where(eq(portfolio.id, portfolioId))
      .returning();

    if (!updatedPortfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ portfolio: updatedPortfolio });
  } catch (error: any) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update portfolio' },
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

    const portfolioId = parseInt(params.id);

    await db
      .delete(portfolio)
      .where(eq(portfolio.id, portfolioId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
