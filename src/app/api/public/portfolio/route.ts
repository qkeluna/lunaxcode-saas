import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { portfolio } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackPortfolio } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback portfolio data for development');
      return NextResponse.json(fallbackPortfolio);
    }

    const db = drizzle(context.env.DB);
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
