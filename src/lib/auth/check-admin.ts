import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Check if the current user is an admin by fetching their role from the database.
 * This ensures we always check the latest role, not the cached JWT token.
 */
export async function checkIsAdmin(request: NextRequest): Promise<{
  isAdmin: boolean;
  session: Awaited<ReturnType<typeof auth>> | null;
  error?: string;
}> {
  const session = await auth();

  if (!session?.user?.email) {
    return { isAdmin: false, session: null, error: 'Unauthorized' };
  }

  try {
    // Import dynamically to avoid edge runtime issues
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const { drizzle } = await import('drizzle-orm/d1');

    // Get Cloudflare context
    const context = getRequestContext();

    if (!context?.env?.DB) {
      console.error('Cloudflare context or DB binding not available');
      return { isAdmin: false, session, error: 'Database not connected' };
    }

    const db = drizzle(context.env.DB);

    // Fetch user role from database
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      console.error('User not found in database:', session.user.email);
      return { isAdmin: false, session, error: 'User not found' };
    }

    console.log('User role check:', { email: session.user.email, role: user.role });
    return { isAdmin: user.role === 'admin', session };
  } catch (error: any) {
    console.error('Error checking admin role:', error);
    return { isAdmin: false, session, error: 'Failed to verify admin role' };
  }
}
