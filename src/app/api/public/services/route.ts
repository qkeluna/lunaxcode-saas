import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { serviceTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackServices } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback services data for development');
      return NextResponse.json(fallbackServices);
    }

    const db = drizzle(context.env.DB);
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
