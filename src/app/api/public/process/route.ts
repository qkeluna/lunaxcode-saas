import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { processSteps } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackProcess } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback process data for development');
      return NextResponse.json(fallbackProcess);
    }

    const db = drizzle(context.env.DB);
    const steps = await db
      .select()
      .from(processSteps)
      .where(eq(processSteps.isActive, true))
      .orderBy(processSteps.order);

    return NextResponse.json(steps);
  } catch (error) {
    console.error('Error fetching process steps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch process steps' },
      { status: 500 }
    );
  }
}
