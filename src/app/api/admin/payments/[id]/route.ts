import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { payments, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // @ts-ignore
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const paymentId = parseInt(params.id);
    const body = await request.json();

    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Update payment status
    const [updatedPayment] = await db
      .update(payments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // If payment succeeded, update project payment status
    if (status === 'succeeded') {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, updatedPayment.projectId));

      if (project.length > 0) {
        const currentProject = project[0];
        const newDepositAmount = (currentProject.depositAmount || 0) + updatedPayment.amount;
        const totalPrice = currentProject.price || 0;

        let newPaymentStatus = 'pending';
        if (newDepositAmount >= totalPrice) {
          newPaymentStatus = 'paid';
        } else if (newDepositAmount > 0) {
          newPaymentStatus = 'partially-paid';
        }

        await db
          .update(projects)
          .set({
            depositAmount: newDepositAmount,
            paymentStatus: newPaymentStatus,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, updatedPayment.projectId));
      }
    }

    return NextResponse.json({ payment: updatedPayment });
  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
