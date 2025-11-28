/**
 * Admin AI Settings API
 *
 * Allows administrators to:
 * - View configured AI providers
 * - Add/update AI provider settings (including API keys)
 * - Set generation limits for users
 * - Enable/disable providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { aiSettings, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// Supported AI providers with their default models
const SUPPORTED_PROVIDERS = {
  google: {
    name: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
    keyPrefix: 'AIza',
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
    keyPrefix: 'sk-',
  },
  anthropic: {
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-haiku-20240307',
    models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-5-sonnet-20241022'],
    keyPrefix: 'sk-ant-',
  },
  deepseek: {
    name: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-coder'],
    keyPrefix: 'sk-',
  },
  groq: {
    name: 'Groq',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    keyPrefix: 'gsk_',
  },
} as const;

// Helper to mask API key for display
function maskApiKey(key: string): string {
  if (key.length <= 12) return '****';
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

// GET: List all AI settings (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    // Check if user is admin
    const userResult = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (userResult.length === 0 || userResult[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all AI settings
    const settings = await db.select().from(aiSettings);

    // Mask API keys in response
    const maskedSettings = settings.map((s) => ({
      ...s,
      apiKey: maskApiKey(s.apiKey),
      providerInfo: SUPPORTED_PROVIDERS[s.provider as keyof typeof SUPPORTED_PROVIDERS] || null,
    }));

    return NextResponse.json({
      settings: maskedSettings,
      supportedProviders: SUPPORTED_PROVIDERS,
    });
  } catch (error: any) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI settings' },
      { status: 500 }
    );
  }
}

// POST: Create or update AI settings
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    // Check if user is admin
    const userResult = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (userResult.length === 0 || userResult[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const adminId = userResult[0].id;
    const body = await request.json();

    // Validate required fields
    const { provider, apiKey, model, maxGenerationsPerUser, isActive } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key are required' },
        { status: 400 }
      );
    }

    // Validate provider
    if (!Object.keys(SUPPORTED_PROVIDERS).includes(provider)) {
      return NextResponse.json(
        {
          error: 'Invalid provider',
          supportedProviders: Object.keys(SUPPORTED_PROVIDERS),
        },
        { status: 400 }
      );
    }

    const providerInfo = SUPPORTED_PROVIDERS[provider as keyof typeof SUPPORTED_PROVIDERS];

    // Basic API key format validation
    if (!apiKey.startsWith(providerInfo.keyPrefix)) {
      return NextResponse.json(
        {
          error: `Invalid API key format for ${providerInfo.name}. Expected key to start with "${providerInfo.keyPrefix}"`,
        },
        { status: 400 }
      );
    }

    // Validate model if provided
    const selectedModel = model || providerInfo.defaultModel;
    if (model && !providerInfo.models.includes(model)) {
      return NextResponse.json(
        {
          error: `Invalid model for ${providerInfo.name}`,
          validModels: providerInfo.models,
        },
        { status: 400 }
      );
    }

    // Check if provider already exists
    const existing = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.provider, provider))
      .limit(1);

    const now = new Date();
    const limit = maxGenerationsPerUser ?? 3;

    if (existing.length > 0) {
      // Update existing setting
      await db
        .update(aiSettings)
        .set({
          apiKey,
          model: selectedModel,
          maxGenerationsPerUser: limit,
          isActive: isActive ?? true,
          updatedAt: now,
        })
        .where(eq(aiSettings.provider, provider));

      return NextResponse.json({
        success: true,
        message: `${providerInfo.name} settings updated`,
        setting: {
          provider,
          model: selectedModel,
          apiKey: maskApiKey(apiKey),
          maxGenerationsPerUser: limit,
          isActive: isActive ?? true,
        },
      });
    } else {
      // If setting this as active, deactivate others first
      if (isActive !== false) {
        await db
          .update(aiSettings)
          .set({ isActive: false, updatedAt: now });
      }

      // Insert new setting
      await db.insert(aiSettings).values({
        provider,
        apiKey,
        model: selectedModel,
        maxGenerationsPerUser: limit,
        isActive: isActive ?? true,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      });

      return NextResponse.json({
        success: true,
        message: `${providerInfo.name} settings created`,
        setting: {
          provider,
          model: selectedModel,
          apiKey: maskApiKey(apiKey),
          maxGenerationsPerUser: limit,
          isActive: isActive ?? true,
        },
      });
    }
  } catch (error: any) {
    console.error('Error saving AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to save AI settings' },
      { status: 500 }
    );
  }
}

// DELETE: Remove AI provider settings
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    // Check if user is admin
    const userResult = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (userResult.length === 0 || userResult[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider parameter required' },
        { status: 400 }
      );
    }

    await db.delete(aiSettings).where(eq(aiSettings.provider, provider));

    return NextResponse.json({
      success: true,
      message: `${provider} settings removed`,
    });
  } catch (error: any) {
    console.error('Error deleting AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI settings' },
      { status: 500 }
    );
  }
}

// PATCH: Toggle provider active status or update limit
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    // Check if user is admin
    const userResult = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (userResult.length === 0 || userResult[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { provider, isActive, maxGenerationsPerUser } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    const updateData: any = { updatedAt: new Date() };

    if (typeof isActive === 'boolean') {
      // If activating this provider, deactivate others first
      if (isActive) {
        await db
          .update(aiSettings)
          .set({ isActive: false, updatedAt: new Date() });
      }
      updateData.isActive = isActive;
    }

    if (typeof maxGenerationsPerUser === 'number') {
      updateData.maxGenerationsPerUser = Math.max(1, maxGenerationsPerUser);
    }

    await db
      .update(aiSettings)
      .set(updateData)
      .where(eq(aiSettings.provider, provider));

    return NextResponse.json({
      success: true,
      message: `${provider} settings updated`,
    });
  } catch (error: any) {
    console.error('Error updating AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to update AI settings' },
      { status: 500 }
    );
  }
}
