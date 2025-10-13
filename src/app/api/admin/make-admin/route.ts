import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export const runtime = 'edge';

// This endpoint creates or updates a user to admin role
// SECURITY: Only allow this in development or with proper authentication
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    const { env } = getRequestContext();
    const db = drizzle(env.DB);

    const email = session.user.email;
    const name = session.user.name || 'Admin User';
    const image = session.user.image || null;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existingUser) {
      // Update existing user to admin
      await db
        .update(users)
        .set({
          role: 'admin',
          updatedAt: new Date(),
        })
        .where(eq(users.email, email))
        .execute();

      return NextResponse.json({
        message: 'User updated to admin successfully',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: 'admin',
        },
      });
    } else {
      // Create new user with admin role
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      await db
        .insert(users)
        .values({
          id: userId,
          name,
          email,
          role: 'admin',
          emailVerified: new Date(),
          image,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      return NextResponse.json({
        message: 'User created as admin successfully',
        user: {
          id: userId,
          email,
          name,
          role: 'admin',
        },
      });
    }
  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json(
      {
        error: 'Failed to make user admin',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check current user status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    const { env } = getRequestContext();
    const db = drizzle(env.DB);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .get();

    if (!user) {
      return NextResponse.json({
        exists: false,
        email: session.user.email,
        message: 'User not found in database',
      });
    }

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      {
        error: 'Failed to check user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
