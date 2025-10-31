'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminProcessPage() {
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selected, setSelected] = useState<ProcessStep | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/process');
      const data = await response.json();
      if (response.ok) setSteps(data.steps);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelected(null);
    setFormData({ title: '', description: '', icon: '', order: 0, isActive: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (step: ProcessStep) => {
    setSelected(step);
    setFormData({
      title: step.title,
      description: step.description,
      icon: step.icon || '',
      order: step.order,
      isActive: step.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = selected ? `/api/admin/cms/process/${selected.id}` : '/api/admin/cms/process';
      const method = selected ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchSteps();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = (id: number) => {
    showConfirm(
      'Are you sure you want to delete this process step? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/admin/cms/process/${id}`, { method: 'DELETE' });
          if (response.ok) {
            showSuccess('Process step deleted!');
            fetchSteps();
          } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete process step');
          }
        } catch (error) {
          console.error('Error:', error);
          showError('Failed to delete process step');
        }
      },
      'Delete Process Step'
    );
  };

  const handleBulkDelete = () => {
    showConfirm(
      `Are you sure you want to delete ${selectedIds.length} process step(s)? This action cannot be undone.`,
      async () => {
        try {
          const deletePromises = selectedIds.map(id =>
            fetch(`/api/admin/cms/process/${id}`, { method: 'DELETE' })
          );

          const results = await Promise.all(deletePromises);
          const failedCount = results.filter(r => !r.ok).length;

          if (failedCount === 0) {
            showSuccess(`Successfully deleted ${selectedIds.length} process step(s)!`);
          } else {
            showError(`Failed to delete ${failedCount} process step(s)`);
          }

          setSelectedIds([]);
          fetchSteps();
        } catch (error) {
          console.error('Error bulk deleting process steps:', error);
          showError('Failed to delete process steps');
        }
      },
      'Delete Process Steps'
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === steps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(steps.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Process Steps</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage how you work process steps</p>
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
            Add Step
          </Button>
        </div>
      </div>

      <div className="bg-card border shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === steps.length && steps.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : steps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">No process steps found</TableCell>
              </TableRow>
            ) : (
              steps.map((step) => (
                <TableRow key={step.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(step.id)}
                      onCheckedChange={() => toggleSelectOne(step.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{step.title}</TableCell>
                  <TableCell>
                    {step.icon ? (
                      <span className="text-2xl">{step.icon}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{step.order}</TableCell>
                  <TableCell>
                    <Badge className={step.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-foreground'}>
                      {step.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(step)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(step.id)} className="text-red-600 dark:text-red-400">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selected ? 'Edit Process Step' : 'Add Process Step'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Icon (emoji)</Label>
                <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="📝" />
              </div>
              <div className="grid gap-2">
                <Label>Order</Label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
