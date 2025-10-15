import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { paymentAccounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// PATCH - Update payment account
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const accountId = parseInt(params.id);
    const body = await request.json();

    const db = await getDb();
    const now = new Date();

    await db
      .update(paymentAccounts)
      .set({
        ...body,
        updatedAt: now,
      })
      .where(eq(paymentAccounts.id, accountId));

    return NextResponse.json({
      success: true,
      message: 'Payment account updated',
    });
  } catch (error) {
    console.error('Error updating payment account:', error);
    return NextResponse.json(
      { error: 'Failed to update payment account' },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const accountId = parseInt(params.id);
    const db = await getDb();

    await db
      .delete(paymentAccounts)
      .where(eq(paymentAccounts.id, accountId));

    return NextResponse.json({
      success: true,
      message: 'Payment account deleted',
    });
  } catch (error) {
    console.error('Error deleting payment account:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment account' },
      { status: 500 }
    );
  }
}

