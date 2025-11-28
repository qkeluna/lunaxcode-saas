/**
 * AI Usage Tracking and Limit Enforcement
 *
 * This module provides server-side utilities for:
 * - Checking user's remaining AI generation quota
 * - Logging AI usage to the database
 * - Retrieving admin-configured AI settings
 */

import { eq, sql, and, count } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { aiUsageLog, aiSettings, users } from '@/lib/db/schema';

export type GenerationType = 'prd' | 'tasks' | 'description_suggestion' | 'description_enhance';

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  message?: string;
}

export interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
  maxGenerationsPerUser: number;
}

/**
 * Get the active AI configuration from database
 * Returns the first active provider's settings
 */
export async function getActiveAIConfig(db: DrizzleD1Database): Promise<AIConfig | null> {
  try {
    const settings = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.isActive, true))
      .limit(1);

    if (settings.length === 0) {
      return null;
    }

    const setting = settings[0];
    return {
      provider: setting.provider,
      model: setting.model,
      apiKey: setting.apiKey,
      maxGenerationsPerUser: setting.maxGenerationsPerUser ?? 3,
    };
  } catch (error) {
    console.error('Error fetching AI config:', error);
    return null;
  }
}

/**
 * Check if a user can generate AI content based on their usage
 *
 * @param db - Database connection
 * @param userId - User ID to check
 * @param generationType - Type of generation (optional, for type-specific limits)
 * @returns UsageCheckResult with allowed status and remaining quota
 */
export async function checkUserUsageLimit(
  db: DrizzleD1Database,
  userId: string,
  generationType?: GenerationType
): Promise<UsageCheckResult> {
  try {
    // Get the active AI settings to know the limit
    const config = await getActiveAIConfig(db);

    if (!config) {
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        used: 0,
        message: 'AI generation is not configured. Please contact the administrator.',
      };
    }

    const limit = config.maxGenerationsPerUser;

    // Count user's total successful generations
    const usageResult = await db
      .select({ count: count() })
      .from(aiUsageLog)
      .where(
        and(
          eq(aiUsageLog.userId, userId),
          eq(aiUsageLog.status, 'success')
        )
      );

    const used = usageResult[0]?.count ?? 0;
    const remaining = Math.max(0, limit - used);

    return {
      allowed: remaining > 0,
      remaining,
      limit,
      used,
      message: remaining > 0
        ? `You have ${remaining} AI generation${remaining === 1 ? '' : 's'} remaining.`
        : 'You have reached your AI generation limit. Please contact the administrator for more.',
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      used: 0,
      message: 'Error checking usage limit. Please try again.',
    };
  }
}

/**
 * Log an AI generation attempt to the database
 *
 * @param db - Database connection
 * @param params - Log parameters
 */
export async function logAIUsage(
  db: DrizzleD1Database,
  params: {
    userId: string;
    projectId?: number | null;
    generationType: GenerationType;
    provider: string;
    model: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    status: 'success' | 'error' | 'rate_limited';
    errorMessage?: string;
  }
): Promise<void> {
  try {
    await db.insert(aiUsageLog).values({
      userId: params.userId,
      projectId: params.projectId ?? null,
      generationType: params.generationType,
      provider: params.provider,
      model: params.model,
      promptTokens: params.promptTokens ?? null,
      completionTokens: params.completionTokens ?? null,
      totalTokens: params.totalTokens ?? null,
      status: params.status,
      errorMessage: params.errorMessage ?? null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error logging AI usage:', error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

/**
 * Get user's AI usage history
 *
 * @param db - Database connection
 * @param userId - User ID
 * @param limit - Max records to return (default: 10)
 */
export async function getUserUsageHistory(
  db: DrizzleD1Database,
  userId: string,
  recordLimit: number = 10
) {
  try {
    const history = await db
      .select()
      .from(aiUsageLog)
      .where(eq(aiUsageLog.userId, userId))
      .orderBy(sql`${aiUsageLog.createdAt} DESC`)
      .limit(recordLimit);

    return history;
  } catch (error) {
    console.error('Error fetching usage history:', error);
    return [];
  }
}

/**
 * Check if user is an admin (admins have unlimited generations)
 */
export async function isUserAdmin(
  db: DrizzleD1Database,
  userId: string
): Promise<boolean> {
  try {
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user[0]?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Combined check: Returns whether user can generate and the config to use
 * Admins bypass limits
 */
export async function canUserGenerate(
  db: DrizzleD1Database,
  userId: string,
  generationType?: GenerationType
): Promise<{
  allowed: boolean;
  config: AIConfig | null;
  usage: UsageCheckResult;
  isAdmin: boolean;
}> {
  const [config, isAdmin, usage] = await Promise.all([
    getActiveAIConfig(db),
    isUserAdmin(db, userId),
    checkUserUsageLimit(db, userId, generationType),
  ]);

  // Admins bypass usage limits
  if (isAdmin) {
    return {
      allowed: config !== null,
      config,
      usage: {
        ...usage,
        allowed: true,
        message: 'Admin users have unlimited AI generations.',
      },
      isAdmin: true,
    };
  }

  return {
    allowed: usage.allowed && config !== null,
    config,
    usage,
    isAdmin: false,
  };
}
