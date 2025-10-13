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
    async jwt({ token, user, trigger }) {
      // On sign in, fetch the user's actual role from database
      if (user) {
        try {
          // Try to get database instance
          const db = getDatabase();

          if (db) {
            // Fetch user from database
            const [dbUser] = await db
              .select()
              .from(users)
              .where(eq(users.email, user.email!))
              .limit(1);

            if (dbUser) {
              token.role = dbUser.role;
            } else {
              token.role = 'client'; // Default for new users
            }
          } else {
            // Fallback if database not available
            token.role = 'client';
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          token.role = 'client';
        }
      }

      // On update, refresh role from database
      if (trigger === 'update') {
        try {
          const db = getDatabase();
          if (db && token.email) {
            const [dbUser] = await db
              .select()
              .from(users)
              .where(eq(users.email, token.email as string))
              .limit(1);

            if (dbUser) {
              token.role = dbUser.role;
            }
          }
        } catch (error) {
          console.error('Error updating user role:', error);
        }
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
