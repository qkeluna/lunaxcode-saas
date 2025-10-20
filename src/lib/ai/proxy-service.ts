/**
 * AI Proxy Service
 * Core service that handles routing and execution of AI requests
 */

import type { AIProxyRequest, AIProxyResponse, AIProvider } from './types';
import { buildApiUrl, buildHeaders, getTimeout } from './provider-config';
import { getRequestTransformer, getResponseTransformer } from './transformers';
import { AIProxyException, handleFetchError, handleHttpError } from './error-handler';

// ============================================================================
// MAIN PROXY SERVICE
// ============================================================================

/**
 * Execute AI request through proxy
 * This is the main function that routes requests to appropriate providers
 */
export async function executeAIRequest(request: AIProxyRequest): Promise<AIProxyResponse> {
  const { provider, model, apiKey } = request;

  // Get transformer functions
  const transformRequest = getRequestTransformer(provider);
  const transformResponse = getResponseTransformer(provider);

  // Transform universal request to provider-specific format
  const providerRequest = transformRequest(request);

  // Build API URL and headers
  const url = buildApiUrl(provider, model, apiKey);
  const headers = buildHeaders(provider, apiKey);
  const timeout = getTimeout(provider);

  try {
    // Execute request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(providerRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      throw await handleHttpError(response, provider);
    }

    // Parse response
    const data = await response.json();

    // Transform provider response to universal format
    return transformResponse(data, provider, model);
  } catch (error: any) {
    // If already an AIProxyException, re-throw it
    if (error instanceof AIProxyException) {
      throw error;
    }

    // Handle fetch errors
    throw handleFetchError(error, provider);
  }
}

// ============================================================================
// STREAMING SUPPORT (Future Enhancement)
// ============================================================================

/**
 * Execute streaming AI request
 * Note: Streaming implementation requires SSE (Server-Sent Events)
 */
export async function executeStreamingRequest(request: AIProxyRequest): Promise<ReadableStream> {
  const { provider, model, apiKey } = request;

  // Ensure streaming is enabled in request
  request.stream = true;

  // Get transformer and build request
  const transformRequest = getRequestTransformer(provider);
  const providerRequest = transformRequest(request);

  // Build API URL and headers
  const url = buildApiUrl(provider, model, apiKey);
  const headers = buildHeaders(provider, apiKey);
  const timeout = getTimeout(provider);

  try {
    // Execute streaming request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(providerRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      throw await handleHttpError(response, provider);
    }

    // Return the stream
    if (!response.body) {
      throw new AIProxyException('PROVIDER_ERROR', 'No response body received', 500, provider);
    }

    return response.body;
  } catch (error: any) {
    // If already an AIProxyException, re-throw it
    if (error instanceof AIProxyException) {
      throw error;
    }

    // Handle fetch errors
    throw handleFetchError(error, provider);
  }
}

// ============================================================================
// PROVIDER-SPECIFIC HANDLERS
// ============================================================================

/**
 * Handle OpenAI requests
 */
export async function handleOpenAI(request: AIProxyRequest): Promise<AIProxyResponse> {
  return executeAIRequest({ ...request, provider: 'openai' });
}

/**
 * Handle Anthropic requests
 */
export async function handleAnthropic(request: AIProxyRequest): Promise<AIProxyResponse> {
  return executeAIRequest({ ...request, provider: 'anthropic' });
}

/**
 * Handle Google Gemini requests
 */
export async function handleGoogle(request: AIProxyRequest): Promise<AIProxyResponse> {
  return executeAIRequest({ ...request, provider: 'google' });
}

/**
 * Handle DeepSeek requests
 */
export async function handleDeepSeek(request: AIProxyRequest): Promise<AIProxyResponse> {
  return executeAIRequest({ ...request, provider: 'deepseek' });
}

/**
 * Handle Groq requests
 */
export async function handleGroq(request: AIProxyRequest): Promise<AIProxyResponse> {
  return executeAIRequest({ ...request, provider: 'groq' });
}

/**
 * Handle Together AI requests
 */
export async function handleTogether(request: AIProxyRequest): Promise<AIProxyResponse> {
  return executeAIRequest({ ...request, provider: 'together' });
}

// ============================================================================
// BATCH REQUEST SUPPORT (Future Enhancement)
// ============================================================================

/**
 * Execute multiple AI requests in parallel
 */
export async function executeBatchRequests(requests: AIProxyRequest[]): Promise<AIProxyResponse[]> {
  // Execute all requests in parallel
  const promises = requests.map((request) => executeAIRequest(request));

  // Wait for all to complete
  return Promise.all(promises);
}
