'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, HelpCircle, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Question {
  id: number;
  serviceId: number;
  serviceName: string;
  questionKey: string;
  questionText: string;
  questionType: string;
  required: boolean;
  placeholder: string | null;
  sortOrder: number;
  createdAt: string;
}

export default function AdminQuestionsPage() {
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    serviceId: 0,
    questionKey: '',
    questionText: '',
    questionType: 'text',
    required: false,
    placeholder: '',
    sortOrder: 0,
  });

  useEffect(() => {
    fetchQuestions();
    fetchServices();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/questions');
      const data = await response.json();

      if (response.ok) {
        setQuestions(data.questions);
      } else {
        console.error('Failed to fetch questions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
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
    setSelectedQuestion(null);
    setFormData({
      serviceId: services[0]?.id || 0,
      questionKey: '',
      questionText: '',
      questionType: 'text',
      required: false,
      placeholder: '',
      sortOrder: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({
      serviceId: question.serviceId,
      questionKey: question.questionKey,
      questionText: question.questionText,
      questionType: question.questionType,
      required: question.required,
      placeholder: question.placeholder || '',
      sortOrder: question.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = selectedQuestion
        ? `/api/admin/cms/questions/${selectedQuestion.id}`
        : '/api/admin/cms/questions';
      const method = selectedQuestion ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess(selectedQuestion ? 'Question updated!' : 'Question created!');
        setIsDialogOpen(false);
        fetchQuestions();
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to save question');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      showError('Failed to save question');
    }
  };

  const handleDelete = (id: number) => {
    showConfirm(
      'Are you sure you want to delete this question? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/admin/cms/questions/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            showSuccess('Question deleted!');
            fetchQuestions();
          } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete question');
          }
        } catch (error) {
          console.error('Error deleting question:', error);
          showError('Failed to delete question');
        }
      },
      'Delete Question'
    );
  };

  const handleBulkDelete = () => {
    showConfirm(
      `Are you sure you want to delete ${selectedIds.length} question(s)? This action cannot be undone.`,
      async () => {
        try {
          const deletePromises = selectedIds.map(id =>
            fetch(`/api/admin/cms/questions/${id}`, { method: 'DELETE' })
          );

          const results = await Promise.all(deletePromises);
          const failedCount = results.filter(r => !r.ok).length;

          if (failedCount === 0) {
            showSuccess(`Successfully deleted ${selectedIds.length} question(s)!`);
          } else {
            showError(`Failed to delete ${failedCount} question(s)`);
          }

          setSelectedIds([]);
          fetchQuestions();
        } catch (error) {
          console.error('Error bulk deleting questions:', error);
          showError('Failed to delete questions');
        }
      },
      'Delete Questions'
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map(q => q.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getQuestionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      text: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      textarea: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      select: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      radio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      checkbox: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
      number: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    };
    return colors[type] || 'bg-muted text-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboarding Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage dynamic questions for service onboarding forms
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
            Add Question
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-card border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HelpCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Total Questions
                  </dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {questions.length}
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
                <HelpCircle className="h-6 w-6 text-red-400 dark:text-red-300" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Required</dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {questions.filter((q) => q.required).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-card border shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === questions.length && questions.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Required</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading questions...
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No questions found. Create your first question to get started.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(question.id)}
                      onCheckedChange={() => toggleSelectOne(question.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">
                    {question.questionText}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{question.serviceName}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted dark:bg-muted px-2 py-1 rounded">
                      {question.questionKey}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge className={getQuestionTypeBadge(question.questionType)}>
                      {question.questionType}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.sortOrder}</TableCell>
                  <TableCell>
                    {question.required ? (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
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
              {selectedQuestion ? 'Edit Question' : 'Add Question'}
            </DialogTitle>
            <DialogDescription>
              {selectedQuestion
                ? 'Update question information'
                : 'Create a new onboarding question'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="service">Service Type *</Label>
              <Select
                value={formData.serviceId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceId: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="questionKey">Question Key *</Label>
              <Input
                id="questionKey"
                value={formData.questionKey}
                onChange={(e) =>
                  setFormData({ ...formData, questionKey: e.target.value })
                }
                placeholder="e.g., target_audience, design_preferences"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for this question (lowercase, underscores)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="questionText">Question Text *</Label>
              <Input
                id="questionText"
                value={formData.questionText}
                onChange={(e) =>
                  setFormData({ ...formData, questionText: e.target.value })
                }
                placeholder="e.g., Who is your target audience?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="questionType">Type *</Label>
                <Select
                  value={formData.questionType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, questionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                  </SelectContent>
                </Select>
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

            <div className="grid gap-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={formData.placeholder}
                onChange={(e) =>
                  setFormData({ ...formData, placeholder: e.target.value })
                }
                placeholder="Optional placeholder text"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="required"
                checked={formData.required}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, required: checked })
                }
              />
              <Label htmlFor="required">Required field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedQuestion ? 'Save Changes' : 'Create Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
