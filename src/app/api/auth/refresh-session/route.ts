import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * GET /api/auth/refresh-session
 * Check if user's role in database matches their session
 * If not, instruct them to log out and log back in
 */
export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get Cloudflare context
    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const db = drizzle(context.env.DB);

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { 
          message: 'User not in database yet',
          sessionRole: session.user.role || 'client',
          dbRole: null,
          needsLogout: false
        },
        { status: 200 }
      );
    }

    const sessionRole = session.user.role || 'client';
    const dbRole = user.role || 'client';

    // Check if roles match
    if (sessionRole !== dbRole) {
      return NextResponse.json(
        { 
          message: 'Role mismatch - please log out and log back in',
          sessionRole,
          dbRole,
          needsLogout: true,
          email: session.user.email
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Session is up to date',
        sessionRole,
        dbRole,
        needsLogout: false,
        email: session.user.email
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}

