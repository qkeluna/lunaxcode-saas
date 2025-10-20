/**
 * Type definitions for the Universal AI Proxy System
 */

// ============================================================================
// PROVIDER TYPES
// ============================================================================

export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'deepseek'
  | 'groq'
  | 'together';

export type AIModel = string; // Allow any string for flexibility

// ============================================================================
// REQUEST & RESPONSE INTERFACES
// ============================================================================

/**
 * Message format compatible with all providers
 */
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Standard proxy request format
 */
export interface AIProxyRequest {
  provider: AIProvider;
  model: AIModel;
  messages: AIMessage[];
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Standard proxy response format
 */
export interface AIProxyResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProvider;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
}

/**
 * Streaming chunk format
 */
export interface AIStreamChunk {
  text: string;
  done: boolean;
  usage?: AIProxyResponse['usage'];
}

/**
 * Error response format
 */
export interface AIProxyError {
  error: string;
  code: AIErrorCode;
  provider?: AIProvider;
  details?: string;
}

export type AIErrorCode =
  | 'INVALID_API_KEY'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PROVIDER_ERROR'
  | 'TIMEOUT'
  | 'INVALID_REQUEST'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// ============================================================================
// PROVIDER-SPECIFIC INTERFACES
// ============================================================================

/**
 * OpenAI API request format
 */
export interface OpenAIRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * OpenAI API response format
 */
export interface OpenAIResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * Anthropic API request format
 */
export interface AnthropicRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens: number;
  temperature?: number;
  stream?: boolean;
}

/**
 * Anthropic API response format
 */
export interface AnthropicResponse {
  content: Array<{ text: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
  stop_reason: string;
}

/**
 * Google Gemini API request format
 */
export interface GoogleRequest {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

/**
 * Google Gemini API response format
 */
export interface GoogleResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * API key validation request
 */
export interface ValidateKeyRequest {
  provider: AIProvider;
  apiKey: string;
}

/**
 * API key validation response
 */
export interface ValidateKeyResponse {
  valid: boolean;
  provider: AIProvider;
  error?: string;
}

// ============================================================================
// CONFIGURATION INTERFACES (Server-side)
// ============================================================================

/**
 * Provider configuration (server-side)
 */
export interface ServerProviderConfig {
  baseUrl: string;
  headers: Record<string, string>;
  defaultMaxTokens: number;
  timeout: number;
  supportsStreaming: boolean;
  requiresApiKeyInUrl?: boolean;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxConcurrentRequests: number;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  allowedOrigins: string[];
  maxRequestSize: number;
  enableLogging: boolean;
  logApiKeys: boolean; // Should ALWAYS be false in production
}

// ============================================================================
// CLIENT-SIDE CONFIGURATION INTERFACES
// ============================================================================

/**
 * Individual provider configuration stored in localStorage
 */
export interface ClientProviderConfig {
  apiKey: string;
  model: string;
  lastTested?: string; // ISO timestamp
  testStatus?: 'success' | 'error' | 'pending';
  testError?: string;
}

/**
 * Multi-provider configuration structure (client-side)
 */
export interface AIConfig {
  version: number; // For migration tracking
  providers: Record<string, ClientProviderConfig>;
  defaultProvider: string | null;
  lastUpdated?: string; // ISO timestamp
}

/**
 * Test connection result
 */
export interface TestConnectionResult {
  success: boolean;
  provider: string;
  model: string;
  message: string;
  latency?: number; // ms
  error?: string;
}

/**
 * PRD Generation Parameters
 */
export interface PRDGenerationParams {
  serviceName: string;
  description: string;
  questionAnswers: Record<string, any>;
}

/**
 * Task Generation Parameters
 */
export interface TaskGenerationParams {
  prd: string;
}

/**
 * Generated Task Structure
 */
export interface GeneratedTask {
  title: string;
  description: string;
  section: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  dependencies: string; // JSON array of task indices
  order: number;
}
