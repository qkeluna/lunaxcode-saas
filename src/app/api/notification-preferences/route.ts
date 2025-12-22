import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { notificationPreferences, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'edge';

// Validation schema for updating preferences
const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  projectUpdates: z.boolean().optional(),
  paymentReminders: z.boolean().optional(),
  taskUpdates: z.boolean().optional(),
  messageNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

// GET - Fetch current user's notification preferences
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { env } = await getCloudflareContext();
    const db = drizzle(env.DB);

    // Get user from database
    const user = await db.select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .get();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get preferences or return defaults
    let preferences = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, user.id))
      .get();

    // If no preferences exist, create defaults
    if (!preferences) {
      const defaultPreferences = {
        userId: user.id,
        emailNotifications: true,
        projectUpdates: true,
        paymentReminders: true,
        taskUpdates: true,
        messageNotifications: true,
        marketingEmails: false,
      };

      await db.insert(notificationPreferences).values(defaultPreferences);

      preferences = {
        id: 0, // Will be auto-assigned
        ...defaultPreferences,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      preferences: {
        emailNotifications: preferences.emailNotifications,
        projectUpdates: preferences.projectUpdates,
        paymentReminders: preferences.paymentReminders,
        taskUpdates: preferences.taskUpdates,
        messageNotifications: preferences.messageNotifications,
        marketingEmails: preferences.marketingEmails,
      },
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT - Update user's notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updatePreferencesSchema.parse(body);

    const { env } = await getCloudflareContext();
    const db = drizzle(env.DB);

    // Get user from database
    const user = await db.select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .get();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if preferences exist
    const existingPreferences = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, user.id))
      .get();

    if (existingPreferences) {
      // Update existing preferences
      await db.update(notificationPreferences)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, user.id));
    } else {
      // Create new preferences
      await db.insert(notificationPreferences).values({
        userId: user.id,
        emailNotifications: validatedData.emailNotifications ?? true,
        projectUpdates: validatedData.projectUpdates ?? true,
        paymentReminders: validatedData.paymentReminders ?? true,
        taskUpdates: validatedData.taskUpdates ?? true,
        messageNotifications: validatedData.messageNotifications ?? true,
        marketingEmails: validatedData.marketingEmails ?? false,
      });
    }

    // Fetch updated preferences
    const updatedPreferences = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, user.id))
      .get();

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated',
      preferences: {
        emailNotifications: updatedPreferences?.emailNotifications,
        projectUpdates: updatedPreferences?.projectUpdates,
        paymentReminders: updatedPreferences?.paymentReminders,
        taskUpdates: updatedPreferences?.taskUpdates,
        messageNotifications: updatedPreferences?.messageNotifications,
        marketingEmails: updatedPreferences?.marketingEmails,
      },
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
