import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/client';
import { processSteps } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackProcess } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      console.log('Using fallback process data for development');
      return NextResponse.json(fallbackProcess);
    }

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
