'use client';

import { useState, useMemo } from 'react';
import { CheckCircle2, Circle, Clock, ChevronDown } from 'lucide-react';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  section: string;
  priority: string;
  status: string;
  estimatedHours: number;
  dependencies: string;
  order: number;
}

interface TaskListProps {
  initialTasks: Task[];
  projectId: number;
}

type TaskStatus = 'all' | 'pending' | 'in-progress' | 'completed';

export default function TaskList({ initialTasks, projectId }: TaskListProps) {
  const { showError, AlertDialog } = useAlertDialog();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<TaskStatus>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  // Filter tasks based on status
  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  // Group tasks by section
  const tasksBySection = useMemo(() => {
    return filteredTasks.reduce((acc: any, task: Task) => {
      const section = task.section || 'Other';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(task);
      return acc;
    }, {});
  }, [filteredTasks]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return { total, pending, inProgress, completed };
  }, [tasks]);

  // Update task status
  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    setUpdatingTaskId(taskId);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const data = await response.json();

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      showError('Failed to update task status. Please try again.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <span className="text-sm text-gray-600">
            {stats.completed} / {stats.total} completed
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'in-progress'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            In Progress ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({stats.completed})
          </button>
        </div>
      </div>

      {/* Tasks grouped by section */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Circle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No tasks match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(tasksBySection).map(([section, sectionTasks]: [string, any]) => (
            <div key={section} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">{section}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {sectionTasks.filter((t: Task) => t.status === 'completed').length} /{' '}
                  {sectionTasks.length} completed
                </p>
              </div>

              <div className="divide-y">
                {sectionTasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status icon */}
                      <div className="mt-1 flex-shrink-0">
                        {getStatusIcon(task.status)}
                      </div>

                      {/* Task content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                task.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-xs text-gray-600">
                              {task.estimatedHours}h
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                        {task.dependencies && (
                          <p className="text-xs text-gray-500 mb-3">
                            Dependencies: {task.dependencies}
                          </p>
                        )}

                        {/* Status selector */}
                        <div className="relative inline-block">
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            disabled={updatingTaskId === task.id}
                            className={`appearance-none px-4 py-2 pr-8 text-sm font-medium rounded-lg border cursor-pointer transition-colors ${
                              task.status === 'completed'
                                ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                                : task.status === 'in-progress'
                                ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                                : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                            } ${updatingTaskId === task.id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
