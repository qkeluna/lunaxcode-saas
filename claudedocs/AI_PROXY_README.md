# AI Proxy System - Quick Start Guide

## Overview

The Lunaxcode AI Proxy System is a universal backend service that enables client-side applications to communicate with multiple AI providers through a unified API interface. This solves the CORS limitation problem where providers like Anthropic don't allow direct browser requests.

**Supported Providers:**
- OpenAI (GPT-4, GPT-4o, GPT-3.5)
- Anthropic (Claude 3.5, Claude 3)
- Google Gemini (Gemini 1.5)
- DeepSeek (DeepSeek Chat)
- Groq (Llama, Mixtral)
- Together AI (Open source models)

---

## Quick Start

### 1. Installation

The proxy system is already integrated into your Next.js project. No additional installation required.

### 2. Basic Usage

```typescript
// Make an AI request through the proxy
const response = await fetch('/api/ai/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    messages: [
      {
        role: 'user',
        content: 'Explain quantum computing in simple terms'
      }
    ],
    apiKey: localStorage.getItem('anthropic_api_key')
  })
});

const data = await response.json();
console.log(data.text); // AI-generated response
```

### 3. Get API Keys

Each provider requires an API key:

- **OpenAI:** https://platform.openai.com/api-keys
- **Anthropic:** https://console.anthropic.com/settings/keys
- **Google Gemini:** https://aistudio.google.com/app/apikey
- **DeepSeek:** https://platform.deepseek.com/api_keys
- **Groq:** https://console.groq.com/keys
- **Together AI:** https://api.together.xyz/settings/api-keys

---

## API Reference

### POST /api/ai/proxy

Main endpoint for AI requests.

**Request:**
```typescript
{
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'groq' | 'together',
  model: string,
  messages: Array<{
    role: 'system' | 'user' | 'assistant',
    content: string
  }>,
  apiKey: string,
  temperature?: number,    // 0-2, default: 0.7
  maxTokens?: number,      // 1-100000
  stream?: boolean         // Use /api/ai/stream instead
}
```

**Response (Success):**
```typescript
{
  text: string,
  usage: {
    promptTokens: number,
    completionTokens: number,
    totalTokens: number
  },
  model: string,
  provider: string,
  finishReason: 'stop' | 'length' | 'content_filter' | 'error',
  metadata: {
    duration: number,
    timestamp: string
  }
}
```

**Response (Error):**
```typescript
{
  error: string,
  code: 'INVALID_API_KEY' | 'RATE_LIMIT_EXCEEDED' | 'PROVIDER_ERROR' |
        'TIMEOUT' | 'INVALID_REQUEST' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR',
  provider?: string,
  details?: string
}
```

---

### POST /api/ai/stream

Streaming endpoint for real-time responses (SSE).

**Request:** Same as `/api/ai/proxy`

**Response:** Server-Sent Events stream

```
data: {"text": "Hello", "done": false}
data: {"text": " world", "done": false}
data: {"text": "!", "done": true, "usage": {...}}
```

---

### POST /api/ai/validate

Validate an API key before use.

**Request:**
```typescript
{
  provider: string,
  apiKey: string
}
```

**Response:**
```typescript
{
  valid: boolean,
  provider: string,
  error?: string
}
```

---

## Examples

### Example 1: Simple Question

```typescript
const askAI = async (question: string) => {
  const response = await fetch('/api/ai/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'openai',
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: question }],
      apiKey: localStorage.getItem('openai_api_key')
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  return data.text;
};

// Usage
const answer = await askAI('What is the capital of France?');
console.log(answer); // "The capital of France is Paris."
```

---

### Example 2: System Prompt

```typescript
const generatePRD = async (description: string) => {
  const response = await fetch('/api/ai/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        {
          role: 'system',
          content: 'You are a technical project manager who writes detailed PRDs.'
        },
        {
          role: 'user',
          content: `Generate a PRD for: ${description}`
        }
      ],
      apiKey: localStorage.getItem('anthropic_api_key'),
      maxTokens: 4000
    })
  });

  const data = await response.json();
  return data.text;
};
```

---

### Example 3: Multi-turn Conversation

```typescript
const chat = async (messages: Array<{role: string, content: string}>) => {
  const response = await fetch('/api/ai/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      model: 'gemini-1.5-flash',
      messages,
      apiKey: localStorage.getItem('google_api_key')
    })
  });

  const data = await response.json();
  return data.text;
};

// Usage
const conversation = [
  { role: 'user', content: 'What is React?' },
  { role: 'assistant', content: 'React is a JavaScript library for building user interfaces.' },
  { role: 'user', content: 'What are React hooks?' }
];

const response = await chat(conversation);
```

---

### Example 4: Error Handling

```typescript
const robustAIRequest = async (prompt: string) => {
  try {
    const response = await fetch('/api/ai/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        apiKey: localStorage.getItem('openai_api_key')
      })
    });

    if (!response.ok) {
      const error = await response.json();

      switch (error.code) {
        case 'INVALID_API_KEY':
          alert('Invalid API key. Please check your settings.');
          break;
        case 'RATE_LIMIT_EXCEEDED':
          alert('Rate limit exceeded. Please try again later.');
          break;
        case 'TIMEOUT':
          alert('Request timed out. Please try again.');
          break;
        default:
          alert(`Error: ${error.error}`);
      }

      return null;
    }

    const data = await response.json();
    return data.text;
  } catch (err) {
    console.error('Network error:', err);
    alert('Network error. Please check your connection.');
    return null;
  }
};
```

---

### Example 5: Validate API Key

```typescript
const validateKey = async (provider: string, apiKey: string) => {
  const response = await fetch('/api/ai/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, apiKey })
  });

  const data = await response.json();

  if (data.valid) {
    console.log(`✓ ${provider} API key is valid`);
    return true;
  } else {
    console.error(`✗ ${provider} API key is invalid: ${data.error}`);
    return false;
  }
};

// Usage
const isValid = await validateKey('anthropic', 'sk-ant-...');
```

---

## React Hook Example

```typescript
// hooks/useAI.ts
import { useState } from 'react';

interface UseAIOptions {
  provider: string;
  model: string;
  apiKey: string;
}

export function useAI({ provider, model, apiKey }: UseAIOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (prompt: string, systemPrompt?: string) => {
    setLoading(true);
    setError(null);

    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetch('/api/ai/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          messages,
          apiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data.text;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}

// Usage in component
function MyComponent() {
  const { generate, loading, error } = useAI({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    apiKey: localStorage.getItem('anthropic_api_key') || ''
  });

  const handleGenerate = async () => {
    const result = await generate('Explain TypeScript generics');
    console.log(result);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

---

## Model Recommendations

### For PRD Generation (Long-form content)
- **Best:** `anthropic/claude-3-5-sonnet-20241022` (8k tokens, high quality)
- **Budget:** `google/gemini-1.5-flash` (8k tokens, fast, free tier)

### For Task Breakdown (Structured data)
- **Best:** `openai/gpt-4o-mini` (Reliable JSON, good reasoning)
- **Budget:** `groq/llama-3.1-70b-versatile` (Fast, good quality)

### For Real-time Chat (Low latency)
- **Best:** `groq/llama-3.1-70b-versatile` (Extremely fast)
- **Alternative:** `openai/gpt-4o-mini` (Fast, reliable)

### For Code Generation
- **Best:** `anthropic/claude-3-5-sonnet-20241022` (Excellent code quality)
- **Alternative:** `deepseek/deepseek-chat` (Specialized for code)

---

## Rate Limits

**Proxy Rate Limits (per IP):**
- 20 requests per minute
- 100 requests per hour

**Provider Rate Limits:**
- Check each provider's documentation for their limits
- Limits vary by plan tier

---

## Troubleshooting

### "INVALID_API_KEY" Error

**Cause:** API key is invalid or formatted incorrectly

**Solution:**
1. Verify the API key is correct
2. Check the provider (each has different key formats)
3. Regenerate the key from provider dashboard
4. Use `/api/ai/validate` to test the key

---

### "RATE_LIMIT_EXCEEDED" Error

**Cause:** Too many requests from your IP

**Solution:**
1. Wait for the rate limit window to reset (see Retry-After header)
2. Reduce request frequency
3. Implement exponential backoff in your code

---

### "TIMEOUT" Error

**Cause:** Request took longer than 30 seconds

**Solution:**
1. Reduce `maxTokens` parameter
2. Simplify the prompt
3. Try a faster model (e.g., GPT-4o-mini instead of GPT-4)
4. Check provider status page

---

### "PROVIDER_ERROR" Error

**Cause:** The AI provider returned an error

**Solution:**
1. Check provider status page
2. Verify your API key has credits/quota
3. Try a different model
4. Check the error details in response

---

### CORS Errors

**Cause:** Request from unauthorized origin

**Solution:**
1. Ensure you're using POST method
2. Set Content-Type header to application/json
3. Check ALLOWED_ORIGINS environment variable in production
4. Use the proxy endpoints, not direct API calls

---

## Best Practices

### 1. Store API Keys Securely

```typescript
// Good: Browser localStorage (client-side)
localStorage.setItem('openai_api_key', 'sk-...');

// Bad: Hardcoded in code
const apiKey = 'sk-...'; // Never do this!
```

### 2. Handle Errors Gracefully

```typescript
// Always wrap in try-catch
try {
  const result = await aiRequest();
} catch (error) {
  // Show user-friendly error message
  console.error('AI request failed:', error);
}
```

### 3. Set Appropriate Token Limits

```typescript
// For short responses (chat)
maxTokens: 500

// For medium responses (summaries)
maxTokens: 2000

// For long responses (PRDs, articles)
maxTokens: 4000
```

### 4. Use System Prompts

```typescript
// Define AI behavior with system message
messages: [
  {
    role: 'system',
    content: 'You are a professional technical writer. Be concise and clear.'
  },
  { role: 'user', content: 'Write a project overview' }
]
```

### 5. Implement Loading States

```typescript
const [loading, setLoading] = useState(false);

const handleGenerate = async () => {
  setLoading(true);
  try {
    // AI request
  } finally {
    setLoading(false);
  }
};
```

---

## Performance Tips

### 1. Choose the Right Model

Fast models: `gpt-4o-mini`, `gemini-1.5-flash`, `groq/llama-3.1-70b-versatile`

Quality models: `claude-3-5-sonnet`, `gpt-4o`, `gemini-1.5-pro`

### 2. Optimize Prompts

```typescript
// Bad: Vague prompt
"Write something about React"

// Good: Specific prompt
"Write a 3-paragraph explanation of React hooks for beginners, with code examples"
```

### 3. Use Streaming for Long Responses

```typescript
// For responses that take >5 seconds, use streaming
const response = await fetch('/api/ai/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* request */ })
});

const reader = response.body.getReader();
// Process stream chunks as they arrive
```

### 4. Cache Responses

```typescript
// Cache responses for identical requests
const cache = new Map();

const getCachedOrGenerate = async (prompt) => {
  if (cache.has(prompt)) {
    return cache.get(prompt);
  }

  const response = await generate(prompt);
  cache.set(prompt, response);
  return response;
};
```

---

## Security Notes

### API Key Safety

- API keys are NEVER logged or stored on the server
- Keys are only passed through to providers
- Use HTTPS in production (automatic with Cloudflare Pages)
- Store keys in localStorage, not in code

### Rate Limiting

- 20 requests per minute per IP
- 100 requests per hour per IP
- Prevents abuse and excessive costs

### Request Validation

- All requests validated before proxying
- Invalid requests rejected with 400 error
- Request size limited to 1MB

---

## Support

### Documentation

- Full Architecture: `claudedocs/AI_PROXY_ARCHITECTURE.md`
- Security Checklist: `claudedocs/AI_PROXY_SECURITY_CHECKLIST.md`
- OpenAPI Spec: `claudedocs/openapi-ai-proxy.yaml`

### Provider Documentation

- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com
- Google Gemini: https://ai.google.dev/docs
- DeepSeek: https://platform.deepseek.com/docs
- Groq: https://console.groq.com/docs
- Together AI: https://docs.together.ai

---

## Changelog

### Version 1.0.0 (2024-10-19)

- Initial release
- Support for 6 AI providers
- Rate limiting (20/min, 100/hour)
- Request validation
- Error handling
- Security headers
- API key validation endpoint
- Streaming support (experimental)
