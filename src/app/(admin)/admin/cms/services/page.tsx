'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Eye, EyeOff, Trash } from 'lucide-react';
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

interface Service {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  features: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminServicesPage() {
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    features: '',
    isActive: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/services');
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
      } else {
        console.error('Failed to fetch services:', data.error);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      features: '',
      isActive: true,
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    const featuresArray = service.features ? JSON.parse(service.features) : [];
    setFormData({
      name: service.name,
      description: service.description || '',
      basePrice: service.basePrice,
      features: featuresArray.join('\n'),
      isActive: service.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = async () => {
    try {
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const response = await fetch('/api/admin/cms/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: featuresArray,
        }),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        fetchServices();
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      showError('Failed to create service');
    }
  };

  const handleUpdate = async () => {
    if (!selectedService) return;

    try {
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const response = await fetch(`/api/admin/cms/services/${selectedService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: featuresArray,
        }),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        fetchServices();
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to update service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      showError('Failed to update service');
    }
  };

  const handleDelete = (serviceId: number) => {
    showConfirm(
      'Are you sure you want to delete this service? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/admin/cms/services/${serviceId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            showSuccess('Service deleted!');
            fetchServices();
          } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete service');
          }
        } catch (error) {
          console.error('Error deleting service:', error);
          showError('Failed to delete service');
        }
      },
      'Delete Service'
    );
  };

  const handleBulkDelete = () => {
    showConfirm(
      `Are you sure you want to delete ${selectedIds.length} service(s)? This action cannot be undone.`,
      async () => {
        try {
          const deletePromises = selectedIds.map(id =>
            fetch(`/api/admin/cms/services/${id}`, { method: 'DELETE' })
          );

          const results = await Promise.all(deletePromises);
          const failedCount = results.filter(r => !r.ok).length;

          if (failedCount === 0) {
            showSuccess(`Successfully deleted ${selectedIds.length} service(s)!`);
          } else {
            showError(`Failed to delete ${failedCount} service(s)`);
          }

          setSelectedIds([]);
          fetchServices();
        } catch (error) {
          console.error('Error bulk deleting services:', error);
          showError('Failed to delete services');
        }
      },
      'Delete Services'
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === services.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(services.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Service Types</h1>
          <p className="text-muted-foreground">
            Manage service offerings and pricing plans
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/5 dark:to-cyan-500/5 opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 p-2.5">
              <DollarSign className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Services</p>
              <p className="text-2xl font-bold text-foreground">{services.length}</p>
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
                {services.filter(s => s.isActive).length}
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
                {services.filter(s => !s.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === services.length && services.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold">Service Name</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Base Price</TableHead>
              <TableHead className="font-semibold">Features</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading services...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="h-8 w-8 text-muted-foreground/50" />
                    <span>No services found. Create your first service to get started.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => {
                const features = service.features ? JSON.parse(service.features) : [];
                return (
                  <TableRow key={service.id} className="group transition-colors hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(service.id)}
                        onCheckedChange={() => toggleSelectOne(service.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {service.description || 'No description'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(service.basePrice)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{features.length} features</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={service.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-muted text-foreground'}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(service)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service type with pricing and features
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Web Development"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Brief description of the service"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="basePrice" className="text-right">
                Base Price (PHP) *
              </Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                className="col-span-3"
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="features" className="text-right">
                Features
              </Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="col-span-3"
                placeholder="One feature per line"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service information, pricing, and features
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-basePrice" className="text-right">
                Base Price (PHP) *
              </Label>
              <Input
                id="edit-basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-features" className="text-right">
                Features
              </Label>
              <Textarea
                id="edit-features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="col-span-3"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isActive" className="text-right">
                Active
              </Label>
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
