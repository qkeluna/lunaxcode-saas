import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { paymentAccounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/auth/check-admin';

export const runtime = 'edge';

// PATCH - Update payment account
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, error } = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const accountId = parseInt(id);
    const body = await request.json();

    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const db = drizzle(context.env.DB);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, error } = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const accountId = parseInt(id);

    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const db = drizzle(context.env.DB);

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

