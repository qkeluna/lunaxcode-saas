import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/client';
import { serviceTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackServices } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      console.log('Using fallback services data for development');
      return NextResponse.json(fallbackServices);
    }

    const services = await db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.isActive, true));

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
