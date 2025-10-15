import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { payments, projects } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const runtime = 'edge';

// GET all payments (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = await getDb();

    // Get all payments with project details
    const allPayments = await db
      .select({
        id: payments.id,
        projectId: payments.projectId,
        userId: payments.userId,
        amount: payments.amount,
        paymentType: payments.paymentType,
        paymentMethod: payments.paymentMethod,
        referenceNumber: payments.referenceNumber,
        senderName: payments.senderName,
        senderAccountNumber: payments.senderAccountNumber,
        proofImageUrl: payments.proofImageUrl,
        status: payments.status,
        verifiedBy: payments.verifiedBy,
        verifiedAt: payments.verifiedAt,
        rejectionReason: payments.rejectionReason,
        adminNotes: payments.adminNotes,
        createdAt: payments.createdAt,
        project: {
          name: projects.name,
          clientName: projects.clientName,
        },
      })
      .from(payments)
      .leftJoin(projects, eq(payments.projectId, projects.id))
      .orderBy(sql`${payments.createdAt} DESC`)
      .all();

    // Calculate statistics
    const stats = {
      totalPending: allPayments.filter(p => p.status === 'pending').length,
      totalVerified: allPayments.filter(p => p.status === 'verified').length,
      totalRejected: allPayments.filter(p => p.status === 'rejected').length,
      pendingAmount: allPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      verifiedAmount: allPayments
        .filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return NextResponse.json({
      payments: allPayments,
      stats,
    });
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
