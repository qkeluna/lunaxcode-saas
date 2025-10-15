'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneratePRDModal from '@/components/admin/GeneratePRDModal';

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
  pending: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800',
};

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/projects/${projectId}`);
      const data = await response.json();

      if (response.ok) {
        setProject(data.project);
        setTasks(data.tasks || []);
      } else {
        console.error('Failed to fetch project:', data.error);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <p className="mt-2 text-gray-600">The project you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/projects')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const groupedTasks = groupTasksBySection();
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
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
          <GeneratePRDModal
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

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

      {/* PRD & Tasks Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue={project.prd ? "prd" : "tasks"}>
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
                  <GeneratePRDModal
                    projectId={project.id}
                    projectName={project.name}
                    onSuccess={fetchProjectDetails}
                  />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div
                    className="text-gray-800 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: project.prd.replace(/\n/g, '<br />') }}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
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
                Object.entries(groupedTasks).map(([section, sectionTasks]) => (
                  <div key={section}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{section}</h3>
                    <div className="space-y-3">
                      {sectionTasks
                        .sort((a, b) => a.order - b.order)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className={priorityColors[task.priority]}>
                                  {task.priority}
                                </Badge>
                                <Badge className={taskStatusColors[task.status]}>
                                  {task.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {task.estimatedHours}h
                              </span>
                              <span>Order: {task.order}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

