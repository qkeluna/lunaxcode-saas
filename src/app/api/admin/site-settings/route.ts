/**
 * Admin Site Settings API
 *
 * Allows administrators to:
 * - View site settings (WhatsApp widget, phone number, etc.)
 * - Update site settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { siteSettings, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// Default site settings
const DEFAULT_SETTINGS = {
    whatsapp_enabled: 'true',
    whatsapp_number: '639190852974',
};

// GET: Get all site settings (admin only)
export async function GET(request: NextRequest) {
    try {
        // Verify admin access
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { env } = await getCloudflareContext();
        const db = getDb(env.DB);

        // Check if user is admin
        const userResult = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (userResult.length === 0 || userResult[0].role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get all site settings
        const settings = await db.select().from(siteSettings);

        // Convert to object format
        const settingsObj: Record<string, string> = { ...DEFAULT_SETTINGS };
        settings.forEach((s) => {
            settingsObj[s.key] = s.value;
        });

        return NextResponse.json({
            settings: settingsObj,
        });
    } catch (error: any) {
        console.error('Error fetching site settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch site settings' },
            { status: 500 }
        );
    }
}

// PUT: Update site settings
export async function PUT(request: NextRequest) {
    try {
        // Verify admin access
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { env } = await getCloudflareContext();
        const db = getDb(env.DB);

        // Check if user is admin
        const userResult = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (userResult.length === 0 || userResult[0].role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json() as { key: string; value: string };
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json(
                { error: 'Key and value are required' },
                { status: 400 }
            );
        }

        const now = new Date();

        // Upsert the setting
        const existing = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, key))
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(siteSettings)
                .set({ value, updatedAt: now })
                .where(eq(siteSettings.key, key));
        } else {
            await db.insert(siteSettings).values({
                key,
                value,
                updatedAt: now,
            });
        }

        return NextResponse.json({
            success: true,
            message: `Setting "${key}" updated`,
            setting: { key, value },
        });
    } catch (error: any) {
        console.error('Error updating site settings:', error);
        return NextResponse.json(
            { error: 'Failed to update site settings' },
            { status: 500 }
        );
    }
}

// PATCH: Bulk update site settings
export async function PATCH(request: NextRequest) {
    try {
        // Verify admin access
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { env } = await getCloudflareContext();
        const db = getDb(env.DB);

        // Check if user is admin
        const userResult = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (userResult.length === 0 || userResult[0].role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json() as { settings: Record<string, string> };
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json(
                { error: 'Settings object is required' },
                { status: 400 }
            );
        }

        const now = new Date();

        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
            const existing = await db
                .select()
                .from(siteSettings)
                .where(eq(siteSettings.key, key))
                .limit(1);

            if (existing.length > 0) {
                await db
                    .update(siteSettings)
                    .set({ value: String(value), updatedAt: now })
                    .where(eq(siteSettings.key, key));
            } else {
                await db.insert(siteSettings).values({
                    key,
                    value: String(value),
                    updatedAt: now,
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Settings updated',
        });
    } catch (error: any) {
        console.error('Error updating site settings:', error);
        return NextResponse.json(
            { error: 'Failed to update site settings' },
            { status: 500 }
        );
    }
}
