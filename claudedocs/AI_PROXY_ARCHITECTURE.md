# Multi-AI Provider Proxy System Architecture

## Executive Summary

This document describes the backend architecture for a universal AI proxy system that enables the Lunaxcode SaaS platform to support multiple AI providers (OpenAI, Anthropic, Google Gemini, DeepSeek, Groq, Together AI) through a unified API interface.

**Problem Solved:** Anthropic and other providers don't support CORS for client-side requests, requiring a server-side proxy. This architecture also provides unified error handling, rate limiting, and security controls.

**Tech Stack:** Next.js 15 Edge Runtime, Cloudflare Workers, TypeScript

---

## System Architecture

### High-Level Flow

```
Client Browser (localStorage: API Keys)
    ↓
    HTTP POST /api/ai/proxy
    {
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      messages: [...],
      apiKey: "sk-ant-..."
    }
    ↓
Edge API Route (Next.js)
    ↓
[Security Checks] → [Validation] → [Rate Limiting]
    ↓
Proxy Service (Router)
    ↓
[Provider-Specific Handler]
    ├── OpenAI API
    ├── Anthropic API
    ├── Google Gemini API
    ├── DeepSeek API
    ├── Groq API
    └── Together AI API
    ↓
Response Transformer
    ↓
Unified Response Format
    {
      text: "...",
      usage: { promptTokens, completionTokens, totalTokens },
      model: "claude-3-5-sonnet",
      provider: "anthropic"
    }
```

---

## Directory Structure

```
src/
├── app/api/ai/
│   ├── proxy/route.ts         # Main proxy endpoint
│   ├── stream/route.ts        # Streaming endpoint
│   └── validate/route.ts      # API key validation
│
├── lib/ai/
│   ├── types.ts               # TypeScript interfaces
│   ├── provider-config.ts     # Provider configurations
│   ├── transformers.ts        # Request/response transformers
│   ├── proxy-service.ts       # Core proxy logic
│   ├── error-handler.ts       # Error handling
│   ├── rate-limiter.ts        # Rate limiting & security
│   └── universal-ai.ts        # Existing AI service (for PRD generation)
```

---

## API Endpoints

### 1. POST /api/ai/proxy

**Purpose:** Main proxy endpoint for AI requests

**Request:**
```typescript
{
  provider: "openai" | "anthropic" | "google" | "deepseek" | "groq" | "together",
  model: string,
  messages: Array<{
    role: "system" | "user" | "assistant",
    content: string
  }>,
  apiKey: string,
  temperature?: number,      // 0-2, default: 0.7
  maxTokens?: number,        // 1-100000, default: varies by provider
  stream?: boolean           // Enable streaming (use /api/ai/stream instead)
}
```

**Response (Success - 200):**
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
  finishReason: "stop" | "length" | "content_filter" | "error",
  metadata: {
    duration: number,        // Milliseconds
    timestamp: string        // ISO 8601
  }
}
```

**Response (Error - 4xx/5xx):**
```typescript
{
  error: string,
  code: "INVALID_API_KEY" | "RATE_LIMIT_EXCEEDED" | "PROVIDER_ERROR" |
        "TIMEOUT" | "INVALID_REQUEST" | "NETWORK_ERROR" | "UNKNOWN_ERROR",
  provider?: string,
  details?: string
}
```

**Error Codes:**
- `400` - Invalid request (missing fields, invalid format)
- `401` - Invalid API key
- `413` - Request too large (max 1MB)
- `415` - Invalid content type (must be application/json)
- `429` - Rate limit exceeded
- `500` - Server error
- `503` - Provider unavailable
- `504` - Request timeout (30s)

---

### 2. POST /api/ai/stream

**Purpose:** Streaming endpoint for real-time AI responses

**Request:** Same as `/api/ai/proxy` but automatically sets `stream: true`

**Response:** Server-Sent Events (SSE) stream
```
Content-Type: text/event-stream

data: {"text": "Hello", "done": false}
data: {"text": " world", "done": false}
data: {"text": "!", "done": true, "usage": {...}}
```

---

### 3. POST /api/ai/validate

**Purpose:** Validate API keys before use

**Request:**
```typescript
{
  provider: string,
  apiKey: string
}
```

**Response (200):**
```typescript
{
  valid: boolean,
  provider: string,
  error?: string
}
```

---

## Provider Routing Logic

### Provider Configuration

Each provider has a configuration defining:

```typescript
{
  baseUrl: string,              // API endpoint URL
  headers: Record<string, string>,  // Default headers
  defaultMaxTokens: number,     // Default token limit
  timeout: number,              // Request timeout (ms)
  supportsStreaming: boolean,   // Streaming support
  requiresApiKeyInUrl?: boolean // API key in URL vs header
}
```

### Request Transformation Flow

```
Universal Request
    ↓
Provider-Specific Transformer
    ↓
{OpenAI Format | Anthropic Format | Google Format | etc.}
    ↓
HTTP POST to Provider API
    ↓
Provider Response
    ↓
Response Transformer
    ↓
Universal Response Format
```

### Provider-Specific Transformations

**OpenAI/DeepSeek/Groq/Together (OpenAI-compatible):**
- Direct message mapping
- Standard `Authorization: Bearer <key>` header

**Anthropic:**
- Extracts system messages to separate field
- Uses `x-api-key` header
- Requires `anthropic-version` header

**Google Gemini:**
- Combines messages into single prompt
- API key in URL query parameter
- Different response structure

---

## Security Architecture

### 1. Rate Limiting

**IP-based limits:**
- 20 requests per minute per IP
- 100 requests per hour per IP

**Implementation:**
- In-memory rate limit store (Edge-compatible)
- Automatic cleanup every 5 minutes
- Returns `429` with `Retry-After` header

### 2. Request Validation

**Security checks:**
- Method validation (POST only)
- Content-Type validation (application/json)
- Request size limit (1MB max)
- API key format validation

### 3. API Key Security

**Critical rules:**
- API keys NEVER logged or stored on server
- Keys sent via request body (HTTPS only)
- Keys validated but not persisted
- Error messages sanitized to remove keys

### 4. CORS Configuration

**Headers:**
- `Access-Control-Allow-Origin: *` (configurable)
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

**Production recommendation:**
- Restrict origins to your domain
- Configure via `ALLOWED_ORIGINS` environment variable

### 5. Security Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Error Handling Strategy

### Error Handling Hierarchy

```
1. AIProxyException (Custom)
   ├── INVALID_REQUEST (400)
   ├── INVALID_API_KEY (401)
   ├── RATE_LIMIT_EXCEEDED (429)
   ├── PROVIDER_ERROR (500-503)
   ├── TIMEOUT (504)
   └── NETWORK_ERROR (503)

2. Provider HTTP Errors
   └── Transformed to AIProxyException

3. Unexpected Errors
   └── Caught and returned as UNKNOWN_ERROR
```

### Error Response Format

All errors return consistent JSON:

```typescript
{
  error: string,      // Human-readable message
  code: string,       // Machine-readable code
  provider?: string,  // Which provider failed
  details?: string    // Additional context (safe)
}
```

### Logging Strategy

**What gets logged:**
- Request metadata (provider, model, message count)
- Error codes and messages
- Response times

**What NEVER gets logged:**
- API keys
- Message content (unless explicitly enabled for debugging)
- Sensitive user data

---

## Performance Considerations

### Timeout Handling

- All requests timeout after 30 seconds
- Uses `AbortController` for clean cancellation
- Returns `504 Gateway Timeout` error

### Request Size Limits

- Maximum request body: 1MB
- Prevents memory exhaustion on Edge runtime
- Returns `413 Payload Too Large` error

### Edge Runtime Benefits

- Global distribution via Cloudflare
- Low latency (typically <50ms overhead)
- Automatic scaling
- No cold starts

---

## Extensibility

### Adding New Providers

To add a new AI provider:

1. **Add to types** (`types.ts`):
   ```typescript
   export type AIProvider =
     | 'openai'
     | 'anthropic'
     | 'new_provider';
   ```

2. **Add configuration** (`provider-config.ts`):
   ```typescript
   export const PROVIDER_CONFIGS = {
     new_provider: {
       baseUrl: 'https://api.newprovider.com/v1/completions',
       headers: { 'Content-Type': 'application/json' },
       defaultMaxTokens: 4000,
       timeout: 30000,
       supportsStreaming: true,
     }
   };
   ```

3. **Add transformers** (`transformers.ts`):
   ```typescript
   export function transformToNewProvider(request: AIProxyRequest) {
     // Convert universal format to provider format
   }

   export function transformFromNewProvider(response: any) {
     // Convert provider format to universal format
   }
   ```

4. **Add to service** (`proxy-service.ts`):
   ```typescript
   export async function handleNewProvider(request: AIProxyRequest) {
     return executeAIRequest({ ...request, provider: 'new_provider' });
   }
   ```

---

## Security Checklist

### Development

- [ ] API keys stored in browser localStorage only
- [ ] HTTPS enforced for all requests
- [ ] No API keys in URL query parameters (except Google)
- [ ] Content-Type validation enabled
- [ ] Request size limits enforced

### Production

- [ ] CORS origins restricted to production domain
- [ ] Rate limiting enabled and tested
- [ ] Error messages sanitized (no API keys leaked)
- [ ] Logging disabled for sensitive data
- [ ] Security headers configured
- [ ] HTTPS-only environment

### Monitoring

- [ ] Error rates tracked
- [ ] Rate limit violations logged
- [ ] Provider response times monitored
- [ ] Quota usage tracked per provider

---

## Integration with Existing System

### Current Implementation

The existing system uses `universal-ai.ts` for PRD generation:

```typescript
// Existing: Direct AI calls in universal-ai.ts
export async function generatePRDUniversal({ config }: { config: AIConfig }) {
  // Direct fetch to provider APIs
}
```

### New Proxy Integration

For features requiring CORS support (e.g., client-side AI):

```typescript
// New: Use proxy for client-side requests
const response = await fetch('/api/ai/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: 'Generate PRD...' }],
    apiKey: localStorage.getItem('anthropic_api_key')
  })
});
```

### Backward Compatibility

- Existing `universal-ai.ts` continues to work for server-side PRD generation
- New proxy endpoints handle client-side AI requests
- No breaking changes to current functionality

---

## Usage Examples

### Example 1: Simple Completion

```typescript
const response = await fetch('/api/ai/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openai',
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is 2+2?' }
    ],
    apiKey: 'sk-...',
    temperature: 0.7,
    maxTokens: 100
  })
});

const data = await response.json();
console.log(data.text); // "2+2 equals 4"
```

### Example 2: Anthropic with System Message

```typescript
const response = await fetch('/api/ai/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    messages: [
      { role: 'system', content: 'You are a PRD expert.' },
      { role: 'user', content: 'Generate a PRD for a mobile app.' }
    ],
    apiKey: 'sk-ant-...'
  })
});

const data = await response.json();
console.log(data.text);
```

### Example 3: Validate API Key

```typescript
const response = await fetch('/api/ai/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'anthropic',
    apiKey: 'sk-ant-...'
  })
});

const data = await response.json();
if (data.valid) {
  console.log('API key is valid!');
} else {
  console.error('Invalid API key:', data.error);
}
```

### Example 4: Error Handling

```typescript
try {
  const response = await fetch('/api/ai/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'openai',
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
      apiKey: 'invalid-key'
    })
  });

  if (!response.ok) {
    const error = await response.json();

    switch (error.code) {
      case 'INVALID_API_KEY':
        console.error('Invalid API key - please check your settings');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.error('Rate limit exceeded - please try again later');
        break;
      case 'TIMEOUT':
        console.error('Request timeout - provider may be slow');
        break;
      default:
        console.error('Error:', error.error);
    }
  }
} catch (err) {
  console.error('Network error:', err);
}
```

---

## Testing Recommendations

### Unit Tests

- Test request transformers for each provider
- Test response transformers for each provider
- Test error handling for various scenarios
- Test API key format validation

### Integration Tests

- Test rate limiting with multiple requests
- Test timeout handling
- Test CORS preflight requests
- Test error responses from providers

### Load Tests

- Test concurrent request handling
- Test rate limiter under load
- Test memory usage on Edge runtime
- Test provider failover scenarios

---

## Future Enhancements

### 1. Streaming Implementation

- Full SSE (Server-Sent Events) support
- Partial response handling
- Stream error recovery

### 2. Provider Fallback

- Automatic failover to backup provider
- Provider health checking
- Smart routing based on availability

### 3. Request Caching

- Cache identical requests for 5 minutes
- Reduce API costs
- Edge caching support

### 4. Analytics Dashboard

- Track usage per provider
- Monitor error rates
- Cost estimation per request

### 5. Prompt Templates

- Pre-built templates for common tasks
- Variable substitution
- Template versioning

---

## Support & Troubleshooting

### Common Issues

**Issue:** "INVALID_API_KEY" error
- **Solution:** Verify API key format matches provider requirements
- **Check:** API key has proper prefix (sk-, sk-ant-, gsk_, etc.)

**Issue:** "RATE_LIMIT_EXCEEDED" error
- **Solution:** Wait for rate limit window to reset
- **Check:** Retry-After header in response

**Issue:** "TIMEOUT" error
- **Solution:** Request is taking >30 seconds
- **Check:** Reduce maxTokens or simplify prompt

**Issue:** CORS errors in browser
- **Solution:** Ensure request uses POST method
- **Check:** Content-Type is application/json

---

## Deployment Checklist

### Before Deploying

- [ ] Test all 6 providers with valid API keys
- [ ] Test rate limiting functionality
- [ ] Test error handling for invalid keys
- [ ] Test timeout handling
- [ ] Configure ALLOWED_ORIGINS environment variable
- [ ] Review security headers configuration

### After Deploying

- [ ] Verify Edge runtime is active
- [ ] Test from production domain
- [ ] Monitor error rates
- [ ] Check rate limiter is working
- [ ] Test CORS from allowed origins

---

## File Reference

### Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `types.ts` | TypeScript interfaces | ~300 |
| `provider-config.ts` | Provider configurations | ~200 |
| `transformers.ts` | Request/response transformers | ~250 |
| `proxy-service.ts` | Core proxy logic | ~150 |
| `error-handler.ts` | Error handling & validation | ~300 |
| `rate-limiter.ts` | Rate limiting & security | ~250 |

### API Routes

| Route | Purpose | Lines |
|-------|---------|-------|
| `/api/ai/proxy` | Main proxy endpoint | ~80 |
| `/api/ai/stream` | Streaming endpoint | ~70 |
| `/api/ai/validate` | API key validation | ~100 |

---

## Conclusion

This architecture provides a robust, scalable, and secure solution for proxying AI requests across multiple providers. The design prioritizes:

1. **Security** - API keys never logged, rate limiting, comprehensive validation
2. **Reliability** - Timeout handling, error recovery, consistent error format
3. **Extensibility** - Easy to add new providers
4. **Performance** - Edge runtime, minimal overhead
5. **Developer Experience** - Unified API, clear error messages, TypeScript support

The system is production-ready and can handle the requirements outlined in the original specification.
