import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { platformFeatures } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackFeatures } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback features data for development');
      return NextResponse.json(fallbackFeatures);
    }

    const db = drizzle(context.env.DB);
    const features = await db
      .select()
      .from(platformFeatures)
      .where(eq(platformFeatures.isActive, true))
      .orderBy(platformFeatures.order);

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}
