'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Sparkles, Eye, EyeOff, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  category: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminFeaturesPage() {
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    category: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/features');
      const data = await response.json();

      if (response.ok) {
        setFeatures(data.features);
      } else {
        console.error('Failed to fetch features:', data.error);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedFeature(null);
    setFormData({
      title: '',
      description: '',
      icon: '',
      category: '',
      order: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (feature: Feature) => {
    setSelectedFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon || '',
      category: feature.category || '',
      order: feature.order,
      isActive: feature.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = selectedFeature
        ? `/api/admin/cms/features/${selectedFeature.id}`
        : '/api/admin/cms/features';
      const method = selectedFeature ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchFeatures();
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to save feature');
      }
    } catch (error) {
      console.error('Error saving feature:', error);
      showError('Failed to save feature');
    }
  };

  const handleDelete = (id: number) => {
    showConfirm(
      'Are you sure you want to delete this feature? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/admin/cms/features/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            showSuccess('Feature deleted!');
            fetchFeatures();
          } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete feature');
          }
        } catch (error) {
          console.error('Error deleting feature:', error);
          showError('Failed to delete feature');
        }
      },
      'Delete Feature'
    );
  };

  const handleBulkDelete = () => {
    showConfirm(
      `Are you sure you want to delete ${selectedIds.length} feature(s)? This action cannot be undone.`,
      async () => {
        try {
          const deletePromises = selectedIds.map(id =>
            fetch(`/api/admin/cms/features/${id}`, { method: 'DELETE' })
          );

          const results = await Promise.all(deletePromises);
          const failedCount = results.filter(r => !r.ok).length;

          if (failedCount === 0) {
            showSuccess(`Successfully deleted ${selectedIds.length} feature(s)!`);
          } else {
            showError(`Failed to delete ${failedCount} feature(s)`);
          }

          setSelectedIds([]);
          fetchFeatures();
        } catch (error) {
          console.error('Error bulk deleting features:', error);
          showError('Failed to delete features');
        }
      },
      'Delete Features'
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === features.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(features.map(f => f.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Features</h1>
          <p className="text-muted-foreground">
            Manage features displayed on the landing page
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/5 dark:to-purple-500/5 opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 p-2.5">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Features</p>
              <p className="text-2xl font-bold text-foreground">{features.length}</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/5 dark:to-green-500/5 opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 p-2.5">
              <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-foreground">
                {features.filter((f) => f.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-gray-500/10 dark:from-slate-500/5 dark:to-gray-500/5 opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 rounded-lg bg-slate-500/10 dark:bg-slate-500/20 p-2.5">
              <EyeOff className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold text-foreground">
                {features.filter((f) => !f.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Table */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === features.length && features.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Icon</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Order</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading features...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                    <span>No features found. Create your first feature to get started.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              features.map((feature) => (
                <TableRow key={feature.id} className="group transition-colors hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(feature.id)}
                      onCheckedChange={() => toggleSelectOne(feature.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{feature.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {feature.description}
                  </TableCell>
                  <TableCell>
                    {feature.icon ? (
                      <Badge variant="outline">{feature.icon}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {feature.category ? (
                      <Badge variant="outline">{feature.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{feature.order}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        feature.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-foreground'
                      }
                    >
                      {feature.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(feature)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(feature.id)}
                        className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedFeature ? 'Edit Feature' : 'Add Feature'}
            </DialogTitle>
            <DialogDescription>
              {selectedFeature
                ? 'Update feature information'
                : 'Create a new feature for the landing page'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., AI-Powered PRD Generation"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the feature"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="Sparkles, Zap, etc."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="core, technical, business"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedFeature ? 'Save Changes' : 'Create Feature'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
