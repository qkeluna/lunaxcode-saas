'use client';

import { Bell } from 'lucide-react';
import { useMessagePolling } from '@/hooks/use-message-polling';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
  iconSize?: number;
  showIcon?: boolean;
  variant?: 'default' | 'compact';
}

export function NotificationBadge({
  className,
  iconSize = 20,
  showIcon = true,
  variant = 'default'
}: NotificationBadgeProps) {
  const { unreadCount, isLoading } = useMessagePolling({
    interval: 30000, // 30 seconds
    enabled: true
  });

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  if (variant === 'compact') {
    return (
      <div className={cn('relative inline-flex', className)}>
        {showIcon && (
          <Bell
            className={cn(
              'text-muted-foreground transition-colors',
              hasUnread && 'text-foreground'
            )}
            size={iconSize}
          />
        )}

        {hasUnread && (
          <span
            className={cn(
              'absolute -top-1 -right-1 flex items-center justify-center',
              'min-w-[18px] h-[18px] px-1',
              'bg-red-600 text-white text-[10px] font-bold',
              'rounded-full border-2 border-background',
              'animate-in zoom-in-50 duration-200',
              isLoading && 'opacity-70'
            )}
          >
            {displayCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      className={cn(
        'relative flex items-center gap-2 px-3 py-2',
        'rounded-lg transition-all duration-200',
        'hover:bg-accent hover:text-accent-foreground',
        hasUnread && 'bg-accent/50',
        className
      )}
      aria-label={`Notifications: ${unreadCount} unread`}
    >
      <div className="relative">
        {showIcon && (
          <Bell
            className={cn(
              'text-muted-foreground transition-colors',
              hasUnread && 'text-foreground'
            )}
            size={iconSize}
          />
        )}

        {hasUnread && (
          <>
            {/* Pulse animation ring */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>

            {/* Badge with count */}
            <span
              className={cn(
                'absolute -top-2 -right-2 flex items-center justify-center',
                'min-w-[20px] h-[20px] px-1.5',
                'bg-red-600 text-white text-xs font-bold',
                'rounded-full border-2 border-background',
                'shadow-lg',
                'animate-in zoom-in-50 duration-200',
                isLoading && 'opacity-70'
              )}
            >
              {displayCount}
            </span>
          </>
        )}
      </div>

      {variant === 'default' && (
        <span className="text-sm font-medium">
          {hasUnread ? `${unreadCount} unread` : 'No new messages'}
        </span>
      )}
    </button>
  );
}

// Icon-only variant (for mobile or compact layouts)
export function NotificationBadgeIcon({
  className,
  size = 20
}: {
  className?: string;
  size?: number;
}) {
  return (
    <NotificationBadge
      className={className}
      iconSize={size}
      showIcon={true}
      variant="compact"
    />
  );
}

// Text with badge variant (for sidebar or menu items)
export function NotificationBadgeText({
  text,
  className
}: {
  text: string;
  className?: string;
}) {
  const { unreadCount } = useMessagePolling({ interval: 30000 });
  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <span className="text-sm font-medium">{text}</span>
      {hasUnread && (
        <span
          className={cn(
            'flex items-center justify-center',
            'min-w-[24px] h-[24px] px-2',
            'bg-red-600 text-white text-xs font-bold',
            'rounded-full',
            'animate-in zoom-in-50 duration-200'
          )}
        >
          {displayCount}
        </span>
      )}
    </div>
  );
}
