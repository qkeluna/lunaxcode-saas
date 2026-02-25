'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, Eye, EyeOff, Trash } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface ServiceType {
  id: number;
  name: string;
}

interface AddOn {
  id: number;
  serviceTypeId: number | null;
  serviceName: string | null;
  name: string;
  description: string;
  category: string;
  price: number;
  isFree: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AdminAddOnsPage() {
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    serviceTypeId: null as number | null,
    name: '',
    description: '',
    category: 'analytics',
    price: 0,
    isFree: false,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchAddOns();
    fetchServices();
  }, []);

  const fetchAddOns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/add-ons');
      const data = await response.json();

      if (response.ok) {
        setAddOns(data.addOns);
      } else {
        console.error('Failed to fetch add-ons:', data.error);
      }
    } catch (error) {
      console.error('Error fetching add-ons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/cms/services');
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleCreate = () => {
    setSelectedAddOn(null);
    setFormData({
      serviceTypeId: null,
      name: '',
      description: '',
      category: 'analytics',
      price: 0,
      isFree: false,
      isActive: true,
      sortOrder: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (addOn: AddOn) => {
    setSelectedAddOn(addOn);
    setFormData({
      serviceTypeId: addOn.serviceTypeId,
      name: addOn.name,
      description: addOn.description,
      category: addOn.category,
      price: addOn.price,
      isFree: addOn.isFree,
      isActive: addOn.isActive,
      sortOrder: addOn.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = selectedAddOn
        ? `/api/admin/cms/add-ons/${selectedAddOn.id}`
        : '/api/admin/cms/add-ons';
      const method = selectedAddOn ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess(selectedAddOn ? 'Add-on updated!' : 'Add-on created!');
        setIsDialogOpen(false);
        fetchAddOns();
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to save add-on');
      }
    } catch (error) {
      console.error('Error saving add-on:', error);
      showError('Failed to save add-on');
    }
  };

  const handleDelete = (id: number) => {
    showConfirm(
      'Are you sure you want to delete this add-on? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/admin/cms/add-ons/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            showSuccess('Add-on deleted!');
            fetchAddOns();
          } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete add-on');
          }
        } catch (error) {
          console.error('Error deleting add-on:', error);
          showError('Failed to delete add-on');
        }
      },
      'Delete Add-on'
    );
  };

  const handleBulkDelete = () => {
    showConfirm(
      `Are you sure you want to delete ${selectedIds.length} add-on(s)? This action cannot be undone.`,
      async () => {
        try {
          const deletePromises = selectedIds.map(id =>
            fetch(`/api/admin/cms/add-ons/${id}`, { method: 'DELETE' })
          );

          const results = await Promise.all(deletePromises);
          const failedCount = results.filter(r => !r.ok).length;

          if (failedCount === 0) {
            showSuccess(`Successfully deleted ${selectedIds.length} add-on(s)!`);
          } else {
            showError(`Failed to delete ${failedCount} add-on(s)`);
          }

          setSelectedIds([]);
          fetchAddOns();
        } catch (error) {
          console.error('Error bulk deleting add-ons:', error);
          showError('Failed to delete add-ons');
        }
      },
      'Delete Add-ons'
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === addOns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(addOns.map(a => a.id));
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      analytics: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      marketing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      communication: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      social: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
      other: 'bg-muted text-foreground',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Add-ons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage optional services and integrations that can be added to projects
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
            Add Add-on
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-card border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Total Add-ons
                  </dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {addOns.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-green-400 dark:text-green-300" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Active</dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {addOns.filter((a) => a.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-yellow-400 dark:text-yellow-300" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Paid</dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {addOns.filter((a) => !a.isFree).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeOff className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Free</dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {addOns.filter((a) => a.isFree).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add-ons Table */}
      <div className="bg-card border shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === addOns.length && addOns.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading add-ons...
                </TableCell>
              </TableRow>
            ) : addOns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No add-ons found. Create your first add-on to get started.
                </TableCell>
              </TableRow>
            ) : (
              addOns.map((addOn) => (
                <TableRow key={addOn.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(addOn.id)}
                      onCheckedChange={() => toggleSelectOne(addOn.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{addOn.name}</p>
                      <p className="text-sm text-muted-foreground max-w-xs truncate">
                        {addOn.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {addOn.serviceName ? (
                      <Badge variant="outline">{addOn.serviceName}</Badge>
                    ) : (
                      <Badge variant="outline">All Services</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(addOn.category)}>
                      {addOn.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {addOn.isFree ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Free
                      </Badge>
                    ) : (
                      <span className="font-semibold">{formatCurrency(addOn.price)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        addOn.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-muted text-foreground'
                      }
                    >
                      {addOn.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(addOn)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(addOn.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50"
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
              {selectedAddOn ? 'Edit Add-on' : 'Add New Add-on'}
            </DialogTitle>
            <DialogDescription>
              {selectedAddOn
                ? 'Update add-on information'
                : 'Create a new service add-on'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Google Analytics Integration"
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
                placeholder="Brief description of the add-on"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service">Service Type</Label>
                <Select
                  value={formData.serviceTypeId?.toString() || 'all'}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      serviceTypeId: value === 'all' ? null : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (PHP)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseInt(e.target.value) })
                  }
                  placeholder="0"
                  disabled={formData.isFree}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Display Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFree: checked, price: checked ? 0 : formData.price })
                  }
                />
                <Label htmlFor="isFree">Free add-on</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedAddOn ? 'Save Changes' : 'Create Add-on'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
