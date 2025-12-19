import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { messages, unreadCounts, projects, users } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { notifyNewMessage } from '@/lib/email/notifications';

// In-memory fallback for when D1 is not available
let messagesStore: any[] = [];
let messageIdCounter = 1;

// Send a message
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, content } = body;

    if (!projectId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'projectId and content are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const userId = session.user.id || session.user.email!;

    // Determine sender role (admin or client)
    const [project] = db ? await db.select().from(projects).where(eq(projects.id, parseInt(projectId))).limit(1) : [];
    if (!project && db) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'admin';
    const senderRole = isAdmin ? 'admin' : 'client';

    const messageData = {
      projectId: parseInt(projectId),
      senderId: userId,
      senderRole,
      content: content.trim(),
      status: 'sent' as const,
      createdAt: new Date(),
    };

    let savedMessage: any;

    if (db) {
      // Save to D1 database
      const [dbMessage] = await db.insert(messages).values(messageData).returning();
      savedMessage = dbMessage;

      // Update unread count for recipient(s)
      if (isAdmin && project) {
        // Admin sent message, increment client's unread count
        const recipientId = project.userId;
        const [currentCount] = await db
          .select()
          .from(unreadCounts)
          .where(eq(unreadCounts.userId, recipientId))
          .limit(1);

        if (currentCount) {
          await db
            .update(unreadCounts)
            .set({
              totalCount: currentCount.totalCount + 1,
              lastUpdated: new Date()
            })
            .where(eq(unreadCounts.userId, recipientId));
        } else {
          await db.insert(unreadCounts).values({
            userId: recipientId,
            totalCount: 1,
            lastUpdated: new Date()
          });
        }
        // Send email notification to client
        if (project) {
          const [clientUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, project.userId))
            .limit(1);

          if (clientUser) {
            // Get unread count for this project
            const projectUnread = await db
              .select()
              .from(messages)
              .where(
                and(
                  eq(messages.projectId, parseInt(projectId)),
                  eq(messages.status, 'sent'),
                  eq(messages.senderRole, 'admin')
                )
              );

            notifyNewMessage(db, {
              userId: clientUser.id,
              recipientEmail: clientUser.email,
              recipientName: clientUser.name,
              senderName: session.user.name || 'Admin',
              projectTitle: project.name,
              projectId: projectId,
              messagePreview: content.trim(),
              unreadCount: projectUnread.length,
            }).catch(err => {
              console.error('Failed to send message notification:', err);
            });
          }
        }
      } else {
        // Client sent message, increment all admins' unread counts
        const adminUsers = await db
          .select({ id: users.id, email: users.email, name: users.name })
          .from(users)
          .where(eq(users.role, 'admin'));

        for (const admin of adminUsers) {
          const [currentCount] = await db
            .select()
            .from(unreadCounts)
            .where(eq(unreadCounts.userId, admin.id))
            .limit(1);

          if (currentCount) {
            await db
              .update(unreadCounts)
              .set({
                totalCount: currentCount.totalCount + 1,
                lastUpdated: new Date()
              })
              .where(eq(unreadCounts.userId, admin.id));
          } else {
            await db.insert(unreadCounts).values({
              userId: admin.id,
              totalCount: 1,
              lastUpdated: new Date()
            });
          }

          // Send email notification to admin
          if (project) {
            // Get unread count for this project from admin's perspective
            const projectUnread = await db
              .select()
              .from(messages)
              .where(
                and(
                  eq(messages.projectId, parseInt(projectId)),
                  eq(messages.status, 'sent'),
                  eq(messages.senderRole, 'client')
                )
              );

            notifyNewMessage(db, {
              userId: admin.id,
              recipientEmail: admin.email,
              recipientName: admin.name,
              senderName: session.user.name || project.clientName,
              projectTitle: project.name,
              projectId: projectId,
              messagePreview: content.trim(),
              unreadCount: projectUnread.length,
            }).catch(err => {
              console.error('Failed to send admin message notification:', err);
            });
          }
        }
      }
    } else {
      // Save to in-memory store
      savedMessage = {
        id: messageIdCounter++,
        ...messageData,
        createdAt: Date.now(),
      };
      messagesStore.push(savedMessage);
    }

    return NextResponse.json({
      success: true,
      message: {
        id: savedMessage.id,
        projectId: savedMessage.projectId,
        senderId: savedMessage.senderId,
        senderRole: savedMessage.senderRole,
        content: savedMessage.content,
        status: savedMessage.status,
        createdAt: Math.floor(new Date(savedMessage.createdAt).getTime() / 1000), // Convert to Unix seconds
        readAt: savedMessage.readAt ? Math.floor(new Date(savedMessage.readAt).getTime() / 1000) : undefined,
        senderName: session.user.name || 'Unknown',
      },
      usingDatabase: db !== null,
    });
  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Get messages for a project
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const userId = session.user.id || session.user.email!;
    const isAdmin = session.user.role === 'admin';
    const userRole = isAdmin ? 'admin' : 'client';

    let projectMessages: any[];

    if (db) {
      // Get from D1 database, ordered by newest first
      projectMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.projectId, parseInt(projectId)))
        .orderBy(desc(messages.createdAt));

      // Mark unread messages as read for current user (messages sent by others)
      const unreadMessages = projectMessages.filter(
        m => m.status === 'sent' && m.senderRole !== userRole
      );

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(m => m.id);

        // Update message status to 'read'
        await db
          .update(messages)
          .set({
            status: 'read',
            readAt: new Date()
          })
          .where(
            and(
              sql`${messages.id} IN (${messageIds.join(',')})`,
              eq(messages.status, 'sent')
            )
          );

        // Update unread count cache
        const [currentCount] = await db
          .select()
          .from(unreadCounts)
          .where(eq(unreadCounts.userId, userId))
          .limit(1);

        const newCount = Math.max(0, (currentCount?.totalCount || 0) - unreadMessages.length);

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
    } else {
      // Get from in-memory store
      projectMessages = messagesStore
        .filter((m) => m.projectId === parseInt(projectId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Convert timestamps to Unix seconds for client
    const formattedMessages = projectMessages.map(msg => ({
      ...msg,
      createdAt: Math.floor(new Date(msg.createdAt).getTime() / 1000),
      readAt: msg.readAt ? Math.floor(new Date(msg.readAt).getTime() / 1000) : undefined,
    }));

    return NextResponse.json({
      messages: formattedMessages,
      usingDatabase: db !== null,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
