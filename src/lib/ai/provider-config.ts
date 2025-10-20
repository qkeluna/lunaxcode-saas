/**
 * Provider Configuration & Routing Logic
 * Centralized configuration for all AI providers
 */

import type { AIProvider, ProviderConfig } from './types';

// ============================================================================
// PROVIDER CONFIGURATIONS
// ============================================================================

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    headers: { 'Content-Type': 'application/json' },
    defaultMaxTokens: 4000,
    timeout: 30000,
    supportsStreaming: true,
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1/messages',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    defaultMaxTokens: 4000,
    timeout: 30000,
    supportsStreaming: true,
  },
  google: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1/models',
    headers: { 'Content-Type': 'application/json' },
    defaultMaxTokens: 8000,
    timeout: 30000,
    supportsStreaming: true,
    requiresApiKeyInUrl: true,
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    headers: { 'Content-Type': 'application/json' },
    defaultMaxTokens: 4000,
    timeout: 30000,
    supportsStreaming: true,
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    headers: { 'Content-Type': 'application/json' },
    defaultMaxTokens: 4000,
    timeout: 30000,
    supportsStreaming: true,
  },
  together: {
    baseUrl: 'https://api.together.xyz/v1/chat/completions',
    headers: { 'Content-Type': 'application/json' },
    defaultMaxTokens: 4000,
    timeout: 30000,
    supportsStreaming: true,
  },
};

// ============================================================================
// DEFAULT MODELS
// ============================================================================

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-20241022',
  google: 'gemini-1.5-flash',
  deepseek: 'deepseek-chat',
  groq: 'llama-3.1-70b-versatile',
  together: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
};

// ============================================================================
// API KEY VALIDATION PATTERNS
// ============================================================================

/**
 * Regex patterns for validating API key formats
 * Note: These are basic format checks, not authentication
 */
export const API_KEY_PATTERNS: Record<AIProvider, RegExp> = {
  openai: /^sk-[a-zA-Z0-9]{32,}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9-]{95}$/,
  google: /^AIza[a-zA-Z0-9_-]{35}$/,
  deepseek: /^sk-[a-zA-Z0-9]{32,}$/,
  groq: /^gsk_[a-zA-Z0-9]{52}$/,
  together: /^[a-f0-9]{64}$/,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get provider configuration
 */
export function getProviderConfig(provider: AIProvider): ProviderConfig {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return config;
}

/**
 * Get default model for provider
 */
export function getDefaultModel(provider: AIProvider): string {
  return DEFAULT_MODELS[provider] || '';
}

/**
 * Validate API key format
 * Note: This only checks format, not if the key is valid
 */
export function validateApiKeyFormat(provider: AIProvider, apiKey: string): boolean {
  const pattern = API_KEY_PATTERNS[provider];
  if (!pattern) {
    // If no pattern defined, accept any non-empty string
    return apiKey.length > 0;
  }
  return pattern.test(apiKey);
}

/**
 * Build full API URL for provider
 */
export function buildApiUrl(provider: AIProvider, model: string, apiKey?: string): string {
  const config = getProviderConfig(provider);

  if (provider === 'google' && config.requiresApiKeyInUrl) {
    return `${config.baseUrl}/${model}:generateContent?key=${apiKey}`;
  }

  return config.baseUrl;
}

/**
 * Build request headers for provider
 */
export function buildHeaders(provider: AIProvider, apiKey: string): Record<string, string> {
  const config = getProviderConfig(provider);
  const headers = { ...config.headers };

  // Add authorization header based on provider
  switch (provider) {
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      break;
    case 'google':
      // Google uses API key in URL, not header
      break;
    default:
      // OpenAI, DeepSeek, Groq, Together use Bearer token
      headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

/**
 * Check if provider supports streaming
 */
export function supportsStreaming(provider: AIProvider): boolean {
  return getProviderConfig(provider).supportsStreaming;
}

/**
 * Get timeout for provider
 */
export function getTimeout(provider: AIProvider): number {
  return getProviderConfig(provider).timeout;
}

// ============================================================================
// PROVIDER ROUTING LOGIC
// ============================================================================

/**
 * Route request to appropriate provider implementation
 * This is the central routing logic that determines which provider handler to use
 */
export function getProviderHandler(provider: AIProvider): string {
  // Map provider to handler function name
  const handlerMap: Record<AIProvider, string> = {
    openai: 'handleOpenAI',
    anthropic: 'handleAnthropic',
    google: 'handleGoogle',
    deepseek: 'handleDeepSeek',
    groq: 'handleGroq',
    together: 'handleTogether',
  };

  return handlerMap[provider] || 'handleUnknown';
}

/**
 * Check if provider is supported
 */
export function isSupportedProvider(provider: string): provider is AIProvider {
  return provider in PROVIDER_CONFIGS;
}

/**
 * Get list of all supported providers
 */
export function getSupportedProviders(): AIProvider[] {
  return Object.keys(PROVIDER_CONFIGS) as AIProvider[];
}
