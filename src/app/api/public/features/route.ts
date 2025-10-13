import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle } from 'drizzle-orm/d1';
import { platformFeatures } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    const db = drizzle(env.DB);

    const features = await db
      .select()
      .from(platformFeatures)
      .where(eq(platformFeatures.isActive, true))
      .orderBy(platformFeatures.order)
      .all();

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}
