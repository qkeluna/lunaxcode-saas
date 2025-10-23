import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { unreadCounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/messages/unread/count
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDatabase();
    const userId = session.user.id || session.user.email!;

    if (!db) {
      // Database not available, return 0
      return NextResponse.json({ count: 0, usingDatabase: false });
    }

    // Get unread count from cache table (single-row lookup, very fast)
    const [countRecord] = await db
      .select()
      .from(unreadCounts)
      .where(eq(unreadCounts.userId, userId))
      .limit(1);

    return NextResponse.json({
      count: countRecord?.totalCount || 0,
      lastUpdated: countRecord?.lastUpdated || null,
      usingDatabase: true
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
