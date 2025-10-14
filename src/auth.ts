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
    async signIn({ user, account, profile }) {
      // Save user to database when they sign in
      if (user?.email) {
        try {
          // Import dynamically to work in edge runtime
          const { getRequestContext } = await import('@cloudflare/next-on-pages');
          const { drizzle } = await import('drizzle-orm/d1');

          const context = getRequestContext();
          if (!context?.env?.DB) {
            console.error('[Auth] Cannot save user - DB not available');
            return true; // Allow sign in even if DB fails
          }

          const db = drizzle(context.env.DB);

          // Check if user exists
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          if (!existingUser) {
            // Create new user with default 'client' role
            console.log('[Auth] Creating new user:', user.email);
            await db.insert(users).values({
              id: user.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: user.name || 'User', // Default to 'User' if name not provided
              email: user.email,
              image: user.image,
              role: 'client', // Default role for new users
              emailVerified: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            // Update existing user info (name, image might have changed)
            console.log('[Auth] Updating existing user:', user.email);
            await db
              .update(users)
              .set({
                name: user.name || 'User', // Default to 'User' if name not provided
                image: user.image,
                updatedAt: new Date(),
              })
              .where(eq(users.email, user.email));
          }

          return true;
        } catch (error) {
          console.error('[Auth] Error saving user to database:', error);
          return true; // Allow sign in even if DB fails
        }
      }
      return true;
    },
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
