import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Get Cloudflare context
    const context = getRequestContext();

    if (!context?.env?.DB) {
      return NextResponse.json({
        sessionEmail: session.user.email,
        sessionRole: (session.user as any).role,
        dbRole: null,
        error: 'Database not connected - Cloudflare context not available',
        contextAvailable: !!context,
        dbBinding: !!context?.env?.DB,
      });
    }

    const db = drizzle(context.env.DB);

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
        ? `✅ User found in database with role: ${user.role}`
        : '❌ User NOT found in database - this is the problem!',
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
