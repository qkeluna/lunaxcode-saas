/**
 * Admin AI Usage Statistics API
 *
 * Allows administrators to view:
 * - Per-user AI generation usage
 * - Total usage statistics
 * - Recent generation logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { aiUsageLog, users, aiSettings } from '@/lib/db/schema';
import { eq, sql, desc, count } from 'drizzle-orm';

export const runtime = 'edge';

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

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'summary';

    // Get active AI settings for limit info
    const settings = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.isActive, true))
      .limit(1);

    const maxGenerationsPerUser = settings[0]?.maxGenerationsPerUser ?? 3;

    if (view === 'summary') {
      // Get summary statistics
      const [totalGenerations, successfulGenerations, usersWithGenerations] =
        await Promise.all([
          db
            .select({ count: count() })
            .from(aiUsageLog)
            .then((r) => r[0]?.count ?? 0),
          db
            .select({ count: count() })
            .from(aiUsageLog)
            .where(eq(aiUsageLog.status, 'success'))
            .then((r) => r[0]?.count ?? 0),
          db
            .select({ count: sql`COUNT(DISTINCT ${aiUsageLog.userId})` })
            .from(aiUsageLog)
            .then((r: any) => r[0]?.count ?? 0),
        ]);

      // Get usage by generation type
      const usageByType = await db
        .select({
          type: aiUsageLog.generationType,
          count: count(),
        })
        .from(aiUsageLog)
        .where(eq(aiUsageLog.status, 'success'))
        .groupBy(aiUsageLog.generationType);

      // Get recent logs
      const recentLogs = await db
        .select({
          id: aiUsageLog.id,
          userId: aiUsageLog.userId,
          generationType: aiUsageLog.generationType,
          provider: aiUsageLog.provider,
          model: aiUsageLog.model,
          status: aiUsageLog.status,
          createdAt: aiUsageLog.createdAt,
        })
        .from(aiUsageLog)
        .orderBy(desc(aiUsageLog.createdAt))
        .limit(20);

      return NextResponse.json({
        summary: {
          totalGenerations,
          successfulGenerations,
          failedGenerations: totalGenerations - successfulGenerations,
          uniqueUsers: usersWithGenerations,
          maxGenerationsPerUser,
        },
        usageByType,
        recentLogs,
      });
    }

    if (view === 'users') {
      // Get per-user usage statistics
      const userUsage = await db
        .select({
          userId: aiUsageLog.userId,
          totalGenerations: count(),
        })
        .from(aiUsageLog)
        .where(eq(aiUsageLog.status, 'success'))
        .groupBy(aiUsageLog.userId);

      // Get user details
      const userDetails = await Promise.all(
        userUsage.map(async (u) => {
          const user = await db
            .select({ name: users.name, email: users.email, role: users.role })
            .from(users)
            .where(eq(users.id, u.userId))
            .limit(1);

          return {
            userId: u.userId,
            name: user[0]?.name || 'Unknown',
            email: user[0]?.email || 'Unknown',
            role: user[0]?.role || 'client',
            totalGenerations: u.totalGenerations,
            remaining: user[0]?.role === 'admin'
              ? 'unlimited'
              : Math.max(0, maxGenerationsPerUser - u.totalGenerations),
            limit: user[0]?.role === 'admin' ? 'unlimited' : maxGenerationsPerUser,
          };
        })
      );

      return NextResponse.json({
        users: userDetails,
        maxGenerationsPerUser,
      });
    }

    if (view === 'logs') {
      // Get detailed logs with pagination
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        db
          .select()
          .from(aiUsageLog)
          .orderBy(desc(aiUsageLog.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(aiUsageLog)
          .then((r) => r[0]?.count ?? 0),
      ]);

      return NextResponse.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching AI usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI usage statistics' },
      { status: 500 }
    );
  }
}

// POST: Reset a user's generation count (admin only)
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { userId, action } = body;

    if (action === 'reset' && userId) {
      // Delete all usage logs for this user (effectively resetting their count)
      await db.delete(aiUsageLog).where(eq(aiUsageLog.userId, userId));

      return NextResponse.json({
        success: true,
        message: `Usage count reset for user ${userId}`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error resetting user usage:', error);
    return NextResponse.json(
      { error: 'Failed to reset user usage' },
      { status: 500 }
    );
  }
}
