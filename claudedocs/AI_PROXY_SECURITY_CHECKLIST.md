# AI Proxy Security Checklist

## Pre-Deployment Security Review

### API Key Security

- [ ] **Never log API keys** - Verify logging functions exclude API keys
- [ ] **Never store API keys on server** - Keys only in request body
- [ ] **Sanitize error messages** - Remove API keys from error responses
- [ ] **HTTPS only** - Enforce SSL/TLS for all requests
- [ ] **API key format validation** - Check format before making requests
- [ ] **No API keys in URLs** - Except Google Gemini (required by their API)

**Verification:**
```bash
# Check for accidental logging
grep -r "apiKey" src/lib/ai/*.ts | grep console.log
# Should return 0 results

# Check error handling sanitization
grep -r "sanitizeErrorMessage" src/lib/ai/error-handler.ts
# Should show sanitization function is used
```

---

### Rate Limiting

- [ ] **IP-based rate limiting enabled** - 20/min, 100/hour per IP
- [ ] **Rate limit store cleanup** - Automatic cleanup every 5 minutes
- [ ] **Retry-After headers** - Included in 429 responses
- [ ] **Rate limit bypass disabled** - No production bypass mechanisms
- [ ] **Cloudflare IP headers used** - CF-Connecting-IP for accurate IP detection

**Test:**
```bash
# Test rate limiting (should get 429 after 20 requests)
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/ai/proxy \
    -H "Content-Type: application/json" \
    -d '{"provider":"openai","model":"gpt-4o-mini","messages":[{"role":"user","content":"test"}],"apiKey":"test"}'
  echo "Request $i"
done
```

---

### Request Validation

- [ ] **Content-Type validation** - Must be application/json
- [ ] **Request size limit** - Max 1MB
- [ ] **Method validation** - POST only (and OPTIONS for CORS)
- [ ] **Schema validation** - All required fields present
- [ ] **Message content validation** - Non-empty strings only
- [ ] **Temperature bounds** - 0-2 range
- [ ] **MaxTokens bounds** - 1-100000 range

**Test:**
```typescript
// Invalid content type
fetch('/api/ai/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: 'invalid'
}); // Should return 415

// Missing required field
fetch('/api/ai/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ provider: 'openai' }) // Missing model, messages, apiKey
}); // Should return 400
```

---

### CORS Configuration

- [ ] **Allowed origins configured** - Set ALLOWED_ORIGINS env var in production
- [ ] **CORS headers present** - Access-Control-Allow-Origin, etc.
- [ ] **Preflight requests handled** - OPTIONS method supported
- [ ] **Credentials excluded** - No credentials in CORS requests
- [ ] **Max-Age set** - 86400 (24 hours)

**Production Configuration:**
```bash
# Set in Cloudflare Pages environment variables
ALLOWED_ORIGINS=https://lunaxcode-saas.pages.dev,https://www.lunaxcode.com

# Development (allow all)
ALLOWED_ORIGINS=*
```

---

### Security Headers

- [ ] **X-Content-Type-Options: nosniff** - Prevents MIME sniffing
- [ ] **X-Frame-Options: DENY** - Prevents clickjacking
- [ ] **X-XSS-Protection: 1; mode=block** - XSS protection
- [ ] **Referrer-Policy: strict-origin-when-cross-origin** - Limit referrer info
- [ ] **Content-Security-Policy** - (Optional) Configure if needed

**Verify:**
```bash
# Check response headers
curl -I -X POST http://localhost:3000/api/ai/proxy \
  -H "Content-Type: application/json" \
  -d '{}' | grep -E "X-|Referrer"
```

---

### Error Handling

- [ ] **Generic error messages** - No internal details exposed
- [ ] **Stack traces disabled** - Only in development
- [ ] **Error codes standardized** - Use AIErrorCode enum
- [ ] **Provider errors sanitized** - Remove sensitive info
- [ ] **Network errors caught** - No unhandled rejections

**Test:**
```typescript
// Should NOT expose stack trace in production
fetch('/api/ai/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'invalid_provider',
    model: 'test',
    messages: [],
    apiKey: 'test'
  })
}).then(r => r.json()).then(console.log);
// Response should have error message but no stack trace
```

---

### Timeout Handling

- [ ] **30-second timeout enforced** - All requests
- [ ] **AbortController used** - Clean cancellation
- [ ] **Timeout errors handled** - Returns 504 Gateway Timeout
- [ ] **No hanging requests** - All requests eventually complete or timeout

**Test:**
```typescript
// Mock slow provider (should timeout after 30s)
// This would require a test provider that deliberately delays
```

---

### Provider-Specific Security

#### OpenAI
- [ ] **Bearer token authentication** - Authorization header
- [ ] **API key format validated** - Starts with "sk-"

#### Anthropic
- [ ] **x-api-key header** - Correct header name
- [ ] **anthropic-version header** - Required version header
- [ ] **API key format validated** - Starts with "sk-ant-"

#### Google Gemini
- [ ] **API key in URL** - Query parameter (required by Google)
- [ ] **URL encoding** - API key properly encoded
- [ ] **API key format validated** - Starts with "AIza"

#### DeepSeek/Groq/Together
- [ ] **Bearer token authentication** - Authorization header
- [ ] **API key format validated** - Provider-specific prefixes

---

## Production Deployment Checklist

### Environment Configuration

- [ ] **ALLOWED_ORIGINS set** - Production domain only
- [ ] **NODE_ENV=production** - Production mode enabled
- [ ] **HTTPS enforced** - All traffic over SSL/TLS
- [ ] **Edge runtime active** - Verify edge deployment

**Cloudflare Pages Settings:**
```bash
# Environment Variables
NODE_ENV=production
ALLOWED_ORIGINS=https://lunaxcode-saas.pages.dev

# Build settings
Build command: npm run pages:build
Output directory: .next
Node version: 18
```

---

### Monitoring Setup

- [ ] **Error tracking enabled** - Monitor 4xx/5xx errors
- [ ] **Rate limit violations logged** - Track abuse attempts
- [ ] **Provider response times tracked** - Performance monitoring
- [ ] **API usage tracked** - Per-provider quota monitoring
- [ ] **Alert thresholds configured** - High error rates, slow responses

**Recommended Metrics:**
- Error rate by provider (target: <1%)
- Response time by provider (target: <2s p95)
- Rate limit violations per hour (investigate if >10/hour)
- Timeout rate (target: <0.5%)

---

### Testing Before Production

- [ ] **All 6 providers tested** - Valid API keys verified
- [ ] **Error scenarios tested** - Invalid keys, rate limits, timeouts
- [ ] **CORS tested** - From production domain
- [ ] **Rate limiting tested** - Verify limits work
- [ ] **Security headers verified** - All headers present
- [ ] **Performance tested** - Response times acceptable

**Test Script:**
```bash
#!/bin/bash
# test-ai-proxy.sh

ENDPOINT="http://localhost:3000/api/ai/proxy"

# Test OpenAI
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","model":"gpt-4o-mini","messages":[{"role":"user","content":"test"}],"apiKey":"YOUR_KEY"}'

# Test Anthropic
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"provider":"anthropic","model":"claude-3-5-sonnet-20241022","messages":[{"role":"user","content":"test"}],"apiKey":"YOUR_KEY"}'

# Test rate limiting
for i in {1..25}; do
  curl -s -X POST $ENDPOINT -H "Content-Type: application/json" -d '{}' | grep -q "RATE_LIMIT"
  if [ $? -eq 0 ]; then
    echo "Rate limit working at request $i"
    break
  fi
done

# Test CORS
curl -X OPTIONS $ENDPOINT -H "Origin: https://lunaxcode-saas.pages.dev" -I

# Test invalid API key
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","model":"gpt-4","messages":[{"role":"user","content":"test"}],"apiKey":"invalid"}'
```

---

## Incident Response Plan

### API Key Compromise

**If an API key is suspected to be compromised:**

1. **Immediate Actions:**
   - [ ] Rotate the compromised key with provider
   - [ ] Review logs for unauthorized usage
   - [ ] Calculate cost impact
   - [ ] Notify affected users

2. **Investigation:**
   - [ ] Identify how key was exposed
   - [ ] Check server logs for key in responses
   - [ ] Review error messages for key leakage
   - [ ] Audit all code for logging issues

3. **Prevention:**
   - [ ] Verify sanitization functions working
   - [ ] Update security checklist with new findings
   - [ ] Add automated tests for key leakage

---

### Rate Limit Abuse

**If rate limit violations are excessive:**

1. **Immediate Actions:**
   - [ ] Identify abusing IP addresses
   - [ ] Block malicious IPs at Cloudflare level
   - [ ] Review rate limit thresholds

2. **Investigation:**
   - [ ] Analyze request patterns
   - [ ] Determine if attack or legitimate spike
   - [ ] Check for distributed attacks

3. **Response:**
   - [ ] Adjust rate limits if needed
   - [ ] Implement IP allowlist for known good actors
   - [ ] Consider CAPTCHA for suspicious patterns

---

### Provider Outage

**If a provider is down or slow:**

1. **Immediate Actions:**
   - [ ] Monitor provider status page
   - [ ] Notify users of degraded service
   - [ ] Consider temporary fallback provider

2. **Mitigation:**
   - [ ] Implement provider health checks
   - [ ] Add automatic failover to backup provider
   - [ ] Cache recent responses for retries

3. **Communication:**
   - [ ] Status page update
   - [ ] User notifications
   - [ ] Expected resolution time

---

## Security Audit Frequency

### Daily
- [ ] Review error logs for anomalies
- [ ] Check rate limit violations
- [ ] Monitor provider response times

### Weekly
- [ ] Review security headers
- [ ] Audit CORS configuration
- [ ] Check for new provider vulnerabilities
- [ ] Test rate limiting functionality

### Monthly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review and update allowed origins
- [ ] Update provider API key rotation

### Quarterly
- [ ] Review all dependencies for vulnerabilities
- [ ] Update provider configurations
- [ ] Security team review
- [ ] Update incident response plan

---

## Compliance Checklist

### Data Privacy

- [ ] **No PII logged** - User messages not logged by default
- [ ] **API keys not stored** - Only passed through to providers
- [ ] **No user tracking** - IP only used for rate limiting
- [ ] **GDPR compliant** - No unnecessary data retention

### Terms of Service

- [ ] **Provider ToS reviewed** - Compliant with all provider policies
- [ ] **Usage limits documented** - Users aware of rate limits
- [ ] **Acceptable use policy** - Clear rules for API usage
- [ ] **Data retention policy** - Logs purged regularly

---

## Code Security Review

### Static Analysis

```bash
# Run ESLint security rules
npm run lint

# Check for known vulnerabilities
npm audit

# Check TypeScript strict mode
grep "strict" tsconfig.json

# Check for console.log with sensitive data
grep -r "console.log.*apiKey" src/
```

### Manual Review Points

- [ ] **No hardcoded secrets** - All keys from environment/request
- [ ] **Input sanitization** - All user input validated
- [ ] **Output encoding** - Error messages sanitized
- [ ] **Dependency updates** - All packages up to date
- [ ] **TypeScript strict mode** - Enabled for type safety

---

## Emergency Contacts

**In case of security incident:**

1. **Technical Lead:** [Name] - [Email]
2. **Security Team:** [Email]
3. **Provider Support:**
   - OpenAI: platform.openai.com/support
   - Anthropic: support.anthropic.com
   - Google: cloud.google.com/support

**Escalation Path:**
1. Development team (0-1 hour)
2. Technical lead (1-4 hours)
3. Security team (4+ hours or data breach)

---

## Post-Deployment Verification

**After deploying to production:**

```bash
# 1. Test basic functionality
curl -X POST https://lunaxcode-saas.pages.dev/api/ai/proxy \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","model":"gpt-4o-mini","messages":[{"role":"user","content":"test"}],"apiKey":"YOUR_KEY"}'

# 2. Verify security headers
curl -I https://lunaxcode-saas.pages.dev/api/ai/proxy

# 3. Test CORS from production domain
# (Use browser dev tools to make cross-origin request)

# 4. Verify rate limiting
# (Make 25 requests rapidly and verify 429 response)

# 5. Test error handling
curl -X POST https://lunaxcode-saas.pages.dev/api/ai/proxy \
  -H "Content-Type: application/json" \
  -d '{"provider":"invalid"}'
# Should return 400 with proper error format

# 6. Monitor for 15 minutes
# Check Cloudflare Analytics for errors, response times
```

---

## Continuous Improvement

- [ ] **Security training** - Team educated on API security
- [ ] **Threat modeling** - Regular security reviews
- [ ] **Penetration testing** - Annual third-party audit
- [ ] **Bug bounty program** - Consider for production
- [ ] **Security newsletter** - Stay updated on AI API vulnerabilities

---

## Sign-off

**Security Review Completed By:**

- [ ] Developer: ________________ Date: ________
- [ ] Tech Lead: ________________ Date: ________
- [ ] Security: _________________ Date: ________

**Approved for Production Deployment:**

- [ ] Yes, all checks passed
- [ ] No, issues found (see notes below)

**Notes:**
_________________________________
_________________________________
_________________________________
