'use client';

/**
 * AIUsageStatus Component
 *
 * Displays the user's AI generation usage status.
 * Shows remaining generations and provides feedback on limits.
 */

import { useEffect, useState } from 'react';
import { useSecureAI, UsageStatus } from '@/hooks/useSecureAI';

interface AIUsageStatusProps {
  /** Show compact version */
  compact?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback when usage is loaded */
  onUsageLoaded?: (status: UsageStatus) => void;
}

export function AIUsageStatus({
  compact = false,
  className = '',
  onUsageLoaded,
}: AIUsageStatusProps) {
  const { checkUsage } = useSecureAI();
  const [status, setStatus] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const result = await checkUsage();
        if (result) {
          setStatus(result);
          onUsageLoaded?.(result);
        } else {
          setError('Failed to load AI status');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [checkUsage, onUsageLoaded]);

  if (loading) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {compact ? 'Loading...' : 'Checking AI availability...'}
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className={`text-sm text-red-500 ${className}`}>
        {compact ? 'AI unavailable' : error || 'AI features unavailable'}
      </div>
    );
  }

  if (!status.configured) {
    return (
      <div className={`text-sm text-amber-500 ${className}`}>
        {compact
          ? 'AI not configured'
          : 'AI features not configured. Contact administrator.'}
      </div>
    );
  }

  const { usage, isAdmin } = status;

  if (compact) {
    if (isAdmin) {
      return (
        <div className={`text-sm text-green-600 dark:text-green-400 ${className}`}>
          AI: Unlimited
        </div>
      );
    }

    const remaining =
      typeof usage.remaining === 'number' ? usage.remaining : 'unlimited';
    const colorClass =
      remaining === 0
        ? 'text-red-500'
        : remaining <= 1
        ? 'text-amber-500'
        : 'text-green-600 dark:text-green-400';

    return (
      <div className={`text-sm ${colorClass} ${className}`}>
        AI: {remaining}/{usage.limit} left
      </div>
    );
  }

  // Full display
  return (
    <div
      className={`rounded-lg border bg-card p-4 text-card-foreground ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">AI Generation Credits</h4>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'You have unlimited AI generations as an admin.'
              : `You have used ${usage.used} of ${usage.limit} AI generations.`}
          </p>
        </div>
        <div className="text-right">
          {isAdmin ? (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Unlimited
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  usage.remaining === 0
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : (usage.remaining as number) <= 1
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {usage.remaining} remaining
              </span>
            </div>
          )}
        </div>
      </div>

      {!isAdmin && usage.remaining === 0 && (
        <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <strong>Limit reached:</strong> You have used all your AI generations.
          Contact the administrator to request more.
        </div>
      )}

      {/* Usage bar for non-admins */}
      {!isAdmin && typeof usage.limit === 'number' && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full transition-all ${
                usage.remaining === 0
                  ? 'bg-red-500'
                  : (usage.remaining as number) <= 1
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AIUsageStatus;
