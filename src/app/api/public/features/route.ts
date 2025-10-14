import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { features } from '@/lib/db/schema';
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
    const featuresList = await db
      .select()
      .from(features)
      .where(eq(features.isActive, true))
      .orderBy(features.order);

    return NextResponse.json(featuresList);
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}
