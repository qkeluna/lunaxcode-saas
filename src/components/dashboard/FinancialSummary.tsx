'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import type { Project, Payment } from '@/lib/db/schema';

interface FinancialSummaryProps {
  projects: Project[];
  payments?: Payment[];
}

/**
 * Calculate financial metrics from projects and payments
 */
function calculateFinancialMetrics(projects: Project[], payments?: Payment[]) {
  // Total Revenue (all paid + partially paid amounts)
  let totalRevenue = 0;

  if (payments && payments.length > 0) {
    // Use actual payment records if available
    totalRevenue = payments
      .filter((p) => p.status === 'verified')
      .reduce((sum, payment) => sum + payment.amount, 0);
  } else {
    // Fallback: estimate from project prices and payment status
    totalRevenue = projects.reduce((sum, project) => {
      if (project.paymentStatus === 'paid') {
        return sum + project.price;
      } else if (project.paymentStatus === 'partially-paid') {
        return sum + (project.depositAmount || project.price * 0.5);
      }
      return sum;
    }, 0);
  }

  // Outstanding Balance (pending payments)
  const outstandingBalance = projects.reduce((sum, project) => {
    if (project.paymentStatus === 'pending') {
      return sum + project.price;
    } else if (project.paymentStatus === 'partially-paid') {
      const remaining = project.price - (project.depositAmount || project.price * 0.5);
      return sum + remaining;
    }
    return sum;
  }, 0);

  // Average Project Value
  const averageProjectValue = projects.length > 0
    ? projects.reduce((sum, p) => sum + p.price, 0) / projects.length
    : 0;

  // Find next payment due
  const projectsWithPending = projects.filter(
    (p) => p.paymentStatus === 'pending' || p.paymentStatus === 'partially-paid'
  );

  let nextPaymentDue: { amount: number; date: Date | null; projectName: string } | null = null;

  if (projectsWithPending.length > 0) {
    // Sort by end date or created date
    const sorted = projectsWithPending.sort((a, b) => {
      const dateA = a.endDate || a.createdAt || new Date();
      const dateB = b.endDate || b.createdAt || new Date();
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

    const nextProject = sorted[0];
    const remainingAmount = nextProject.paymentStatus === 'partially-paid'
      ? nextProject.price - (nextProject.depositAmount || nextProject.price * 0.5)
      : nextProject.price;

    nextPaymentDue = {
      amount: remainingAmount,
      date: nextProject.endDate,
      projectName: nextProject.name,
    };
  }

  return {
    totalRevenue,
    outstandingBalance,
    averageProjectValue,
    nextPaymentDue,
  };
}

/**
 * Format currency in Philippine Peso
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(date: Date | number | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Financial Summary Card
 */
function FinancialCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-lg ${
            trend === 'up' ? 'bg-green-100' :
            trend === 'down' ? 'bg-red-100' :
            'bg-blue-100'
          }`}>
            <Icon className={`w-5 h-5 ${
              trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' :
              'text-blue-600'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Financial Summary Component
 * Displays key financial metrics across all projects
 */
export default function FinancialSummary({ projects, payments }: FinancialSummaryProps) {
  const metrics = calculateFinancialMetrics(projects, payments);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
        <p className="text-sm text-gray-600">Summary of your project finances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <FinancialCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          description="All verified payments received"
          icon={DollarSign}
          trend="up"
        />

        {/* Outstanding Balance */}
        <FinancialCard
          title="Outstanding Balance"
          value={formatCurrency(metrics.outstandingBalance)}
          description="Pending and partial payments"
          icon={AlertCircle}
          trend={metrics.outstandingBalance > 0 ? 'down' : 'neutral'}
        />

        {/* Average Project Value */}
        <FinancialCard
          title="Average Project Value"
          value={formatCurrency(metrics.averageProjectValue)}
          description={`Across ${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          icon={TrendingUp}
          trend="neutral"
        />

        {/* Next Payment Due */}
        <FinancialCard
          title="Next Payment Due"
          value={metrics.nextPaymentDue ? formatCurrency(metrics.nextPaymentDue.amount) : 'None'}
          description={
            metrics.nextPaymentDue
              ? `${metrics.nextPaymentDue.projectName} - ${formatDate(metrics.nextPaymentDue.date)}`
              : 'All payments up to date'
          }
          icon={Calendar}
          trend={metrics.nextPaymentDue ? 'neutral' : 'up'}
        />
      </div>

      {/* Additional Financial Insights */}
      {projects.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Financial Health</CardTitle>
            <CardDescription>Quick insights about your project finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Payment Completion Rate */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 uppercase">Payment Completion</p>
                <p className="text-xl font-bold mt-1">
                  {Math.round(
                    (projects.filter((p) => p.paymentStatus === 'paid').length / projects.length) * 100
                  )}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {projects.filter((p) => p.paymentStatus === 'paid').length} of {projects.length} projects
                </p>
              </div>

              {/* Revenue per Project */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 uppercase">Revenue per Project</p>
                <p className="text-xl font-bold mt-1">
                  {formatCurrency(
                    projects.length > 0 ? metrics.totalRevenue / projects.length : 0
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Average revenue generated</p>
              </div>

              {/* Pending Projects */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 uppercase">Pending Payments</p>
                <p className="text-xl font-bold mt-1">
                  {projects.filter((p) => p.paymentStatus !== 'paid').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(metrics.outstandingBalance)} outstanding
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
