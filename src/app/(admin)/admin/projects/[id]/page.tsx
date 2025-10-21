'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Plus,
  MoveRight,
  GripVertical,
} from 'lucide-react';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragOverlay, useDroppable, closestCorners } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Sortable,
  SortableItem,
  SortableItemTrigger,
  SortableOverlay,
} from '@/components/ui/sortable';
import GeneratePRDModalEnhanced from '@/components/admin/GeneratePRDModalEnhanced';

// Droppable Column Component
function DroppableColumn({ children, id }: { children: React.ReactNode; id: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 min-h-[200px] p-3 rounded-lg transition-all duration-200 ${
        isOver
          ? 'bg-blue-50 border-2 border-blue-400 border-dashed shadow-lg scale-[1.02]'
          : 'bg-gray-50/50 border-2 border-transparent'
      }`}
    >
      {isOver && (
        <div className="flex items-center justify-center py-4 text-blue-600 text-sm font-medium animate-pulse">
          <MoveRight className="h-4 w-4 mr-2" />
          Drop here to move task
        </div>
      )}
      {children}
    </div>
  );
}

// Markdown to HTML converter
function markdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');
  
  // Code blocks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```/g, '').trim();
    return `<pre class="bg-gray-100 border border-gray-300 rounded p-3 text-sm text-gray-800 overflow-x-auto my-3"><code>${escapeHtml(code)}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm text-gray-800">$1</code>');
  
  // Unordered lists
  html = html.replace(/^\- (.*?)$/gm, '<li class="list-item text-gray-700">$1</li>');
  html = html.replace(/(<li class="list-item[^>]*>.*?<\/li>)/s, (match) => `<ul class="list-disc list-inside space-y-1 my-2">${match}</ul>`);
  
  // Numbered lists
  html = html.replace(/^\d+\. (.*?)$/gm, '<li class="list-item text-gray-700">$1</li>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="text-gray-700 my-3">');
  html = html.replace(/\n/g, '<br />');
  
  // Wrap in paragraph tags
  if (!html.startsWith('<h') && !html.startsWith('<pre') && !html.startsWith('<ul')) {
    html = `<p class="text-gray-700 my-3">${html}</p>`;
  }
  
  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

interface Project {
  id: number;
  name: string;
  service: string;
  clientName: string;
  clientEmail: string;
  description: string;
  timeline: number;
  budget: number;
  price: number;
  status: string;
  paymentStatus: string;
  depositAmount: number;
  prd: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface OnboardingAnswer {
  id: number;
  projectId: number;
  questionId: number;
  questionKey: string;
  questionText: string;
  answerValue: string;
  questionType: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  section: string;
  priority: string;
  status: string;
  estimatedHours: number;
  dependencies: string;
  order: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  'on-hold': 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-red-100 text-red-800',
  'partially-paid': 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const taskStatusColors: Record<string, string> = {
  'pending': 'bg-gray-100 text-gray-800',
  'to-do': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'testing': 'bg-purple-100 text-purple-800',
  'done': 'bg-green-100 text-green-800',
};

// Kanban board statuses (excludes 'pending' which is for backlog)
const TASK_STATUSES = [
  { value: 'to-do', label: 'To Do', color: 'bg-gray-50 border-gray-200' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { value: 'testing', label: 'Testing', color: 'bg-purple-50 border-purple-200' },
  { value: 'done', label: 'Done', color: 'bg-green-50 border-green-200' },
];

// All statuses including backlog for dropdowns
const ALL_TASK_STATUSES = [
  { value: 'pending', label: 'Backlog' },
  { value: 'to-do', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'testing', label: 'Testing' },
  { value: 'done', label: 'Done' },
];

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/projects/${projectId}`);
      const data = await response.json() as { project?: Project; tasks?: Task[]; onboardingAnswers?: OnboardingAnswer[]; error?: string };

      if (response.ok && data.project) {
        setProject(data.project);
        setTasks(data.tasks || []);
        setOnboardingAnswers(data.onboardingAnswers || []);
      } else {
        console.error('Failed to fetch project:', data.error);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId, fetchProjectDetails]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const groupTasksBySection = () => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!grouped[task.section]) {
        grouped[task.section] = [];
      }
      grouped[task.section].push(task);
    });
    return grouped;
  };

  const groupTasksByStatus = () => {
    const grouped: Record<string, Task[]> = {};
    TASK_STATUSES.forEach(status => {
      grouped[status.value] = tasks
        .filter(task => task.status === status.value)
        .sort((a, b) => a.order - b.order); // Sort by order field
    });
    return grouped;
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh project data
        fetchProjectDetails();
      } else {
        console.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          priority: newTaskPriority,
          status: 'pending',
          section: 'Custom',
          estimatedHours: 0,
          dependencies: '',
          order: tasks.length + 1,
        }),
      });

      if (response.ok) {
        // Reset form and refresh
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setIsAddingTask(false);
        fetchProjectDetails();
      } else {
        console.error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const taskId = parseInt(active.id.toString().replace('task-', '').replace('backlog-', ''));
    setActiveTaskId(taskId);
  };

  const handleDragOver = (event: any) => {
    // Can add visual feedback here if needed
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const taskId = parseInt(active.id.toString().replace('task-', '').replace('backlog-', ''));
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return;

    let newStatus = task.status;
    let targetPosition: number | null = null;

    // Determine the target status and position
    if (over.id.toString().startsWith('column-')) {
      // Dropped on empty column space
      newStatus = over.id.toString().replace('column-', '');
      targetPosition = null; // Add to end of column
    } else if (over.id.toString().startsWith('task-') || over.id.toString().startsWith('backlog-')) {
      // Dropped on another task
      const overTaskId = parseInt(over.id.toString().replace('task-', '').replace('backlog-', ''));
      const overTask = tasks.find((t) => t.id === overTaskId);

      if (overTask) {
        newStatus = overTask.status;
        targetPosition = overTask.order;
      }
    }

    // Update task if status changed or position changed
    if (newStatus !== task.status || targetPosition !== null) {
      await handleTaskMove(taskId, newStatus, targetPosition);
    }
  };

  const handleTaskMove = async (taskId: number, newStatus: string, targetPosition: number | null) => {
    try {
      // Optimistic update
      const updatedTasks = [...tasks];
      const taskIndex = updatedTasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) return;

      const task = updatedTasks[taskIndex];
      const oldStatus = task.status;

      // Get tasks in the target column
      const targetColumnTasks = updatedTasks
        .filter((t) => t.status === newStatus && t.id !== taskId)
        .sort((a, b) => a.order - b.order);

      // Determine new order
      let newOrder: number;
      if (targetPosition === null || targetColumnTasks.length === 0) {
        // Add to end of column
        newOrder = targetColumnTasks.length > 0
          ? Math.max(...targetColumnTasks.map(t => t.order)) + 1
          : 0;
      } else {
        // Insert at specific position
        const insertIndex = targetColumnTasks.findIndex((t) => t.order >= targetPosition);
        if (insertIndex === -1) {
          newOrder = targetColumnTasks.length > 0
            ? Math.max(...targetColumnTasks.map(t => t.order)) + 1
            : 0;
        } else {
          newOrder = targetColumnTasks[insertIndex].order;
          // Shift other tasks down
          targetColumnTasks.slice(insertIndex).forEach((t) => {
            const idx = updatedTasks.findIndex((ut) => ut.id === t.id);
            if (idx !== -1) updatedTasks[idx].order += 1;
          });
        }
      }

      // Update the moved task
      updatedTasks[taskIndex] = {
        ...task,
        status: newStatus,
        order: newOrder,
      };

      // Update UI optimistically
      setTasks(updatedTasks);

      // Persist to backend
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          order: newOrder,
        }),
      });

      if (!response.ok) {
        // Revert on failure
        console.error('Failed to update task');
        fetchProjectDetails();
      }
    } catch (error) {
      console.error('Error moving task:', error);
      fetchProjectDetails();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Project Not Found</h2>
          <p className="mt-2 text-gray-600">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/projects')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const groupedTasks = groupTasksBySection();
  const kanbanTasks = groupTasksByStatus();
  const backlogTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/projects')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">Project ID: {project.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GeneratePRDModalEnhanced
            projectId={project.id}
            projectName={project.name}
            onSuccess={fetchProjectDetails}
          />
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/projects/${project.id}/edit`)}
          >
            Edit Project
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={statusColors[project.status] || 'bg-gray-100'}>
                  {project.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <Badge className={paymentStatusColors[project.paymentStatus]}>
                  {project.paymentStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="text-lg font-semibold">
                  {completedTasks}/{tasks.length} tasks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated</p>
                <p className="text-lg font-semibold">{totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details & Client Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Details & Onboarding Tabs Card */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">
                  <span className="hidden sm:inline">Details</span>
                </TabsTrigger>
                <TabsTrigger value="onboarding">
                  <HelpCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Onboarding</span>
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Type</label>
                  <p className="text-base text-gray-900">{project.service}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-base text-gray-900">{project.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Budget</label>
                    <p className="text-base text-gray-900">{formatCurrency(project.budget)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Price</label>
                    <p className="text-base text-gray-900">{formatCurrency(project.price)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Timeline</label>
                    <p className="text-base text-gray-900">{project.timeline} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deposit</label>
                    <p className="text-base text-gray-900">{formatCurrency(project.depositAmount)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="text-base text-gray-900">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="text-base text-gray-900">{formatDate(project.endDate)}</p>
                  </div>
                </div>
              </TabsContent>

              {/* Onboarding Tab */}
              <TabsContent value="onboarding" className="space-y-4 mt-4">
                {onboardingAnswers.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Onboarding Data
                    </h3>
                    <p className="text-sm text-gray-600">
                      This project doesn&apos;t have any onboarding responses yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {onboardingAnswers.map((answer, idx) => (
                      <div key={answer.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 font-medium">Q{idx + 1}</p>
                          <h4 className="font-semibold text-gray-900 text-sm mt-1">
                            {answer.questionText}
                          </h4>
                        </div>
                        
                        <div className="mt-2">
                          {answer.questionType === 'checkbox' ? (
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                try {
                                  const values = JSON.parse(answer.answerValue);
                                  return Array.isArray(values) ? values.map((v: string, i: number) => (
                                    <Badge key={i} className="bg-blue-100 text-blue-800 text-xs">
                                      {v}
                                    </Badge>
                                  )) : (
                                    <p className="text-gray-700 text-sm">{answer.answerValue}</p>
                                  );
                                } catch {
                                  return <p className="text-gray-700 text-sm">{answer.answerValue}</p>;
                                }
                              })()}
                            </div>
                          ) : (
                            <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                              {answer.answerValue}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Client Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{project.clientName}</p>
                <p className="text-sm text-gray-500">{project.clientEmail}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-base text-gray-900">{formatDate(project.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRD & Tasks Tabs - Below */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="prd">
                <FileText className="h-4 w-4 mr-2" />
                PRD
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Tasks ({tasks.length})
              </TabsTrigger>
            </TabsList>

            {/* PRD Tab */}
            <TabsContent value="prd" className="space-y-4">
              {!project.prd ? (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No PRD Generated Yet
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click the Sparkles button above to generate a comprehensive PRD with AI
                  </p>
                  <GeneratePRDModalEnhanced
                    projectId={project.id}
                    projectName={project.name}
                    onSuccess={fetchProjectDetails}
                  />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div
                    className="text-gray-800"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(project.prd) }}
                  />
                </div>
              )}
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Tasks Generated Yet
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tasks are generated automatically when you create a PRD
                  </p>
                </div>
              ) : (
                <>
                <DndContext
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  collisionDetection={closestCorners}
                >
                  {/* Kanban Board */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {TASK_STATUSES.map((status) => (
                      <div key={status.value} className="space-y-2">
                        {/* Kanban Column Header */}
                        <div className={`p-2 rounded-lg border ${status.color}`}>
                          <h3 className="font-semibold text-gray-900 text-sm flex items-center justify-between">
                            <span>{status.label}</span>
                            <span className="text-xs font-normal text-gray-500">
                              {kanbanTasks[status.value]?.length || 0}
                            </span>
                          </h3>
                        </div>

                        {/* Droppable Column */}
                        <SortableContext
                          items={kanbanTasks[status.value]?.map((t) => `task-${t.id}`) || []}
                          strategy={verticalListSortingStrategy}
                        >
                          <DroppableColumn id={`column-${status.value}`}>
                            {kanbanTasks[status.value]?.map((task) => (
                              <SortableItem key={task.id} id={`task-${task.id}`} asChild>
                                <SortableItemTrigger asChild>
                                  <div className="bg-white border rounded p-2 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
                                    <div className="flex items-start gap-2">
                                      <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="h-3 w-3" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="mb-1">
                                          <h4 className="font-medium text-xs text-gray-900 mb-1">
                                            {task.title}
                                          </h4>
                                          <div className="flex items-center gap-1 mb-1">
                                            <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                                              {task.priority}
                                            </Badge>
                                          </div>
                                        </div>
                                        
                                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                                          {task.description}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {task.estimatedHours}h
                                          </span>
                                        </div>

                                        {/* Status Change Dropdown */}
                                        <select
                                          value={task.status}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            handleStatusChange(task.id, e.target.value);
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full text-xs border rounded px-1 py-0.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        >
                                          {ALL_TASK_STATUSES.map((s) => (
                                            <option key={s.value} value={s.value}>
                                              {s.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </SortableItemTrigger>
                              </SortableItem>
                            ))}
                          </DroppableColumn>
                        </SortableContext>
                      </div>
                    ))}
                  </div>
                  
                  {/* Drag Overlay */}
                  <DragOverlay>
                    {activeTaskId ? (() => {
                      const activeTask = tasks.find((t) => t.id === activeTaskId);
                      if (!activeTask) return null;

                      return (
                        <div className="bg-white border-2 border-blue-400 rounded-lg p-3 shadow-2xl cursor-grabbing rotate-2 opacity-90">
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-blue-500" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-900 mb-2">
                                {activeTask.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${priorityColors[activeTask.priority]}`}>
                                  {activeTask.priority}
                                </Badge>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {activeTask.estimatedHours}h
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })() : null}
                  </DragOverlay>

              {/* Backlog Section */}
              {tasks.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Backlog ({backlogTasks.length})
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tasks waiting to be added to the Kanban board - drag to columns above
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsAddingTask(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Task
                    </Button>
                  </div>

                  {backlogTasks.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-500">
                        No tasks in backlog. All tasks are in the Kanban board!
                      </p>
                    </div>
                  ) : (
                    <SortableContext
                      items={backlogTasks.map((t) => `backlog-${t.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>Task</TableHead>
                              <TableHead>Section</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Estimated Hours</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {backlogTasks.map((task) => (
                              <SortableItem key={task.id} id={`backlog-${task.id}`} asChild>
                                <TableRow className="cursor-grab active:cursor-grabbing hover:bg-gray-50">
                                  <TableCell>
                                    <SortableItemTrigger asChild>
                                      <div className="flex items-center justify-center">
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                      </div>
                                    </SortableItemTrigger>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium text-sm">{task.title}</p>
                                      <p className="text-xs text-gray-500 line-clamp-1">
                                        {task.description}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-xs text-gray-600">{task.section}</span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                                      {task.priority}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-gray-600">
                                      {task.estimatedHours}h
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusChange(task.id, 'to-do')}
                                      className="gap-2"
                                    >
                                      <MoveRight className="h-3 w-3" />
                                      Move to Board
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              </SortableItem>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </SortableContext>
                  )}
                </div>
              )}
                </DndContext>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* Add Task Dialog */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTask(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

