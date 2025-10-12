import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDb } from '@/lib/db';

// This will be properly initialized in the API route with Cloudflare context
export function getAuthOptions(db: any): NextAuthOptions {
  return {
    adapter: DrizzleAdapter(db) as any,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
          session.user.role = (user as any).role || 'client';
        }
        return session;
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role || 'client';
        }
        return token;
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
  };
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

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
  }
}
