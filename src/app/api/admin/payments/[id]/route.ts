import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { payments, projects, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notifyPaymentUpdate } from '@/lib/email/notifications';

export const runtime = 'edge';

// PATCH - Verify or reject payment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const paymentId = parseInt(params.id);
    const body = await request.json();
    const { status, adminNotes, rejectionReason } = body;

    if (!status || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "verified" or "rejected"' },
        { status: 400 }
      );
    }

    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting payment' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get payment details
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .get();

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const now = new Date();

    // Update payment status
    await db
      .update(payments)
      .set({
        status,
        verifiedBy: status === 'verified' ? session.user.id : null,
        verifiedAt: status === 'verified' ? now : null,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        adminNotes,
        updatedAt: now,
      })
      .where(eq(payments.id, paymentId));

    // Get project and user details for notification
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, payment.projectId))
      .get();

    // Update project payment status based on verification
    if (status === 'verified' && project) {
      let newPaymentStatus = project.paymentStatus;
      let newProjectStatus = project.status;

      if (payment.paymentType === 'deposit') {
        // Deposit verified - project can now start
        newPaymentStatus = 'partially-paid';
        if (project.status === 'pending') {
          newProjectStatus = 'in-progress'; // Start the project
        }
      } else if (payment.paymentType === 'completion') {
        // Completion payment verified - project fully paid
        newPaymentStatus = 'paid';
        // Optionally mark project as completed if not already
        if (project.status === 'in-progress') {
          newProjectStatus = 'completed';
        }
      }

      await db
        .update(projects)
        .set({
          paymentStatus: newPaymentStatus,
          status: newProjectStatus,
          startDate: payment.paymentType === 'deposit' && !project.startDate ? now : project.startDate,
          updatedAt: now,
        })
        .where(eq(projects.id, payment.projectId));
    }

    // Send payment notification email
    if (project) {
      try {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, project.userId))
          .get();

        if (user) {
          notifyPaymentUpdate(db, {
            userId: user.id,
            recipientEmail: user.email,
            recipientName: user.name,
            projectTitle: project.name,
            projectId: project.id.toString(),
            paymentType: payment.paymentType as 'deposit' | 'completion',
            amount: payment.amount,
            status: status as 'verified' | 'rejected',
            referenceNumber: payment.referenceNumber || undefined,
            adminNotes: status === 'rejected' ? rejectionReason : adminNotes,
          }).catch(err => {
            console.error('Failed to send payment notification:', err);
          });
        }
      } catch (notificationError) {
        console.error('Error preparing payment notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
