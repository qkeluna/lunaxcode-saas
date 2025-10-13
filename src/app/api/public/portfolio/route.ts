import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/client';
import { portfolio } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackPortfolio } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      console.log('Using fallback portfolio data for development');
      return NextResponse.json(fallbackPortfolio);
    }

    const items = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.isActive, true))
      .orderBy(portfolio.order);

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
