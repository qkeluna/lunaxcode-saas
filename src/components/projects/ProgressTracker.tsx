'use client';

import { useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  section: string;
  status: string;
  estimatedHours: number;
}

interface ProgressTrackerProps {
  tasks: Task[];
  timeline: number;
  startDate: number;
  endDate: number;
  projectStatus: string;
}

export default function ProgressTracker({
  tasks,
  timeline,
  startDate,
  endDate,
  projectStatus,
}: ProgressTrackerProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate hours
    const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const completedHours = tasks
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.estimatedHours, 0);
    const hoursRemaining = totalHours - completedHours;

    // Calculate timeline progress
    const now = new Date();
    const start = new Date(startDate > 10000000000 ? startDate : startDate * 1000);
    const end = new Date(endDate > 10000000000 ? endDate : endDate * 1000);

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const timeProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

    const daysElapsed = Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, timeline - daysElapsed);

    // Calculate section progress
    const sectionStats = tasks.reduce((acc: any, task) => {
      const section = task.section || 'Other';
      if (!acc[section]) {
        acc[section] = { total: 0, completed: 0 };
      }
      acc[section].total++;
      if (task.status === 'completed') {
        acc[section].completed++;
      }
      return acc;
    }, {});

    // Determine if on track
    const isOnTrack = completionRate >= timeProgress;

    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate,
      totalHours,
      completedHours,
      hoursRemaining,
      timeProgress,
      daysElapsed,
      daysRemaining,
      sectionStats,
      isOnTrack,
    };
  }, [tasks, timeline, startDate, endDate]);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Project Progress</h2>
        </div>
        {stats.isOnTrack ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            On Track
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            Behind Schedule
          </div>
        )}
      </div>

      {/* Main progress indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task completion */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Task Completion</h3>
            <span className="text-2xl font-bold text-blue-600">{stats.completionRate}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{stats.completed} of {stats.total} tasks</span>
            <span>{stats.hoursRemaining}h remaining</span>
          </div>
        </div>

        {/* Time progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Timeline Progress</h3>
            <span className="text-2xl font-bold text-purple-600">{stats.timeProgress}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{ width: `${stats.timeProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{stats.daysElapsed} days elapsed</span>
            <span>{stats.daysRemaining} days left</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
          <p className="text-xs text-green-700">Completed</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
          <p className="text-xs text-blue-700">In Progress</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          <p className="text-xs text-yellow-700">Pending</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <p className="text-2xl font-bold text-purple-900">{stats.totalHours}h</p>
          <p className="text-xs text-purple-700">Total Hours</p>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="pt-4 border-t">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Progress by Section</h3>
        <div className="space-y-3">
          {Object.entries(stats.sectionStats).map(([section, data]: [string, any]) => {
            const percentage = Math.round((data.completed / data.total) * 100);
            return (
              <div key={section}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{section}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.completed}/{data.total} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percentage === 100
                        ? 'bg-green-500'
                        : percentage > 50
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {!stats.isOnTrack && stats.daysRemaining > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Action Required</p>
              <p>
                Project progress ({stats.completionRate}%) is behind timeline progress (
                {stats.timeProgress}%). Consider prioritizing pending tasks or adjusting the
                timeline to stay on track.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
