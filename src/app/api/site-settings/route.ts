/**
 * Public Site Settings API
 *
 * Public endpoint to fetch site settings for the landing page.
 * Only returns public-safe settings (no sensitive data).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { siteSettings } from '@/lib/db/schema';

export const runtime = 'edge';

// Public settings that can be exposed (whitelist)
const PUBLIC_SETTINGS = ['whatsapp_enabled', 'whatsapp_number'];

// Default values for public settings
const DEFAULT_SETTINGS: Record<string, string> = {
    whatsapp_enabled: 'true',
    whatsapp_number: '639190852974',
};

// GET: Get public site settings
export async function GET(request: NextRequest) {
    try {
        const { env } = await getCloudflareContext();
        const db = getDb(env.DB);

        // Get all site settings
        const settings = await db.select().from(siteSettings);

        // Filter to only public settings and use defaults
        const publicSettings: Record<string, string> = { ...DEFAULT_SETTINGS };
        settings.forEach((s) => {
            if (PUBLIC_SETTINGS.includes(s.key)) {
                publicSettings[s.key] = s.value;
            }
        });

        return NextResponse.json({
            settings: publicSettings,
        });
    } catch (error: any) {
        console.error('Error fetching site settings:', error);
        // Return defaults on error to ensure landing page still works
        return NextResponse.json({
            settings: DEFAULT_SETTINGS,
        });
    }
}
