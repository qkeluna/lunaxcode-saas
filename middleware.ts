import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === 'admin';
    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/signup');
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin');

    // Redirect authenticated users away from auth pages
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Protect admin routes
    if (isAdminPage && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
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
