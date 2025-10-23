'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseMessagePollingOptions {
  interval?: number; // Polling interval in ms (default: 30000 = 30 seconds)
  enabled?: boolean; // Enable/disable polling (default: true)
}

interface UnreadCountResponse {
  count: number;
  lastUpdated: string | null;
  usingDatabase: boolean;
}

const STORAGE_KEY = 'unread_message_count';
const STORAGE_TIMESTAMP_KEY = 'unread_message_count_timestamp';
const CACHE_DURATION = 30000; // 30 seconds

export function useMessagePolling(options: UseMessagePollingOptions = {}) {
  const { interval = 30000, enabled = true } = options;

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Load cached count from localStorage on mount
  useEffect(() => {
    const cachedCount = localStorage.getItem(STORAGE_KEY);
    const cachedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

    if (cachedCount && cachedTimestamp) {
      const age = Date.now() - parseInt(cachedTimestamp);
      if (age < CACHE_DURATION) {
        setUnreadCount(parseInt(cachedCount));
        setIsLoading(false);
      }
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/unread/count', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data: UnreadCountResponse = await response.json();

      if (isMountedRef.current) {
        setUnreadCount(data.count);
        setError(null);
        setIsLoading(false);

        // Cache in localStorage
        localStorage.setItem(STORAGE_KEY, data.count.toString());
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchUnreadCount();
    }
  }, [enabled, fetchUnreadCount]);

  // Setup polling interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Only poll when tab is active (visibility API)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden, stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Tab active, resume polling
        fetchUnreadCount(); // Immediate fetch on tab activation

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(fetchUnreadCount, interval);
      }
    };

    // Start polling if tab is active
    if (!document.hidden) {
      intervalRef.current = setInterval(fetchUnreadCount, interval);
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval, fetchUnreadCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Optimistic update (for when user sends a message)
  const incrementCount = useCallback(() => {
    setUnreadCount(prev => {
      const newCount = prev + 1;
      localStorage.setItem(STORAGE_KEY, newCount.toString());
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      return newCount;
    });
  }, []);

  // Optimistic update (for when user reads messages)
  const decrementCount = useCallback((amount: number = 1) => {
    setUnreadCount(prev => {
      const newCount = Math.max(0, prev - amount);
      localStorage.setItem(STORAGE_KEY, newCount.toString());
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      return newCount;
    });
  }, []);

  // Reset count to zero
  const resetCount = useCallback(() => {
    setUnreadCount(0);
    localStorage.setItem(STORAGE_KEY, '0');
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  }, []);

  return {
    unreadCount,
    isLoading,
    error,
    refresh,
    incrementCount,
    decrementCount,
    resetCount
  };
}
