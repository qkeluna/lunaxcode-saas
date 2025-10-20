/**
 * Error Handling & Validation
 * Comprehensive error handling for AI proxy system
 */

import type { AIProvider, AIProxyError, AIErrorCode, AIProxyRequest } from './types';
import { validateApiKeyFormat, isSupportedProvider } from './provider-config';

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class AIProxyException extends Error {
  code: AIErrorCode;
  provider?: AIProvider;
  statusCode: number;
  details?: string;

  constructor(code: AIErrorCode, message: string, statusCode = 500, provider?: AIProvider, details?: string) {
    super(message);
    this.name = 'AIProxyException';
    this.code = code;
    this.provider = provider;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON(): AIProxyError {
    return {
      error: this.message,
      code: this.code,
      provider: this.provider,
      details: this.details,
    };
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate proxy request
 */
export function validateProxyRequest(request: unknown): AIProxyRequest {
  if (!request || typeof request !== 'object') {
    throw new AIProxyException('INVALID_REQUEST', 'Request body is required', 400);
  }

  const req = request as Partial<AIProxyRequest>;

  // Validate provider
  if (!req.provider) {
    throw new AIProxyException('INVALID_REQUEST', 'Provider is required', 400);
  }

  if (!isSupportedProvider(req.provider)) {
    throw new AIProxyException(
      'INVALID_REQUEST',
      `Unsupported provider: ${req.provider}. Supported providers: openai, anthropic, google, deepseek, groq, together`,
      400
    );
  }

  // Validate model
  if (!req.model || typeof req.model !== 'string') {
    throw new AIProxyException('INVALID_REQUEST', 'Model is required and must be a string', 400);
  }

  // Validate API key
  if (!req.apiKey || typeof req.apiKey !== 'string') {
    throw new AIProxyException('INVALID_REQUEST', 'API key is required', 400, req.provider as AIProvider);
  }

  // Validate API key format
  if (!validateApiKeyFormat(req.provider as AIProvider, req.apiKey)) {
    throw new AIProxyException(
      'INVALID_API_KEY',
      `Invalid API key format for ${req.provider}`,
      401,
      req.provider as AIProvider
    );
  }

  // Validate messages
  if (!req.messages || !Array.isArray(req.messages) || req.messages.length === 0) {
    throw new AIProxyException('INVALID_REQUEST', 'Messages array is required and must not be empty', 400);
  }

  // Validate each message
  for (const msg of req.messages) {
    if (!msg.role || !['system', 'user', 'assistant'].includes(msg.role)) {
      throw new AIProxyException(
        'INVALID_REQUEST',
        'Each message must have a valid role (system, user, or assistant)',
        400
      );
    }

    if (!msg.content || typeof msg.content !== 'string') {
      throw new AIProxyException('INVALID_REQUEST', 'Each message must have content as a string', 400);
    }
  }

  // Validate optional parameters
  if (req.temperature !== undefined) {
    if (typeof req.temperature !== 'number' || req.temperature < 0 || req.temperature > 2) {
      throw new AIProxyException('INVALID_REQUEST', 'Temperature must be a number between 0 and 2', 400);
    }
  }

  if (req.maxTokens !== undefined) {
    if (typeof req.maxTokens !== 'number' || req.maxTokens < 1 || req.maxTokens > 100000) {
      throw new AIProxyException('INVALID_REQUEST', 'maxTokens must be a number between 1 and 100000', 400);
    }
  }

  return req as AIProxyRequest;
}

/**
 * Validate request origin
 */
export function validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;

  // Check exact match
  if (allowedOrigins.includes(origin)) return true;

  // Check wildcard patterns
  for (const allowed of allowedOrigins) {
    if (allowed.includes('*')) {
      const pattern = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
      if (pattern.test(origin)) return true;
    }
  }

  return false;
}

/**
 * Sanitize error message (remove sensitive info)
 */
export function sanitizeErrorMessage(error: any, provider: AIProvider): string {
  const message = error.message || error.toString() || 'Unknown error';

  // Remove API keys from error messages
  const sanitized = message.replace(/sk-[a-zA-Z0-9-_]{32,}/g, 'sk-***');

  return sanitized;
}

// ============================================================================
// ERROR RESPONSE BUILDERS
// ============================================================================

/**
 * Handle fetch errors and convert to AIProxyException
 */
export function handleFetchError(error: any, provider: AIProvider): AIProxyException {
  // Network errors
  if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
    return new AIProxyException('TIMEOUT', `Request to ${provider} timed out after 30 seconds`, 504, provider);
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new AIProxyException('NETWORK_ERROR', `Network error connecting to ${provider}`, 503, provider);
  }

  // Generic fetch error
  return new AIProxyException(
    'PROVIDER_ERROR',
    `Failed to connect to ${provider}: ${sanitizeErrorMessage(error, provider)}`,
    503,
    provider
  );
}

/**
 * Handle HTTP error responses from providers
 */
export async function handleHttpError(response: Response, provider: AIProvider): Promise<AIProxyException> {
  let errorMessage = response.statusText;
  let errorCode: AIErrorCode = 'PROVIDER_ERROR';

  try {
    const errorData = await response.json();

    // Extract error message from different provider formats
    if (errorData.error) {
      if (typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      } else if (errorData.error.message) {
        errorMessage = errorData.error.message;
      }
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }
  } catch {
    // If response is not JSON, use status text
    errorMessage = response.statusText || 'Unknown error';
  }

  // Map HTTP status codes to error codes
  if (response.status === 401 || response.status === 403) {
    errorCode = 'INVALID_API_KEY';
    errorMessage = `Invalid API key for ${provider}`;
  } else if (response.status === 429) {
    errorCode = 'RATE_LIMIT_EXCEEDED';
    errorMessage = `Rate limit exceeded for ${provider}`;
  } else if (response.status >= 500) {
    errorCode = 'PROVIDER_ERROR';
    errorMessage = `${provider} server error: ${errorMessage}`;
  }

  return new AIProxyException(errorCode, errorMessage, response.status, provider);
}

// ============================================================================
// LOGGING (SECURITY-SAFE)
// ============================================================================

/**
 * Create sanitized log entry (NEVER logs API keys)
 */
export function createSafeLogEntry(
  provider: AIProvider,
  model: string,
  messageCount: number,
  success: boolean,
  duration?: number
): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    provider,
    model,
    messageCount,
    success,
    duration: duration ? `${duration}ms` : undefined,
  };
}

/**
 * Log error safely (NEVER logs API keys or sensitive data)
 */
export function logErrorSafely(error: AIProxyException): void {
  console.error('AI Proxy Error:', {
    code: error.code,
    provider: error.provider,
    message: error.message,
    statusCode: error.statusCode,
    // NEVER log details that might contain API keys
  });
}

/**
 * Log request safely (NEVER logs API keys)
 */
export function logRequestSafely(provider: AIProvider, model: string, messageCount: number): void {
  console.log('AI Proxy Request:', {
    provider,
    model,
    messageCount,
    timestamp: new Date().toISOString(),
  });
}
