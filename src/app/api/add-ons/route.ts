import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { addOns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * GET /api/add-ons
 * Fetch all active add-ons, optionally filtered by service type
 */
export async function GET(request: NextRequest) {
  try {
    const context = getCloudflareContext();

    if (!context) {
      return NextResponse.json(
        { error: 'Database context not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    const db = drizzle(context.env.DB);

    // Fetch all active add-ons
    // If serviceId is provided, filter by service-specific + global (null) add-ons
    let query = db
      .select()
      .from(addOns)
      .where(eq(addOns.isActive, true))
      .orderBy(addOns.category, addOns.sortOrder);

    const allAddOns = await query;

    // Group by category
    const groupedAddOns = allAddOns.reduce((groups, addon) => {
      const category = addon.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(addon);
      return groups;
    }, {} as Record<string, typeof allAddOns>);

    return NextResponse.json({
      addOns: allAddOns,
      grouped: groupedAddOns,
      categories: Object.keys(groupedAddOns),
    });
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch add-ons' },
      { status: 500 }
    );
  }
}
