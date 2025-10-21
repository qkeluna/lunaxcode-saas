'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, CreditCard, FolderKanban, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Project, Task } from '@/lib/db/schema';

interface ProjectWithTasks extends Project {
  tasks?: Task[];
}

interface ProjectsListClientProps {
  projects: ProjectWithTasks[];
}

type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'name';
type StatusFilter = 'all' | 'in-progress' | 'completed' | 'pending' | 'on-hold';
type PaymentFilter = 'all' | 'paid' | 'partially-paid' | 'pending';

export function ProjectsListClient({ projects }: ProjectsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Calculate task completion percentage
  function calculateProgress(tasks?: Task[]): number {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.status === 'done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  // Get progress bar color based on percentage
  function getProgressColor(progress: number): string {
    if (progress >= 67) return 'bg-green-500';
    if (progress >= 34) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  // Get progress text color
  function getProgressTextColor(progress: number): string {
    if (progress >= 67) return 'text-green-600';
    if (progress >= 34) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.service.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((project) => project.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      result = result.filter((project) => project.paymentStatus === paymentFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, statusFilter, paymentFilter, sortOption]);

  // Clear all filters
  function clearFilters() {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setSortOption('newest');
  }

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    paymentFilter !== 'all' ||
    sortOption !== 'newest';

  // Get status badge styling
  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'on-hold': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  // Get payment badge styling
  function getPaymentBadge(paymentStatus: string) {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      'partially-paid': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[paymentStatus] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by project name or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Filter */}
          <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partially-paid">Partially Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="name">Name: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
          {hasActiveFilters && ` (filtered from ${projects.length} total)`}
        </p>
      </div>

      {/* Empty States */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          {projects.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first project!
              </p>
              <Link href="/onboarding">
                <Button>
                  Create Your First Project
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </>
          )}
        </div>
      ) : (
        /* Project Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const progress = calculateProgress(project.tasks);
            const needsPayment = project.paymentStatus === 'pending' || project.paymentStatus === 'partially-paid';

            return (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex flex-col"
              >
                {/* Header */}
                <Link href={`/projects/${project.id}`} className="block mb-4 group">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600">{project.service}</p>
                </Link>

                <div className="space-y-3 flex-1">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="outline" className={getStatusBadge(project.status || 'pending')}>
                      {project.status || 'pending'}
                    </Badge>
                  </div>

                  {/* Payment Badge */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment</span>
                    <Badge variant="outline" className={getPaymentBadge(project.paymentStatus || 'pending')}>
                      {project.paymentStatus || 'pending'}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  {project.tasks && project.tasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className={`font-semibold ${getProgressTextColor(progress)}`}>
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {project.tasks.filter((t) => t.status === 'done').length} of {project.tasks.length} tasks
                        completed
                      </p>
                    </div>
                  )}

                  {/* Price and Timeline */}
                  <div className="pt-3 border-t space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-semibold text-gray-900">
                        ₱{project.price.toLocaleString()}
                      </span>
                    </div>
                    {project.timeline && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Timeline</span>
                        <span className="text-gray-900">{project.timeline} days</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment CTA Button */}
                {needsPayment && (
                  <div className="mt-4 pt-4 border-t">
                    <Link href={`/projects/${project.id}/payment`} className="block">
                      <Button
                        className={`w-full ${
                          project.paymentStatus === 'pending'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {project.paymentStatus === 'pending' ? 'Pay Now' : 'Complete Payment'}
                      </Button>
                    </Link>
                  </div>
                )}

                {/* View Details Link */}
                {!needsPayment && (
                  <div className="mt-4 pt-4 border-t">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
