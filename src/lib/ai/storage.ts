/**
 * AI Configuration Storage Utilities
 *
 * Handles localStorage operations for multi-provider AI configuration
 * with automatic migration from legacy single-provider format
 */

import type { AIConfig, ClientProviderConfig } from './types';
import { getProvider } from './config';

const STORAGE_KEY = 'lunaxcode_ai_config';
const LEGACY_KEYS = ['ai_provider', 'ai_api_key', 'ai_model'];
const CURRENT_VERSION = 1;

/**
 * Load AI configuration from localStorage
 * Handles migration from legacy format automatically
 */
export function loadAIConfig(): AIConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const config = JSON.parse(stored) as AIConfig;

      // Validate structure
      if (config.version === CURRENT_VERSION && config.providers) {
        return config;
      }
    }

    // Attempt migration from legacy format
    return migrateLegacyConfig();
  } catch (error) {
    console.error('Failed to load AI config:', error);
    return getDefaultConfig();
  }
}

/**
 * Save AI configuration to localStorage
 */
export function saveAIConfig(config: AIConfig): void {
  try {
    config.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    // Clean up legacy keys if they exist
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to save AI config:', error);
    throw new Error('Failed to save configuration. Storage may be full.');
  }
}

/**
 * Get provider configuration
 */
export function getProviderConfig(
  config: AIConfig,
  providerId: string
): ClientProviderConfig | null {
  return config.providers[providerId] || null;
}

/**
 * Update provider configuration
 */
export function updateProviderConfig(
  config: AIConfig,
  providerId: string,
  providerConfig: ClientProviderConfig
): AIConfig {
  return {
    ...config,
    providers: {
      ...config.providers,
      [providerId]: providerConfig,
    },
  };
}

/**
 * Remove provider configuration
 */
export function removeProviderConfig(config: AIConfig, providerId: string): AIConfig {
  const { [providerId]: removed, ...remaining } = config.providers;

  return {
    ...config,
    providers: remaining,
    // Clear default if removed provider was default
    defaultProvider:
      config.defaultProvider === providerId
        ? Object.keys(remaining)[0] || null
        : config.defaultProvider,
  };
}

/**
 * Set default provider
 */
export function setDefaultProvider(config: AIConfig, providerId: string): AIConfig {
  // Validate provider is configured
  if (!config.providers[providerId]) {
    throw new Error(`Provider ${providerId} is not configured`);
  }

  return {
    ...config,
    defaultProvider: providerId,
  };
}

/**
 * Get default config structure
 */
function getDefaultConfig(): AIConfig {
  return {
    version: CURRENT_VERSION,
    providers: {},
    defaultProvider: null,
  };
}

/**
 * Migrate from legacy single-provider format
 */
function migrateLegacyConfig(): AIConfig {
  const legacyProvider = localStorage.getItem('ai_provider');
  const legacyApiKey = localStorage.getItem('ai_api_key');
  const legacyModel = localStorage.getItem('ai_model');

  const config = getDefaultConfig();

  // If legacy data exists, migrate it
  if (legacyProvider && legacyApiKey && legacyModel) {
    config.providers[legacyProvider] = {
      apiKey: legacyApiKey,
      model: legacyModel,
    };
    config.defaultProvider = legacyProvider;

    // Save migrated config
    saveAIConfig(config);

    console.log(`✅ Migrated legacy AI config: ${legacyProvider} is now configured`);
  }

  return config;
}

/**
 * Check if legacy format exists
 */
export function hasLegacyConfig(): boolean {
  return LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null);
}

/**
 * Get legacy config info (for migration notice)
 */
export function getLegacyConfigInfo(): {
  provider: string;
  hasApiKey: boolean;
  model: string;
} | null {
  const provider = localStorage.getItem('ai_provider');
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model');

  if (provider && apiKey && model) {
    return {
      provider,
      hasApiKey: !!apiKey,
      model,
    };
  }

  return null;
}

/**
 * Check if provider is configured
 */
export function isProviderConfigured(config: AIConfig, providerId: string): boolean {
  return !!config.providers[providerId]?.apiKey;
}

/**
 * Get all configured provider IDs
 */
export function getConfiguredProviders(config: AIConfig): string[] {
  return Object.keys(config.providers).filter((id) => config.providers[id]?.apiKey);
}

/**
 * Get default provider config (if exists)
 */
export function getDefaultProviderConfig(config: AIConfig): {
  providerId: string;
  config: ClientProviderConfig;
} | null {
  if (!config.defaultProvider) {
    return null;
  }

  const providerConfig = config.providers[config.defaultProvider];
  if (!providerConfig) {
    return null;
  }

  return {
    providerId: config.defaultProvider,
    config: providerConfig,
  };
}

/**
 * Validate API key format (basic client-side validation)
 */
export function validateApiKey(
  providerId: string,
  apiKey: string
): { valid: boolean; message?: string } {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, message: 'API key is required' };
  }

  if (apiKey.length < 20) {
    return { valid: false, message: 'API key appears too short' };
  }

  const provider = getProvider(providerId);
  if (!provider) {
    return { valid: false, message: 'Unknown provider' };
  }

  // Provider-specific validation
  if (provider.apiKeyPrefix && !apiKey.startsWith(provider.apiKeyPrefix)) {
    return {
      valid: false,
      message: `${provider.name} API keys should start with "${provider.apiKeyPrefix}"`,
    };
  }

  if (provider.apiKeyPattern && !provider.apiKeyPattern.test(apiKey)) {
    return {
      valid: false,
      message: `Invalid ${provider.name} API key format`,
    };
  }

  return { valid: true };
}

/**
 * Export config as JSON (for backup)
 * Note: Sanitizes API keys for security
 */
export function exportConfig(config: AIConfig): string {
  const sanitized = {
    ...config,
    providers: Object.fromEntries(
      Object.entries(config.providers).map(([id, pConfig]) => [
        id,
        {
          ...pConfig,
          apiKey: `${pConfig.apiKey.substring(0, 8)}...${pConfig.apiKey.slice(-4)}`,
        },
      ])
    ),
  };

  return JSON.stringify(sanitized, null, 2);
}

/**
 * Clear all AI configuration (use with caution)
 */
export function clearAllConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  console.log('🗑️ Cleared all AI configuration');
}
