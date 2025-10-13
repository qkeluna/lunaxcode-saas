import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
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
    const db = getDatabase((request as any).env);

    if (!db) {
      return { isAdmin: false, session, error: 'Database not connected' };
    }

    // Fetch user role from database
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return { isAdmin: false, session, error: 'User not found' };
    }

    return { isAdmin: user.role === 'admin', session };
  } catch (error: any) {
    console.error('Error checking admin role:', error);
    return { isAdmin: false, session, error: 'Failed to verify admin role' };
  }
}
