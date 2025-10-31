'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface PaymentAccount {
  id: number;
  accountType: string;
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  instructions: string | null;
  qrCodeUrl: string | null;
  isActive: boolean;
  order: number;
}

export default function PaymentAccountsPage() {
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    accountType: 'gcash',
    accountName: '',
    accountNumber: '',
    bankName: '',
    instructions: '',
    qrCodeUrl: '',
    isActive: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payment-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingAccount
        ? `/api/admin/payment-accounts/${editingAccount.id}`
        : '/api/admin/payment-accounts';
      
      const method = editingAccount ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save account');

      showSuccess(editingAccount ? 'Account updated!' : 'Account created!');
      setShowDialog(false);
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      showError('Failed to save account');
    }
  };

  const handleDelete = (id: number) => {
    showConfirm(
      'Are you sure you want to delete this payment account? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/admin/payment-accounts/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete account');

          showSuccess('Account deleted!');
          fetchAccounts();
        } catch (error) {
          console.error('Error deleting account:', error);
          showError('Failed to delete account');
        }
      },
      'Delete Payment Account'
    );
  };

  const handleEdit = (account: PaymentAccount) => {
    setEditingAccount(account);
    setFormData({
      accountType: account.accountType,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName || '',
      instructions: account.instructions || '',
      qrCodeUrl: account.qrCodeUrl || '',
      isActive: account.isActive,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      accountType: 'gcash',
      accountName: '',
      accountNumber: '',
      bankName: '',
      instructions: '',
      qrCodeUrl: '',
      isActive: true,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Accounts</h1>
          <p className="text-gray-600 mt-1">
            Manage your bank accounts and e-wallet details for receiving payments
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Accounts List */}
      <div className="grid gap-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="capitalize">
                    {account.accountType.replace('_', ' ')}
                  </CardTitle>
                  <CardDescription>{account.accountName}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={account.isActive} disabled />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(account)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(account.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Account Number:</span>{' '}
                  <span className="font-mono font-medium">{account.accountNumber}</span>
                </div>
                {account.bankName && (
                  <div>
                    <span className="text-gray-600">Bank:</span>{' '}
                    <span className="font-medium">{account.bankName}</span>
                  </div>
                )}
                {account.instructions && (
                  <div>
                    <span className="text-gray-600">Instructions:</span>
                    <p className="text-gray-700 mt-1">{account.instructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Edit Payment Account' : 'Add Payment Account'}
            </DialogTitle>
            <DialogDescription>
              Configure the bank account or e-wallet details for receiving payments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Account Type</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) => setFormData({ ...formData, accountType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="seabank">SeaBank</SelectItem>
                  <SelectItem value="paymaya">PayMaya</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Account Name</Label>
              <Input
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="e.g., Lunaxcode"
              />
            </div>

            <div>
              <Label>
                {formData.accountType === 'bank_transfer' ? 'Account Number' : 'Mobile Number'}
              </Label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder={formData.accountType === 'bank_transfer' ? '1234-5678-9012' : '09XX XXX XXXX'}
              />
            </div>

            {formData.accountType === 'bank_transfer' && (
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g., BDO, BPI, Metrobank"
                />
              </div>
            )}

            <div>
              <Label>Instructions</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Special instructions for clients when using this payment method..."
                rows={3}
              />
            </div>

            <div>
              <Label>QR Code URL (Optional)</Label>
              <Input
                value={formData.qrCodeUrl}
                onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active (shown to clients)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {editingAccount ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}

