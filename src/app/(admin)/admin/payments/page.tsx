'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface Payment {
  id: number;
  projectId: number;
  userId: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  referenceNumber: string;
  senderName: string;
  senderAccountNumber: string;
  proofImageUrl: string;
  status: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  createdAt: string;
  project?: {
    name: string;
    clientName: string;
  };
}

interface Stats {
  totalPending: number;
  totalVerified: number;
  totalRejected: number;
  pendingAmount: number;
  verifiedAmount: number;
}

export default function AdminPaymentsPage() {
  const { showError, showSuccess, AlertDialog } = useAlertDialog();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPending: 0,
    totalVerified: 0,
    totalRejected: 0,
    pendingAmount: 0,
    verifiedAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payments');
      
      if (!response.ok) throw new Error('Failed to fetch payments');
      
      const data = await response.json();
      setPayments(data.payments || []);
      setStats(data.stats || {
        totalPending: 0,
        totalVerified: 0,
        totalRejected: 0,
        pendingAmount: 0,
        verifiedAmount: 0,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (approve: boolean) => {
    if (!selectedPayment) return;

    if (!approve && !rejectionReason.trim()) {
      showError('Please provide a rejection reason');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch(`/api/admin/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approve ? 'verified' : 'rejected',
          adminNotes: adminNotes.trim() || null,
          rejectionReason: approve ? null : rejectionReason.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment');
      }

      showSuccess(approve ? 'Payment verified successfully!' : 'Payment rejected');
      
      // Reset modal state
      setShowVerifyModal(false);
      setSelectedPayment(null);
      setAdminNotes('');
      setRejectionReason('');
      
      // Refresh payments
      await fetchPayments();
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      showError(error.message || 'Failed to update payment');
    } finally {
      setVerifying(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    // Status filter
    if (statusFilter !== 'all' && payment.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        payment.referenceNumber.toLowerCase().includes(search) ||
        payment.senderName.toLowerCase().includes(search) ||
        payment.project?.name.toLowerCase().includes(search) ||
        payment.project?.clientName.toLowerCase().includes(search)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Clock className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground mt-1">Verify and manage client payment submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{stats.totalPending}</div>
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 dark:text-yellow-300" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₱{stats.pendingAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{stats.totalVerified}</div>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 dark:text-green-300" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₱{stats.verifiedAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{stats.totalRejected}</div>
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                ₱{(stats.verifiedAmount / 1000).toFixed(0)}K
              </div>
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 dark:text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                ₱{(stats.pendingAmount / 1000).toFixed(0)}K
              </div>
              <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400 dark:text-yellow-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by reference, name, or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Submissions</CardTitle>
          <CardDescription>
            {filteredPayments.length} payment(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {payment.project?.name || `Project #${payment.projectId}`}
                        </h3>
                        <Badge variant={
                          payment.paymentType === 'deposit' ? 'secondary' : 'default'
                        }>
                          {payment.paymentType === 'deposit' ? '50% Deposit' : '50% Completion'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Client: {payment.project?.clientName || 'Unknown'}
                      </p>
                    </div>
                    <Badge variant={
                      payment.status === 'verified' ? 'default' :
                      payment.status === 'pending' ? 'secondary' :
                      'destructive'
                    }>
                      {payment.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {payment.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {payment.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                      {payment.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <p className="font-semibold text-lg">₱{payment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <p className="font-medium capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reference:</span>
                      <p className="font-medium font-mono">{payment.referenceNumber}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sender:</span>
                      <p className="font-medium">{payment.senderName}</p>
                    </div>
                  </div>

                  {payment.proofImageUrl && (
                    <div className="mb-3">
                      <img
                        src={payment.proofImageUrl}
                        alt="Payment proof"
                        className="max-h-48 object-contain border rounded cursor-pointer"
                        onClick={() => window.open(payment.proofImageUrl, '_blank')}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span>Submitted: {new Date(payment.createdAt).toLocaleString()}</span>
                    {payment.verifiedAt && (
                      <>
                        <span>•</span>
                        <span>Verified: {new Date(payment.verifiedAt).toLocaleString()}</span>
                      </>
                    )}
                  </div>

                  {payment.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <p className="text-sm text-red-800 font-medium">Rejection Reason:</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{payment.rejectionReason}</p>
                    </div>
                  )}

                  {payment.adminNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                      <p className="text-sm text-blue-800 font-medium">Admin Notes:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 dark:text-blue-300">{payment.adminNotes}</p>
                    </div>
                  )}

                  {payment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowVerifyModal(true);
                        }}
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review Payment
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Modal */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Review the payment details and proof before approving or rejecting
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Project</Label>
                  <p className="font-medium">{selectedPayment.project?.name}</p>
                </div>
                <div>
                  <Label>Client</Label>
                  <p className="font-medium">{selectedPayment.project?.clientName}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-xl font-bold">₱{selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Payment Type</Label>
                  <p className="font-medium capitalize">{selectedPayment.paymentType}</p>
                </div>
                <div>
                  <Label>Method</Label>
                  <p className="font-medium capitalize">{selectedPayment.paymentMethod.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Reference Number</Label>
                  <p className="font-mono font-medium">{selectedPayment.referenceNumber}</p>
                </div>
                <div>
                  <Label>Sender Name</Label>
                  <p className="font-medium">{selectedPayment.senderName}</p>
                </div>
                {selectedPayment.senderAccountNumber && (
                  <div>
                    <Label>Account Number</Label>
                    <p className="font-mono font-medium">{selectedPayment.senderAccountNumber}</p>
                  </div>
                )}
              </div>

              {/* Payment Proof Image */}
              {selectedPayment.proofImageUrl && (
                <div>
                  <Label>Payment Proof</Label>
                  <img
                    src={selectedPayment.proofImageUrl}
                    alt="Payment proof"
                    className="w-full border rounded mt-2 cursor-pointer"
                    onClick={() => window.open(selectedPayment.proofImageUrl, '_blank')}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Click to view full size</p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any internal notes about this payment..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Rejection Reason (shown when needed) */}
              <div>
                <Label htmlFor="rejectionReason">
                  Rejection Reason (Required if rejecting) *
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this payment is being rejected..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowVerifyModal(false);
                setAdminNotes('');
                setRejectionReason('');
              }}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleVerifyPayment(false)}
              disabled={verifying || !rejectionReason.trim()}
            >
              {verifying ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
            <Button
              onClick={() => handleVerifyPayment(true)}
              disabled={verifying}
            >
              {verifying ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Approve Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
