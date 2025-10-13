import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json({
        sessionEmail: session.user.email,
        sessionRole: (session.user as any).role,
        dbRole: null,
        error: 'Database not connected',
      });
    }

    // Fetch user from database
    const [user] = await db
      .select({ role: users.role, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    return NextResponse.json({
      sessionEmail: session.user.email,
      sessionRole: (session.user as any).role,
      dbUser: user || null,
      dbRole: user?.role || null,
      isAdmin: user?.role === 'admin',
      message: user
        ? 'User found in database'
        : 'User NOT found in database - this is the problem!',
    });
  } catch (error: any) {
    return NextResponse.json({
      sessionEmail: session.user.email,
      sessionRole: (session.user as any).role,
      error: error.message,
      stack: error.stack,
    });
  }
}

export const runtime = 'edge';
