import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle } from 'drizzle-orm/d1';
import { processSteps } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    const db = drizzle(env.DB);

    const steps = await db
      .select()
      .from(processSteps)
      .where(eq(processSteps.isActive, true))
      .orderBy(processSteps.order)
      .all();

    return NextResponse.json(steps);
  } catch (error) {
    console.error('Error fetching process steps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch process steps' },
      { status: 500 }
    );
  }
}
