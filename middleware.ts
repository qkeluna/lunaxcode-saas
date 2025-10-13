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
        // Get Cloudflare context
        const context = getRequestContext();

        if (context?.env?.DB) {
          // Import drizzle and schema dynamically to avoid edge runtime issues
          const { drizzle } = await import('drizzle-orm/d1');
          const { users } = await import('@/lib/db/schema');
          const { eq } = await import('drizzle-orm');

          const db = drizzle(context.env.DB);

          // Fetch user role from database
          const [user] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.email, token.email as string))
            .limit(1);

          const isAdmin = user?.role === 'admin';

          if (!isAdmin) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
          }
        } else {
          // Fallback to token role if DB not available (local dev)
          const isAdmin = token?.role === 'admin';
          if (!isAdmin) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
          }
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        // Fallback to token role
        const isAdmin = token?.role === 'admin';
        if (!isAdmin) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
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
