import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { projects, users } from '@/lib/db/schema';
import { eq, count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { isAdmin, error } = await checkIsAdmin(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: error || 'Forbidden' },
      { status: error === 'Unauthorized' ? 401 : 403 }
    );
  }

  try {
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    // Optimized: Use SQL aggregation for counts instead of loading all records
    const [{ totalProjects }] = await db
      .select({ totalProjects: count() })
      .from(projects);

    const [{ activeProjects }] = await db
      .select({ activeProjects: count() })
      .from(projects)
      .where(eq(projects.status, 'in-progress'));

    const [{ completedProjects }] = await db
      .select({ completedProjects: count() })
      .from(projects)
      .where(eq(projects.status, 'completed'));

    const [{ totalClients }] = await db
      .select({ totalClients: count() })
      .from(users)
      .where(eq(users.role, 'client'));

    // Count projects with pending or partially-paid status
    const [{ pendingPayments }] = await db
      .select({ pendingPayments: count() })
      .from(projects)
      .where(
        sql`${projects.paymentStatus} IN ('pending', 'partially-paid')`
      );

    // Calculate total revenue properly:
    // - For 'paid' projects: count full price
    // - For 'partially-paid' projects: count deposit amount only
    // - For 'pending' projects: count nothing
    const allProjects = await db.select().from(projects);

    const totalRevenue = allProjects.reduce((sum, project) => {
      if (project.paymentStatus === 'paid') {
        return sum + (project.price || 0);
      } else if (project.paymentStatus === 'partially-paid') {
        return sum + (project.depositAmount || 0);
      }
      return sum; // Don't count pending payments
    }, 0);

    // Get recent projects (last 5) - still need full query for sorting by timestamp
    const recentProjectsRaw = await db
      .select({
        id: projects.id,
        name: projects.name,
        clientName: projects.clientName,
        status: projects.status,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .orderBy(sql`${projects.createdAt} DESC`)
      .limit(5);

    const recentProjects = recentProjectsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      status: p.status,
    }));

    // Get pending payments list (top 5 projects with outstanding balances)
    const pendingPaymentsRaw = await db
      .select({
        id: projects.id,
        name: projects.name,
        price: projects.price,
        depositAmount: projects.depositAmount,
      })
      .from(projects)
      .where(
        sql`${projects.paymentStatus} IN ('pending', 'partially-paid')`
      )
      .limit(5);

    const pendingPaymentsList = pendingPaymentsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      balance: (p.price || 0) - (p.depositAmount || 0),
    }));

    return NextResponse.json({
      totalProjects,
      activeProjects,
      completedProjects,
      totalClients,
      pendingPayments,
      totalRevenue,
      recentProjects,
      pendingPaymentsList,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
