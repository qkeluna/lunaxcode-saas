'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Smartphone,
  Building,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: number;
  name: string;
  price: number;
  status: string;
  paymentStatus: string;
}

interface PaymentAccount {
  id: number;
  accountType: string;
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  instructions: string | null;
  qrCodeUrl: string | null;
}

interface Payment {
  id: number;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  status: string;
  referenceNumber: string;
  proofImageUrl: string;
  rejectionReason: string | null;
  createdAt: string;
}

const paymentMethodIcons = {
  gcash: Smartphone,
  seabank: Building,
  paymaya: Smartphone,
  bank_transfer: Banknote,
};

export default function ProjectPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedPaymentType, setSelectedPaymentType] = useState<'deposit' | 'completion'>('deposit');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, accountsRes, paymentsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch('/api/payment-accounts'),
        fetch(`/api/payments?projectId=${projectId}`)
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
        
        // Calculate amount based on payment type
        const depositAmount = Math.round(projectData.price * 0.5);
        setAmount(depositAmount);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setPaymentAccounts(accountsData.accounts || []);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Convert to base64 for now (can switch to R2 upload later)
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
        setUploadingImage(false);
      };
      reader.onerror = () => {
        alert('Failed to read image');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!referenceNumber.trim()) {
      alert('Please enter the transaction reference number');
      return;
    }

    if (!senderName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!proofImage) {
      alert('Please upload proof of payment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(projectId),
          amount,
          paymentType: selectedPaymentType,
          paymentMethod: selectedMethod,
          referenceNumber,
          senderName,
          senderAccountNumber: senderAccount,
          proofImageUrl: proofImage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit payment');
      }

      alert('Payment proof submitted successfully! We will verify it within 24 hours.');
      
      // Reset form
      setReferenceNumber('');
      setSenderName('');
      setSenderAccount('');
      setProofImage(null);
      
      // Refresh data
      await fetchData();
      
    } catch (error: any) {
      console.error('Error submitting payment:', error);
      alert(error.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Project not found</p>
      </div>
    );
  }

  const depositPayment = payments.find(p => p.paymentType === 'deposit');
  const completionPayment = payments.find(p => p.paymentType === 'completion');
  const depositAmount = Math.round(project.price * 0.5);
  const completionAmount = project.price - depositAmount;

  const canSubmitDeposit = !depositPayment || depositPayment.status === 'rejected';
  const canSubmitCompletion = depositPayment?.status === 'verified' && (!completionPayment || completionPayment.status === 'rejected');

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/projects/${projectId}`)}
          className="mb-4"
        >
          ← Back to Project
        </Button>
        <h1 className="text-3xl font-bold">Payment for {project.name}</h1>
        <p className="text-gray-600 mt-2">Total Project Cost: ₱{project.price.toLocaleString()}</p>
      </div>

      {/* Payment Structure Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Payment Structure
          </CardTitle>
          <CardDescription>
            We use a 50-50 payment structure to protect both parties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Deposit Payment */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">50% Deposit</h3>
                  <p className="text-2xl font-bold text-blue-600">₱{depositAmount.toLocaleString()}</p>
                </div>
                {depositPayment && (
                  <Badge variant={
                    depositPayment.status === 'verified' ? 'default' :
                    depositPayment.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {depositPayment.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {depositPayment.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {depositPayment.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {depositPayment.status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Required before project work begins
              </p>
              {depositPayment && depositPayment.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                  <p className="text-sm text-red-800 font-medium">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{depositPayment.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Completion Payment */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">50% Completion</h3>
                  <p className="text-2xl font-bold text-green-600">₱{completionAmount.toLocaleString()}</p>
                </div>
                {completionPayment && (
                  <Badge variant={
                    completionPayment.status === 'verified' ? 'default' :
                    completionPayment.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {completionPayment.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {completionPayment.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {completionPayment.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {completionPayment.status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Required upon project completion and your approval
              </p>
              {completionPayment && completionPayment.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                  <p className="text-sm text-red-800 font-medium">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{completionPayment.rejectionReason}</p>
                </div>
              )}
              {!canSubmitCompletion && !completionPayment && (
                <Badge variant="secondary">Deposit must be verified first</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Submission Form */}
      {(canSubmitDeposit || canSubmitCompletion) && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Payment Proof</CardTitle>
            <CardDescription>
              Upload your payment receipt/proof for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Type Selection */}
            <div>
              <Label>Payment Type</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {canSubmitDeposit && (
                  <button
                    onClick={() => {
                      setSelectedPaymentType('deposit');
                      setAmount(depositAmount);
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedPaymentType === 'deposit'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">50% Deposit</div>
                    <div className="text-2xl font-bold text-blue-600">
                      ₱{depositAmount.toLocaleString()}
                    </div>
                  </button>
                )}
                {canSubmitCompletion && (
                  <button
                    onClick={() => {
                      setSelectedPaymentType('completion');
                      setAmount(completionAmount);
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedPaymentType === 'completion'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">50% Completion</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₱{completionAmount.toLocaleString()}
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <Label>Select Payment Method</Label>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                {paymentAccounts.map((account) => {
                  const Icon = paymentMethodIcons[account.accountType as keyof typeof paymentMethodIcons] || CreditCard;
                  return (
                    <button
                      key={account.id}
                      onClick={() => setSelectedMethod(account.accountType)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedMethod === account.accountType
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-gray-600 mt-1" />
                        <div className="flex-1">
                          <div className="font-semibold capitalize">
                            {account.accountType.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {account.accountName}
                          </div>
                          <div className="font-mono text-sm mt-1">
                            {account.accountNumber}
                          </div>
                          {account.bankName && (
                            <div className="text-xs text-gray-500 mt-1">
                              {account.bankName}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedMethod && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {paymentAccounts.find(a => a.accountType === selectedMethod)?.instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Transaction Details */}
            {selectedMethod && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="referenceNumber">Transaction Reference Number *</Label>
                    <Input
                      id="referenceNumber"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="e.g., TXN1234567890"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderName">Your Name *</Label>
                    <Input
                      id="senderName"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Name on account"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="senderAccount">Account Number / Mobile Number (Optional)</Label>
                  <Input
                    id="senderAccount"
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    placeholder="Last 4 digits or partial number"
                    className="mt-1"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <Label htmlFor="proofImage">Upload Proof of Payment *</Label>
                  <div className="mt-2">
                    {!proofImage ? (
                      <label
                        htmlFor="proofImage"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="text-center">
                          {uploadingImage ? (
                            <Clock className="w-12 h-12 mx-auto mb-2 animate-spin text-gray-400" />
                          ) : (
                            <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          )}
                          <p className="text-sm text-gray-600">
                            {uploadingImage ? 'Uploading...' : 'Click to upload payment receipt'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          id="proofImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={proofImage}
                          alt="Payment proof"
                          className="w-full max-h-96 object-contain border rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setProofImage(null)}
                          className="absolute top-2 right-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitPayment}
                  disabled={submitting || !proofImage || !referenceNumber || !senderName}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Payment Proof
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">
                        {payment.paymentType === 'deposit' ? '50% Deposit' : '50% Completion'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <Badge variant={
                      payment.status === 'verified' ? 'default' :
                      payment.status === 'pending' ? 'secondary' :
                      'destructive'
                    }>
                      {payment.status}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    ₱{payment.amount.toLocaleString()}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Method:</span>{' '}
                      <span className="font-medium capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Reference:</span>{' '}
                      <span className="font-medium">{payment.referenceNumber}</span>
                    </div>
                  </div>
                  {payment.proofImageUrl && (
                    <div className="mt-3">
                      <img
                        src={payment.proofImageUrl}
                        alt="Payment proof"
                        className="max-h-48 object-contain border rounded cursor-pointer"
                        onClick={() => window.open(payment.proofImageUrl, '_blank')}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

