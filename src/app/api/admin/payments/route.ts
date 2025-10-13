import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { payments, projects, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { isAdmin, error } = await checkIsAdmin(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: error || 'Forbidden' },
      { status: error === 'Unauthorized' ? 401 : 403 }
    );
  }

  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Get all payments with project and user info
    const allPayments = await db
      .select({
        payment: payments,
        project: {
          id: projects.id,
          name: projects.name,
          clientName: projects.clientName,
          clientEmail: projects.clientEmail,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(payments)
      .leftJoin(projects, eq(payments.projectId, projects.id))
      .leftJoin(users, eq(payments.userId, users.id))
      .orderBy(desc(payments.createdAt));

    // Filter by status if provided
    let filteredPayments = allPayments;
    if (status) {
      filteredPayments = allPayments.filter((p) => p.payment.status === status);
    }

    // Calculate stats
    const totalPayments = filteredPayments.length;
    const succeededPayments = filteredPayments.filter((p) => p.payment.status === 'succeeded').length;
    const processingPayments = filteredPayments.filter((p) => p.payment.status === 'processing').length;
    const failedPayments = filteredPayments.filter((p) => p.payment.status === 'failed').length;
    const totalRevenue = filteredPayments
      .filter((p) => p.payment.status === 'succeeded')
      .reduce((sum, p) => sum + p.payment.amount, 0);

    return NextResponse.json({
      payments: filteredPayments,
      stats: {
        totalPayments,
        succeededPayments,
        processingPayments,
        failedPayments,
        totalRevenue,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
