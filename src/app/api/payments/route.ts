import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { payments, projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notifyAdmin, notifyPaymentUpdate } from '@/lib/email/notifications';

export const runtime = 'edge';

// GET payments for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const db = await getDb();

    // Verify user owns the project or is admin
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectId)))
      .get();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all payments for this project
    const projectPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.projectId, parseInt(projectId)))
      .orderBy(payments.createdAt)
      .all();

    return NextResponse.json({ payments: projectPayments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Submit payment proof
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      amount,
      paymentType, // 'deposit' | 'completion'
      paymentMethod, // 'gcash' | 'seabank' | 'paymaya' | 'bank_transfer'
      referenceNumber,
      senderName,
      senderAccountNumber,
      proofImageUrl,
    } = body;

    // Validate required fields
    if (!projectId || !amount || !paymentType || !paymentMethod || !referenceNumber || !senderName || !proofImageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Verify user owns the project
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if payment of this type already exists and is pending/verified
    const existingPayment = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.projectId, projectId),
          eq(payments.paymentType, paymentType)
        )
      )
      .get();

    if (existingPayment && (existingPayment.status === 'pending' || existingPayment.status === 'verified')) {
      return NextResponse.json(
        { error: `${paymentType} payment already submitted and is ${existingPayment.status}` },
        { status: 400 }
      );
    }

    // Create payment record
    const now = new Date();
    const [newPayment] = await db
      .insert(payments)
      .values({
        projectId,
        userId: session.user.id,
        amount,
        paymentType,
        paymentMethod,
        referenceNumber,
        senderName,
        senderAccountNumber,
        proofImageUrl,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Update project payment status if needed
    if (paymentType === 'deposit') {
      await db
        .update(projects)
        .set({
          paymentStatus: 'pending_deposit',
          updatedAt: now,
        })
        .where(eq(projects.id, projectId));
    }

    // Send admin alert for new payment submission
    try {
      notifyAdmin(db, {
        type: 'payment_submitted',
        clientName: senderName || session.user.name || 'Unknown',
        clientEmail: session.user.email || '',
        projectTitle: project.name,
        projectId: projectId.toString(),
        paymentAmount: amount,
        paymentType: paymentType === 'deposit' ? 'Deposit (50%)' : 'Completion (50%)',
        details: `Reference: ${referenceNumber}\nPayment Method: ${paymentMethod}`,
      }).catch(err => {
        console.error('Failed to send admin payment alert:', err);
      });

      // Also send confirmation to client
      notifyPaymentUpdate(db, {
        userId: session.user.id,
        recipientEmail: session.user.email || project.clientEmail,
        recipientName: session.user.name || project.clientName,
        projectTitle: project.name,
        projectId: projectId.toString(),
        paymentType: paymentType as 'deposit' | 'completion',
        amount,
        status: 'submitted',
        referenceNumber,
      }).catch(err => {
        console.error('Failed to send payment confirmation:', err);
      });
    } catch (notificationError) {
      console.error('Error sending payment notifications:', notificationError);
    }

    return NextResponse.json({
      success: true,
      payment: newPayment,
      message: 'Payment proof submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting payment:', error);
    return NextResponse.json(
      { error: 'Failed to submit payment' },
      { status: 500 }
    );
  }
}

