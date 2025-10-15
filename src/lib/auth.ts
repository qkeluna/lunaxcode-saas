import GoogleProvider from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDb } from '@/lib/db';
import type { NextAuthConfig } from 'next-auth';

// This will be properly initialized in the API route with Cloudflare context
export function getAuthOptions(db: any): NextAuthConfig {
  return {
    adapter: DrizzleAdapter(db) as any,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    callbacks: {
      async session({ session, user, token }: any) {
        if (session.user) {
          // Use token for JWT strategy, user for database strategy
          session.user.id = token?.id as string || user?.id;
          session.user.role = (token?.role as string) || (user as any)?.role || 'client';
        }
        return session;
      },
      async jwt({ token, user }: any) {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role || 'client';
        }
        return token;
      },
      async signIn({ user }: any) {
        // Allow sign in - redirect will be handled by middleware
        return true;
      },
    },
    pages: {
      signIn: '/login',
      signOut: '/login',
      error: '/login',
    },
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
  } as NextAuthConfig;
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }

  interface User {
    role?: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: string;
  }
}
