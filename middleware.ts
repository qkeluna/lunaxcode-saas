import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/signup');
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin');

    // Redirect authenticated users away from auth pages
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check admin access by fetching role from database
    if (isAdminPage && token?.email) {
      try {
        // Try to get DB binding from multiple sources
        let db = null;
        let dbSource = 'none';

        // Try method 1: getRequestContext()
        try {
          const context = getRequestContext();
          if (context?.env?.DB) {
            const { drizzle } = await import('drizzle-orm/d1');
            db = drizzle(context.env.DB);
            dbSource = 'getRequestContext';
          }
        } catch (e) {
          console.log('[Middleware] getRequestContext failed:', e);
        }

        // Try method 2: request.env (Cloudflare Workers style)
        if (!db && (req as any).env?.DB) {
          const { drizzle } = await import('drizzle-orm/d1');
          db = drizzle((req as any).env.DB);
          dbSource = 'request.env';
        }

        console.log('[Middleware] DB source:', dbSource, 'DB available:', !!db);

        if (db) {
          // Fetch user role from database
          const { users } = await import('@/lib/db/schema');
          const { eq } = await import('drizzle-orm');

          const [user] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.email, token.email as string))
            .limit(1);

          console.log('[Middleware] User from DB:', user?.role, 'for email:', token.email);
          const isAdmin = user?.role === 'admin';

          if (!isAdmin) {
            console.log('[Middleware] User is not admin, redirecting to /dashboard');
            return NextResponse.redirect(new URL('/dashboard', req.url));
          }
          console.log('[Middleware] User IS admin, allowing access to /admin');
        } else {
          console.log('[Middleware] No DB available, falling back to token role:', token?.role);
          // Fallback to token role if DB not available
          const isAdmin = token?.role === 'admin';
          if (!isAdmin) {
            console.log('[Middleware] Token role is not admin, redirecting to /dashboard');
            return NextResponse.redirect(new URL('/dashboard', req.url));
          }
          console.log('[Middleware] Token role is admin, allowing access');
        }
      } catch (error) {
        console.error('[Middleware] Error checking admin role:', error);
        // Fallback to token role
        const isAdmin = token?.role === 'admin';
        if (!isAdmin) {
          console.log('[Middleware] Error occurred, user token role is not admin, redirecting');
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        console.log('[Middleware] Error occurred but token role is admin, allowing access');
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/projects/:path*',
    '/login',
    '/signup',
  ],
};
