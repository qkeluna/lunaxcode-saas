'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FolderPlus,
  RefreshCw,
  CheckCircle,
  DollarSign,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { Project } from '@/lib/db/schema';

interface ActivityTimelineProps {
  projects: Project[];
  maxActivities?: number;
}

interface Activity {
  id: string;
  type: 'project_created' | 'status_changed' | 'payment_received' | 'payment_pending';
  projectName: string;
  description: string;
  timestamp: Date;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

/**
 * Generate activity feed from projects
 */
function generateActivities(projects: Project[], limit: number = 10): Activity[] {
  const activities: Activity[] = [];

  projects.forEach((project) => {
    // Project created activity
    if (project.createdAt) {
      activities.push({
        id: `created-${project.id}`,
        type: 'project_created',
        projectName: project.name,
        description: `New project "${project.name}" was created`,
        timestamp: new Date(project.createdAt),
        icon: FolderPlus,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
      });
    }

    // Status change activities
    if (project.status === 'completed' && project.updatedAt) {
      activities.push({
        id: `completed-${project.id}`,
        type: 'status_changed',
        projectName: project.name,
        description: `Project "${project.name}" marked as completed`,
        timestamp: new Date(project.updatedAt),
        icon: CheckCircle,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
      });
    } else if (project.status === 'in-progress' && project.startDate) {
      activities.push({
        id: `started-${project.id}`,
        type: 'status_changed',
        projectName: project.name,
        description: `Project "${project.name}" started`,
        timestamp: new Date(project.startDate),
        icon: RefreshCw,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
      });
    } else if (project.status === 'on-hold' && project.updatedAt) {
      activities.push({
        id: `onhold-${project.id}`,
        type: 'status_changed',
        projectName: project.name,
        description: `Project "${project.name}" put on hold`,
        timestamp: new Date(project.updatedAt),
        icon: AlertCircle,
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
      });
    }

    // Payment activities
    if (project.paymentStatus === 'paid' && project.updatedAt) {
      activities.push({
        id: `paid-${project.id}`,
        type: 'payment_received',
        projectName: project.name,
        description: `Payment received for "${project.name}"`,
        timestamp: new Date(project.updatedAt),
        icon: DollarSign,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
      });
    } else if (project.paymentStatus === 'partially-paid' && project.depositAmount) {
      activities.push({
        id: `partial-${project.id}`,
        type: 'payment_received',
        projectName: project.name,
        description: `Partial payment received for "${project.name}"`,
        timestamp: new Date(project.updatedAt || project.createdAt || new Date()),
        icon: DollarSign,
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
      });
    } else if (project.paymentStatus === 'pending') {
      activities.push({
        id: `pending-${project.id}`,
        type: 'payment_pending',
        projectName: project.name,
        description: `Payment pending for "${project.name}"`,
        timestamp: new Date(project.createdAt || new Date()),
        icon: Clock,
        iconColor: 'text-gray-600',
        iconBg: 'bg-gray-100',
      });
    }

    // PRD generation activity
    if (project.prd && project.updatedAt) {
      activities.push({
        id: `prd-${project.id}`,
        type: 'status_changed',
        projectName: project.name,
        description: `PRD generated for "${project.name}"`,
        timestamp: new Date(project.updatedAt),
        icon: FileText,
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100',
      });
    }
  });

  // Sort by timestamp (most recent first) and limit
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Activity Timeline Item
 */
function ActivityItem({ activity }: { activity: Activity }) {
  const Icon = activity.icon;

  return (
    <div className="flex gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
      <div className={`w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${activity.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium truncate">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.timestamp)}</p>
      </div>
    </div>
  );
}

/**
 * Activity Timeline Component
 * Shows recent project updates and activities
 */
export default function ActivityTimeline({ projects, maxActivities = 10 }: ActivityTimelineProps) {
  const activities = generateActivities(projects, maxActivities);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your projects</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">Activity will appear here as you work on projects</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
