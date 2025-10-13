import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/client';
import { platformFeatures } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackFeatures } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      console.log('Using fallback features data for development');
      return NextResponse.json(fallbackFeatures);
    }

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
