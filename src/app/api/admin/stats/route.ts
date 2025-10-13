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
    const db = getDatabase((request as any).env);

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    // Get all projects
    const allProjects = await db.select().from(projects);

    // Calculate stats
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter((p) => p.status === 'in-progress').length;
    const completedProjects = allProjects.filter((p) => p.status === 'completed').length;
    const pendingPayments = allProjects.filter((p) => p.paymentStatus === 'pending' || p.paymentStatus === 'partially-paid').length;

    // Calculate total revenue (sum of all paid amounts)
    const totalRevenue = allProjects.reduce((sum, project) => {
      return sum + (project.depositAmount || 0);
    }, 0);

    // Get total clients (unique users)
    const allUsers = await db.select().from(users);
    const totalClients = allUsers.filter((u) => u.role === 'client').length;

    // Get recent projects (last 5)
    const recentProjects = allProjects
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        clientName: p.clientName,
        status: p.status,
      }));

    // Get pending payments list
    const pendingPaymentsList = allProjects
      .filter((p) => p.paymentStatus === 'pending' || p.paymentStatus === 'partially-paid')
      .map((p) => ({
        id: p.id,
        name: p.name,
        balance: (p.price || 0) - (p.depositAmount || 0),
      }))
      .slice(0, 5);

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
