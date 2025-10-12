'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, DollarSign, CheckCircle, Clock, CreditCard } from 'lucide-react';

interface PaymentReminderProps {
  projectId: number;
  paymentStatus: string;
  totalAmount: number;
  depositAmount: number;
  timeline: number;
  startDate: number;
}

export default function PaymentReminder({
  projectId,
  paymentStatus,
  totalAmount,
  depositAmount,
  timeline,
  startDate,
}: PaymentReminderProps) {
  const [dismissed, setDismissed] = useState(false);

  // Calculate payment details
  const balance = totalAmount - depositAmount;
  const percentPaid = totalAmount > 0 ? Math.round((depositAmount / totalAmount) * 100) : 0;

  // Calculate days elapsed and remaining
  const now = new Date();
  const start = new Date(startDate > 10000000000 ? startDate : startDate * 1000);
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, timeline - daysElapsed);

  // Don't show if payment is complete or user dismissed
  if (paymentStatus === 'paid' || dismissed) {
    return null;
  }

  // Determine urgency level
  const isUrgent = paymentStatus === 'pending' || (daysRemaining < 7 && balance > 0);
  const isOverdue = daysRemaining === 0 && balance > 0;

  return (
    <div
      className={`rounded-lg border-l-4 p-6 ${
        isOverdue
          ? 'bg-red-50 border-red-500'
          : isUrgent
          ? 'bg-yellow-50 border-yellow-500'
          : 'bg-blue-50 border-blue-500'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {isOverdue ? (
            <AlertCircle className="w-8 h-8 text-red-600" />
          ) : isUrgent ? (
            <Clock className="w-8 h-8 text-yellow-600" />
          ) : (
            <DollarSign className="w-8 h-8 text-blue-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-semibold mb-2 ${
              isOverdue
                ? 'text-red-900'
                : isUrgent
                ? 'text-yellow-900'
                : 'text-blue-900'
            }`}
          >
            {isOverdue
              ? 'Payment Overdue'
              : paymentStatus === 'pending'
              ? 'Payment Required'
              : 'Payment Reminder'}
          </h3>

          <div className="space-y-3">
            {/* Payment status message */}
            <p
              className={`text-sm ${
                isOverdue
                  ? 'text-red-800'
                  : isUrgent
                  ? 'text-yellow-800'
                  : 'text-blue-800'
              }`}
            >
              {paymentStatus === 'pending' ? (
                <>
                  No payment has been received yet. A deposit of{' '}
                  <span className="font-semibold">
                    ₱{(totalAmount * 0.5).toLocaleString()}
                  </span>{' '}
                  (50%) is required to start the project.
                </>
              ) : paymentStatus === 'partially-paid' ? (
                <>
                  Partial payment received. Remaining balance:{' '}
                  <span className="font-semibold">₱{balance.toLocaleString()}</span>
                  {isOverdue && ' - Payment is now overdue!'}
                </>
              ) : null}
            </p>

            {/* Payment breakdown */}
            <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-300">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Project Cost</p>
                <p className="text-lg font-bold text-gray-900">
                  ₱{totalAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Amount Paid</p>
                <p className="text-lg font-bold text-green-700">
                  ₱{depositAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Balance Due</p>
                <p className="text-lg font-bold text-red-700">
                  ₱{balance.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Payment Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {percentPaid}%
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline info */}
            {daysRemaining > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4" />
                <span>
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining until project
                  deadline
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href={`/projects/${projectId}/payment`}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isOverdue
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Make Payment
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
