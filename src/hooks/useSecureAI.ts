'use client';

/**
 * useSecureAI Hook
 *
 * React hook for using AI features with server-side API keys and usage limits.
 * This hook provides:
 * - Automatic usage tracking and limit checking
 * - Easy-to-use generation functions
 * - Loading and error states
 *
 * Usage:
 * ```tsx
 * const { generate, checkUsage, usage, isLoading, error } = useSecureAI();
 *
 * // Check remaining usage
 * const status = await checkUsage();
 *
 * // Generate content
 * const result = await generate('description_suggestion', {
 *   serviceType: 'Landing Page'
 * });
 * ```
 */

import { useState, useCallback } from 'react';

export type GenerationType =
  | 'prd'
  | 'tasks'
  | 'description_suggestion'
  | 'description_enhance';

export interface UsageInfo {
  used: number;
  limit: number | 'unlimited';
  remaining: number | 'unlimited';
  allowed?: boolean;
}

export interface GenerateResult {
  success: boolean;
  result?: string;
  usage?: UsageInfo;
  isAdmin?: boolean;
  error?: string;
  code?: string;
}

export interface UsageStatus {
  configured: boolean;
  isAdmin: boolean;
  usage: UsageInfo;
}

interface GenerateData {
  // For PRD generation
  serviceName?: string;
  description?: string;
  questionAnswers?: Record<string, any>;
  // For task generation
  prd?: string;
  // For description suggestions
  serviceType?: string;
  currentDescription?: string;
}

export function useSecureAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  /**
   * Check the current AI usage status
   */
  const checkUsage = useCallback(async (): Promise<UsageStatus | null> => {
    try {
      const response = await fetch('/api/ai/secure-generate', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to check usage');
      }

      const data: UsageStatus = await response.json();
      setUsage(data.usage);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Generate AI content
   *
   * @param type - Type of generation ('prd' | 'tasks' | 'description_suggestion' | 'description_enhance')
   * @param data - Generation-specific data
   * @param projectId - Optional project ID to associate with this generation
   */
  const generate = useCallback(
    async (
      type: GenerationType,
      data: GenerateData,
      projectId?: number
    ): Promise<GenerateResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/secure-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            type,
            data,
            projectId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Update usage info even on error (e.g., limit reached)
          if (result.usage) {
            setUsage(result.usage);
          }
          throw new Error(result.error || 'Generation failed');
        }

        // Update usage after successful generation
        if (result.usage) {
          setUsage(result.usage);
        }

        return {
          success: true,
          result: result.result,
          usage: result.usage,
          isAdmin: result.isAdmin,
        };
      } catch (err: any) {
        setError(err.message);
        return {
          success: false,
          error: err.message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Generate PRD from project details
   */
  const generatePRD = useCallback(
    async (
      serviceName: string,
      description: string,
      questionAnswers?: Record<string, any>,
      projectId?: number
    ) => {
      return generate(
        'prd',
        { serviceName, description, questionAnswers },
        projectId
      );
    },
    [generate]
  );

  /**
   * Generate tasks from PRD
   */
  const generateTasks = useCallback(
    async (prd: string, projectId?: number) => {
      return generate('tasks', { prd }, projectId);
    },
    [generate]
  );

  /**
   * Generate description suggestions
   */
  const suggestDescriptions = useCallback(
    async (serviceType: string, currentDescription?: string) => {
      return generate('description_suggestion', {
        serviceType,
        currentDescription,
      });
    },
    [generate]
  );

  /**
   * Enhance an existing description
   */
  const enhanceDescription = useCallback(
    async (currentDescription: string, serviceType?: string) => {
      return generate('description_enhance', {
        currentDescription,
        serviceType,
      });
    },
    [generate]
  );

  return {
    // Core functions
    generate,
    checkUsage,

    // Convenience functions
    generatePRD,
    generateTasks,
    suggestDescriptions,
    enhanceDescription,

    // State
    isLoading,
    error,
    usage,

    // Helpers
    hasRemainingUsage: usage ? (usage.remaining === 'unlimited' || usage.remaining > 0) : null,
    isAdmin: usage?.limit === 'unlimited',
  };
}

export default useSecureAI;
