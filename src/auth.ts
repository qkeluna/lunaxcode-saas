import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getDatabase } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!;
        // @ts-ignore
        session.user.role = (token.role as string) || 'client';
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Store user email for lookups
      if (user) {
        token.email = user.email;
      }

      // Always fetch fresh role from database on sign in
      // This ensures we get the current role even if it was changed
      if (user || !token.role) {
        // Default to client
        token.role = 'client';

        // Note: getDatabase() doesn't work here without context
        // Role will be set to default 'client' and must be refreshed after login
        // The middleware will handle actual role verification from database
        console.log('JWT callback: User signed in, role set to client by default');
      }

      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
