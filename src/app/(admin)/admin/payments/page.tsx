'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface Payment {
  payment: {
    id: number;
    amount: number;
    paymentMethod: string;
    paymentIntentId: string;
    status: string;
    metadata: string | null;
    createdAt: string;
  };
  project: {
    id: number;
    name: string;
    clientName: string;
    clientEmail: string;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface PaymentStats {
  totalPayments: number;
  succeededPayments: number;
  processingPayments: number;
  failedPayments: number;
  totalRevenue: number;
}

const statusColors: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const paymentMethodLabels: Record<string, string> = {
  card: 'Credit/Debit Card',
  gcash: 'GCash',
  paymaya: 'PayMaya',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setPayments(data.payments);
        setStats(data.stats);
      } else {
        console.error('Failed to fetch payments:', data.error);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsDialogOpen(true);
  };

  const handleConfirmPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsConfirmDialogOpen(true);
  };

  const handleUpdatePaymentStatus = async (status: string) => {
    if (!selectedPayment) return;

    try {
      const response = await fetch(`/api/admin/payments/${selectedPayment.payment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setIsConfirmDialogOpen(false);
        fetchPayments();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor all payments and manage payment confirmations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Payments</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.totalPayments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Succeeded</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.succeededPayments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.processingPayments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.failedPayments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((item) => (
                <TableRow key={item.payment.id}>
                  <TableCell className="font-mono text-sm">
                    #{item.payment.id}
                  </TableCell>
                  <TableCell>
                    {item.project ? (
                      <span className="font-medium">{item.project.name}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.project ? (
                      <div>
                        <div className="font-medium text-sm">{item.project.clientName}</div>
                        <div className="text-xs text-gray-500">{item.project.clientEmail}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(item.payment.amount)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {paymentMethodLabels[item.payment.paymentMethod] || item.payment.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[item.payment.status] || 'bg-gray-100 text-gray-800'}>
                      {item.payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(item.payment.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.payment.status === 'processing' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfirmPayment(item)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Confirm
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View complete payment information
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment ID</p>
                  <p className="text-base font-mono">#{selectedPayment.payment.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={statusColors[selectedPayment.payment.status]}>
                    {selectedPayment.payment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-base font-semibold">{formatCurrency(selectedPayment.payment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-base">
                    {paymentMethodLabels[selectedPayment.payment.paymentMethod] || selectedPayment.payment.paymentMethod}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Project</p>
                  <p className="text-base">
                    {selectedPayment.project?.name || 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Client</p>
                  <p className="text-base">
                    {selectedPayment.project?.clientName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedPayment.project?.clientEmail || ''}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Payment Intent ID</p>
                  <p className="text-sm font-mono break-all">{selectedPayment.payment.paymentIntentId}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base">{formatDate(selectedPayment.payment.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Payment Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Update payment status to succeeded or failed
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Amount: <span className="font-bold">{formatCurrency(selectedPayment.payment.amount)}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Project: {selectedPayment.project?.name}
                </p>
                <p className="text-sm text-gray-500">
                  Client: {selectedPayment.project?.clientName}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleUpdatePaymentStatus('succeeded')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Succeeded
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleUpdatePaymentStatus('failed')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Failed
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
