'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, HelpCircle, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminFaqsPage() {
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/faqs');
      const data = await response.json();
      if (response.ok) {
        setFaqs(data.faqs);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedFaq(null);
    setFormData({ question: '', answer: '', category: '', order: 0, isActive: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      order: faq.order,
      isActive: faq.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = selectedFaq ? `/api/admin/cms/faqs/${selectedFaq.id}` : '/api/admin/cms/faqs';
      const method = selectedFaq ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchFaqs();
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleDelete = (id: number) => {
    showConfirm(
      'Are you sure you want to delete this FAQ? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/admin/cms/faqs/${id}`, { method: 'DELETE' });
          if (response.ok) {
            showSuccess('FAQ deleted!');
            fetchFaqs();
          } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete FAQ');
          }
        } catch (error) {
          console.error('Error deleting FAQ:', error);
          showError('Failed to delete FAQ');
        }
      },
      'Delete FAQ'
    );
  };

  const handleBulkDelete = () => {
    showConfirm(
      `Are you sure you want to delete ${selectedIds.length} FAQ(s)? This action cannot be undone.`,
      async () => {
        try {
          const deletePromises = selectedIds.map(id =>
            fetch(`/api/admin/cms/faqs/${id}`, { method: 'DELETE' })
          );

          const results = await Promise.all(deletePromises);
          const failedCount = results.filter(r => !r.ok).length;

          if (failedCount === 0) {
            showSuccess(`Successfully deleted ${selectedIds.length} FAQ(s)!`);
          } else {
            showError(`Failed to delete ${failedCount} FAQ(s)`);
          }

          setSelectedIds([]);
          fetchFaqs();
        } catch (error) {
          console.error('Error bulk deleting FAQs:', error);
          showError('Failed to delete FAQs');
        }
      },
      'Delete FAQs'
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === faqs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(faqs.map(f => f.id));
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
          <h1 className="text-2xl font-bold text-foreground">FAQs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage frequently asked questions</p>
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
            Add FAQ
          </Button>
        </div>
      </div>

      <div className="bg-card border shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === faqs.length && faqs.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Question</TableHead>
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
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">No FAQs found</TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(faq.id)}
                      onCheckedChange={() => toggleSelectOne(faq.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-md">{faq.question}</TableCell>
                  <TableCell>
                    {faq.category ? (
                      <Badge variant="outline">{faq.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{faq.order}</TableCell>
                  <TableCell>
                    <Badge className={faq.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}>
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(faq)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(faq.id)} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
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
