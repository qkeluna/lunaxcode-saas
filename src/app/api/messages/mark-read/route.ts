import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { messages, unreadCounts } from '@/lib/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';

// POST /api/messages/mark-read
// Body: { messageIds: number[] } or { projectId: number } (marks all messages in project as read)
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { messageIds, projectId } = body;

    if (!messageIds && !projectId) {
      return NextResponse.json(
        { error: 'Either messageIds or projectId is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const userId = session.user.id || session.user.email!;
    const isAdmin = session.user.role === 'admin';
    const userRole = isAdmin ? 'admin' : 'client';

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    let updatedCount = 0;

    // Mark specific messages or all messages in a project
    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      // Mark specific messages as read
      const result = await db
        .update(messages)
        .set({
          status: 'read',
          readAt: new Date()
        })
        .where(
          and(
            inArray(messages.id, messageIds),
            eq(messages.status, 'sent'),
            sql`${messages.senderRole} != ${userRole}` // Only mark messages from others
          )
        )
        .returning();

      updatedCount = result.length;
    } else if (projectId) {
      // Mark all unread messages in project as read
      const result = await db
        .update(messages)
        .set({
          status: 'read',
          readAt: new Date()
        })
        .where(
          and(
            eq(messages.projectId, parseInt(projectId)),
            eq(messages.status, 'sent'),
            sql`${messages.senderRole} != ${userRole}` // Only mark messages from others
          )
        )
        .returning();

      updatedCount = result.length;
    }

    // Update unread count cache
    if (updatedCount > 0) {
      const [currentCount] = await db
        .select()
        .from(unreadCounts)
        .where(eq(unreadCounts.userId, userId))
        .limit(1);

      const newCount = Math.max(0, (currentCount?.totalCount || 0) - updatedCount);

      if (currentCount) {
        await db
          .update(unreadCounts)
          .set({
            totalCount: newCount,
            lastUpdated: new Date()
          })
          .where(eq(unreadCounts.userId, userId));
      } else {
        await db.insert(unreadCounts).values({
          userId,
          totalCount: 0,
          lastUpdated: new Date()
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `${updatedCount} message(s) marked as read`
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
