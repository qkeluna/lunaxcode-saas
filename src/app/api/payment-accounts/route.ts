import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { paymentAccounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// GET all active payment accounts (public - for payment page)
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    const accounts = await db
      .select()
      .from(paymentAccounts)
      .where(eq(paymentAccounts.isActive, true))
      .orderBy(paymentAccounts.order)
      .all();

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching payment accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment accounts' },
      { status: 500 }
    );
  }
}

