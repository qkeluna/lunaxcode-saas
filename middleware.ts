import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  try {
    // Get token from JWT
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/signup');
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
    const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');

    // Require authentication for protected routes
    const isProtectedRoute = 
      req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/admin') ||
      req.nextUrl.pathname.startsWith('/projects');

    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based redirect after login
    if (isAuthPage && token) {
      const userRole = (token.role as string) || 'client';
      
      // Redirect admins to /admin, clients to /dashboard
      if (userRole === 'admin') {
        const url = new URL('/admin', req.url);
        return NextResponse.redirect(url);
      } else {
        const url = new URL('/dashboard', req.url);
        return NextResponse.redirect(url);
      }
    }

    // Redirect clients trying to access admin pages to dashboard
    if (isAdminPage && token) {
      const userRole = (token.role as string) || 'client';
      if (userRole !== 'admin') {
        const url = new URL('/dashboard', req.url);
        return NextResponse.redirect(url);
      }
    }

    // Redirect admins accessing /dashboard root to /admin
    if (req.nextUrl.pathname === '/dashboard' && token) {
      const userRole = (token.role as string) || 'client';
      if (userRole === 'admin') {
        const url = new URL('/admin', req.url);
        return NextResponse.redirect(url);
      }
    }

    // NOTE: Admin role checking also happens at the page level for double security
    // This is because getRequestContext() doesn't work in middleware on Cloudflare Pages
    // Each admin page will verify the user's role from the database directly

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/projects/:path*',
    '/login',
    '/signup',
  ],
};
