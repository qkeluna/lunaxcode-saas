import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { portfolio } from '@/lib/db/schema';
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

    const allPortfolio = await db
      .select()
      .from(portfolio)
      .orderBy(desc(portfolio.order), desc(portfolio.createdAt));

    return NextResponse.json({ portfolio: allPortfolio });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch portfolio' },
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
    const { title, description, client, category, imageUrl, liveUrl, technologies, results, testimonial, order, isActive } = body;

    if (!title || !description || !client || !category) {
      return NextResponse.json(
        { error: 'Title, description, client, and category are required' },
        { status: 400 }
      );
    }

    const [newPortfolio] = await db
      .insert(portfolio)
      .values({
        title,
        description,
        client,
        category,
        imageUrl: imageUrl || null,
        liveUrl: liveUrl || null,
        technologies: technologies ? JSON.stringify(technologies) : null,
        results: results ? JSON.stringify(results) : null,
        testimonial: testimonial || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ portfolio: newPortfolio }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
