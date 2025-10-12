'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  client: string;
  category: string;
  imageUrl: string | null;
  liveUrl: string | null;
  technologies: string | null;
  results: string | null;
  testimonial: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    category: '',
    imageUrl: '',
    liveUrl: '',
    technologies: '',
    results: '',
    testimonial: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/portfolio');
      const data = await response.json();
      if (response.ok) setPortfolio(data.portfolio);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelected(null);
    setFormData({ title: '', description: '', client: '', category: '', imageUrl: '', liveUrl: '', technologies: '', results: '', testimonial: '', order: 0, isActive: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: PortfolioItem) => {
    setSelected(item);
    const tech = item.technologies ? JSON.parse(item.technologies).join(', ') : '';
    const res = item.results ? JSON.parse(item.results).join(', ') : '';
    setFormData({
      title: item.title,
      description: item.description,
      client: item.client,
      category: item.category,
      imageUrl: item.imageUrl || '',
      liveUrl: item.liveUrl || '',
      technologies: tech,
      results: res,
      testimonial: item.testimonial || '',
      order: item.order,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const techArray = formData.technologies.split(',').map(t => t.trim()).filter(t => t);
      const resArray = formData.results.split(',').map(r => r.trim()).filter(r => r);

      const url = selected ? `/api/admin/cms/portfolio/${selected.id}` : '/api/admin/cms/portfolio';
      const method = selected ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, technologies: techArray, results: resArray }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchPortfolio();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return;

    try {
      const response = await fetch(`/api/admin/cms/portfolio/${id}`, { method: 'DELETE' });
      if (response.ok) fetchPortfolio();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="mt-1 text-sm text-gray-500">Manage case studies and project showcase</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Portfolio Item
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Category</TableHead>
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
            ) : portfolio.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">No portfolio items found</TableCell>
              </TableRow>
            ) : (
              portfolio.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.client}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>{item.order}</TableCell>
                  <TableCell>
                    <Badge className={item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600">
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Client *</Label>
                <Input value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category *</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., web-app" />
              </div>
              <div className="grid gap-2">
                <Label>Order</Label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Image URL</Label>
                <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Live URL</Label>
                <Input value={formData.liveUrl} onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Technologies (comma-separated)</Label>
              <Input value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div className="grid gap-2">
              <Label>Results (comma-separated)</Label>
              <Input value={formData.results} onChange={(e) => setFormData({ ...formData, results: e.target.value })} placeholder="50% faster, 2x users" />
            </div>
            <div className="grid gap-2">
              <Label>Testimonial</Label>
              <Textarea value={formData.testimonial} onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })} rows={2} />
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
    </div>
  );
}
