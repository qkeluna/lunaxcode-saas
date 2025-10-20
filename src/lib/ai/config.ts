/**
 * AI Provider Configuration
 *
 * Defines all supported AI providers, their models, and metadata
 */

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  models: string[];
  docsUrl: string;
  apiKeyPrefix?: string;
  apiKeyPattern?: RegExp;
  supportsCORS: boolean; // Whether provider can be called directly from browser
}

/**
 * Supported AI Providers
 */
export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo, GPT-3.5',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    docsUrl: 'https://platform.openai.com/api-keys',
    apiKeyPrefix: 'sk-',
    apiKeyPattern: /^sk-[A-Za-z0-9]{48}$/,
    supportsCORS: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet, Opus, Haiku',
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
    docsUrl: 'https://console.anthropic.com/settings/keys',
    apiKeyPrefix: 'sk-ant-',
    supportsCORS: false, // Requires server-side proxy
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini 2.5 Pro/Flash (Latest)',
    models: [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ],
    docsUrl: 'https://aistudio.google.com/app/apikey',
    apiKeyPrefix: 'AIza',
    supportsCORS: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek Chat, Coder',
    models: ['deepseek-chat', 'deepseek-coder'],
    docsUrl: 'https://platform.deepseek.com/api-keys',
    apiKeyPrefix: 'sk-',
    supportsCORS: true, // OpenAI-compatible API
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
    docsUrl: 'https://console.groq.com/keys',
    supportsCORS: true, // OpenAI-compatible API
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Multiple open-source models',
    models: [
      'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
    ],
    docsUrl: 'https://api.together.xyz/settings/api-keys',
    supportsCORS: true, // OpenAI-compatible API
  },
];

/**
 * Get provider by ID
 */
export function getProvider(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}

/**
 * Get all provider IDs
 */
export function getAllProviderIds(): string[] {
  return AI_PROVIDERS.map((p) => p.id);
}

/**
 * Check if provider requires server-side proxy
 */
export function requiresProxy(providerId: string): boolean {
  const provider = getProvider(providerId);
  return provider ? !provider.supportsCORS : false;
}
