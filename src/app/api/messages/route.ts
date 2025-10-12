import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { messages } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

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

    const db = getDatabase((request as any).env);
    const userId = session.user.id || session.user.email!;

    const messageData = {
      projectId: parseInt(projectId),
      senderId: userId,
      content: content.trim(),
      createdAt: Math.floor(Date.now() / 1000),
    };

    let savedMessage: any;

    if (db) {
      // Save to D1 database
      const [dbMessage] = await db.insert(messages).values(messageData).returning();
      savedMessage = dbMessage;
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
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
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

    const db = getDatabase((request as any).env);
    let projectMessages: any[];

    if (db) {
      // Get from D1 database, ordered by newest first
      projectMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.projectId, parseInt(projectId)))
        .orderBy(desc(messages.createdAt));
    } else {
      // Get from in-memory store
      projectMessages = messagesStore
        .filter((m) => m.projectId === parseInt(projectId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      messages: projectMessages,
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
