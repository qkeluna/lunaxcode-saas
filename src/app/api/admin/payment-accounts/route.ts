import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { paymentAccounts } from '@/lib/db/schema';
import { checkIsAdmin } from '@/lib/auth/check-admin';

export const runtime = 'edge';

// GET all payment accounts (admin)
export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 403 });
    }

    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const db = drizzle(context.env.DB);
    
    const accounts = await db
      .select()
      .from(paymentAccounts)
      .orderBy(paymentAccounts.order)
      .all();

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching payment accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment accounts' },
      { status: 500 }
    );
  }
}

// POST - Create new payment account
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      accountType,
      accountName,
      accountNumber,
      bankName,
      instructions,
      qrCodeUrl,
      isActive,
    } = body;

    if (!accountType || !accountName || !accountNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const db = drizzle(context.env.DB);
    const now = new Date();

    // Get max order for new account
    const maxOrder = await db
      .select()
      .from(paymentAccounts)
      .orderBy(paymentAccounts.order)
      .limit(1)
      .all();

    const order = maxOrder.length > 0 ? (maxOrder[0].order || 0) + 1 : 1;

    const [newAccount] = await db
      .insert(paymentAccounts)
      .values({
        accountType,
        accountName,
        accountNumber,
        bankName: bankName || null,
        instructions: instructions || null,
        qrCodeUrl: qrCodeUrl || null,
        isActive: isActive ?? true,
        order,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({
      success: true,
      account: newAccount,
    });
  } catch (error) {
    console.error('Error creating payment account:', error);
    return NextResponse.json(
      { error: 'Failed to create payment account' },
      { status: 500 }
    );
  }
}

