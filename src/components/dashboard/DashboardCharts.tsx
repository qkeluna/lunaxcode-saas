'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { Project } from '@/lib/db/schema';

interface DashboardChartsProps {
  projects: Project[];
}

/**
 * Project Status Distribution Chart (Pie Chart)
 * Shows breakdown of projects by status: In Progress, Completed, Pending
 */
export function ProjectStatusChart({ projects }: DashboardChartsProps) {
  // Calculate status distribution
  const statusData = [
    {
      name: 'In Progress',
      value: projects.filter((p) => p.status === 'in-progress').length,
      fill: '#3b82f6', // blue-500
    },
    {
      name: 'Completed',
      value: projects.filter((p) => p.status === 'completed').length,
      fill: '#22c55e', // green-500
    },
    {
      name: 'Pending',
      value: projects.filter((p) => p.status === 'pending').length,
      fill: '#eab308', // yellow-500
    },
    {
      name: 'On Hold',
      value: projects.filter((p) => p.status === 'on-hold').length,
      fill: '#ef4444', // red-500
    },
  ].filter((item) => item.value > 0); // Only show non-zero values

  const chartConfig = {
    'in-progress': {
      label: 'In Progress',
      color: '#3b82f6',
    },
    completed: {
      label: 'Completed',
      color: '#22c55e',
    },
    pending: {
      label: 'Pending',
      color: '#eab308',
    },
    'on-hold': {
      label: 'On Hold',
      color: '#ef4444',
    },
  };

  const total = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
        <CardDescription>Distribution of projects by current status</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No projects yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Payment Status Chart (Bar Chart)
 * Shows payment status breakdown: Paid, Partially Paid, Pending
 */
export function PaymentStatusChart({ projects }: DashboardChartsProps) {
  const paymentData = [
    {
      status: 'Paid',
      count: projects.filter((p) => p.paymentStatus === 'paid').length,
      fill: '#22c55e', // green-500
    },
    {
      status: 'Partially Paid',
      count: projects.filter((p) => p.paymentStatus === 'partially-paid').length,
      fill: '#eab308', // yellow-500
    },
    {
      status: 'Pending',
      count: projects.filter((p) => p.paymentStatus === 'pending').length,
      fill: '#ef4444', // red-500
    },
  ];

  const chartConfig = {
    count: {
      label: 'Projects',
    },
  };

  const total = paymentData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Status</CardTitle>
        <CardDescription>Payment status across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No projects yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={paymentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Project Timeline Chart (Area Chart)
 * Shows projects created over the last 6 months
 */
export function ProjectTimelineChart({ projects }: DashboardChartsProps) {
  // Generate last 6 months
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      count: 0,
    });
  }

  // Count projects per month
  projects.forEach((project) => {
    if (project.createdAt) {
      const projectDate = new Date(project.createdAt);
      const monthKey = `${projectDate.getFullYear()}-${String(projectDate.getMonth() + 1).padStart(2, '0')}`;
      const monthData = months.find((m) => m.monthKey === monthKey);
      if (monthData) {
        monthData.count++;
      }
    }
  });

  const chartConfig = {
    count: {
      label: 'Projects Created',
      color: '#3b82f6',
    },
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
        <CardDescription>Projects created over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <AreaChart data={months}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * All Dashboard Charts Component
 * Combines all charts in a responsive grid layout
 */
export default function DashboardCharts({ projects }: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {/* Top Row: Status and Payment Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectStatusChart projects={projects} />
        <PaymentStatusChart projects={projects} />
      </div>

      {/* Bottom Row: Timeline Chart */}
      <div className="grid grid-cols-1">
        <ProjectTimelineChart projects={projects} />
      </div>
    </div>
  );
}

// Export individual chart components for flexible use
export { ProjectStatusChart as StatusChart, PaymentStatusChart as PaymentChart, ProjectTimelineChart as TimelineChart };
