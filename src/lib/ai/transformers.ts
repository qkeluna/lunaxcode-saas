/**
 * Request/Response Transformers
 * Convert between universal format and provider-specific formats
 */

import type {
  AIMessage,
  AIProxyRequest,
  AIProxyResponse,
  AIProvider,
  OpenAIRequest,
  OpenAIResponse,
  AnthropicRequest,
  AnthropicResponse,
  GoogleRequest,
  GoogleResponse,
} from './types';

// ============================================================================
// REQUEST TRANSFORMERS (Universal → Provider-specific)
// ============================================================================

/**
 * Transform universal request to OpenAI format
 */
export function transformToOpenAI(request: AIProxyRequest): OpenAIRequest {
  return {
    model: request.model,
    messages: request.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 4000,
    stream: request.stream ?? false,
  };
}

/**
 * Transform universal request to Anthropic format
 */
export function transformToAnthropic(request: AIProxyRequest): AnthropicRequest {
  // Anthropic doesn't support system role in messages array
  // Extract system message if present
  const systemMessage = request.messages.find((msg) => msg.role === 'system');
  const nonSystemMessages = request.messages.filter((msg) => msg.role !== 'system');

  const body: AnthropicRequest = {
    model: request.model,
    messages: nonSystemMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })),
    max_tokens: request.maxTokens ?? 4000,
    temperature: request.temperature ?? 0.7,
    stream: request.stream ?? false,
  };

  // Add system message as separate field if present
  if (systemMessage) {
    (body as any).system = systemMessage.content;
  }

  return body;
}

/**
 * Transform universal request to Google Gemini format
 */
export function transformToGoogle(request: AIProxyRequest): GoogleRequest {
  // Google uses a different format - combine all messages into a single prompt
  const combinedPrompt = request.messages
    .map((msg) => {
      const prefix = msg.role === 'system' ? 'System: ' : msg.role === 'user' ? 'User: ' : 'Assistant: ';
      return prefix + msg.content;
    })
    .join('\n\n');

  return {
    contents: [
      {
        parts: [{ text: combinedPrompt }],
      },
    ],
    generationConfig: {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens ?? 8000,
    },
  };
}

/**
 * Transform universal request to DeepSeek format (OpenAI-compatible)
 */
export function transformToDeepSeek(request: AIProxyRequest): OpenAIRequest {
  return transformToOpenAI(request);
}

/**
 * Transform universal request to Groq format (OpenAI-compatible)
 */
export function transformToGroq(request: AIProxyRequest): OpenAIRequest {
  return transformToOpenAI(request);
}

/**
 * Transform universal request to Together AI format (OpenAI-compatible)
 */
export function transformToTogether(request: AIProxyRequest): OpenAIRequest {
  return transformToOpenAI(request);
}

// ============================================================================
// RESPONSE TRANSFORMERS (Provider-specific → Universal)
// ============================================================================

/**
 * Transform OpenAI response to universal format
 */
export function transformFromOpenAI(response: OpenAIResponse, provider: AIProvider): AIProxyResponse {
  return {
    text: response.choices[0].message.content,
    usage: {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    },
    model: response.model,
    provider,
    finishReason: response.choices[0].finish_reason as any,
  };
}

/**
 * Transform Anthropic response to universal format
 */
export function transformFromAnthropic(response: AnthropicResponse, provider: AIProvider): AIProxyResponse {
  return {
    text: response.content[0].text,
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
    model: response.model,
    provider,
    finishReason: response.stop_reason as any,
  };
}

/**
 * Transform Google Gemini response to universal format
 */
export function transformFromGoogle(response: GoogleResponse, provider: AIProvider, model: string): AIProxyResponse {
  const usage = response.usageMetadata || {
    promptTokenCount: 0,
    candidatesTokenCount: 0,
    totalTokenCount: 0,
  };

  return {
    text: response.candidates[0].content.parts[0].text,
    usage: {
      promptTokens: usage.promptTokenCount,
      completionTokens: usage.candidatesTokenCount,
      totalTokens: usage.totalTokenCount,
    },
    model,
    provider,
    finishReason: (response.candidates[0].finishReason?.toLowerCase() as any) || 'stop',
  };
}

/**
 * Transform DeepSeek response to universal format (OpenAI-compatible)
 */
export function transformFromDeepSeek(response: OpenAIResponse, provider: AIProvider): AIProxyResponse {
  return transformFromOpenAI(response, provider);
}

/**
 * Transform Groq response to universal format (OpenAI-compatible)
 */
export function transformFromGroq(response: OpenAIResponse, provider: AIProvider): AIProxyResponse {
  return transformFromOpenAI(response, provider);
}

/**
 * Transform Together AI response to universal format (OpenAI-compatible)
 */
export function transformFromTogether(response: OpenAIResponse, provider: AIProvider): AIProxyResponse {
  return transformFromOpenAI(response, provider);
}

// ============================================================================
// TRANSFORMER FACTORY
// ============================================================================

/**
 * Get request transformer for provider
 */
export function getRequestTransformer(provider: AIProvider): (request: AIProxyRequest) => any {
  const transformers = {
    openai: transformToOpenAI,
    anthropic: transformToAnthropic,
    google: transformToGoogle,
    deepseek: transformToDeepSeek,
    groq: transformToGroq,
    together: transformToTogether,
  };

  return transformers[provider];
}

/**
 * Get response transformer for provider
 */
export function getResponseTransformer(
  provider: AIProvider
): (response: any, provider: AIProvider, model?: string) => AIProxyResponse {
  const transformers = {
    openai: (res: OpenAIResponse, prov: AIProvider) => transformFromOpenAI(res, prov),
    anthropic: (res: AnthropicResponse, prov: AIProvider) => transformFromAnthropic(res, prov),
    google: (res: GoogleResponse, prov: AIProvider, model: string) => transformFromGoogle(res, prov, model),
    deepseek: (res: OpenAIResponse, prov: AIProvider) => transformFromDeepSeek(res, prov),
    groq: (res: OpenAIResponse, prov: AIProvider) => transformFromGroq(res, prov),
    together: (res: OpenAIResponse, prov: AIProvider) => transformFromTogether(res, prov),
  };

  return transformers[provider];
}
