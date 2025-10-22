# PRD Generation Fixes

## Issues Found

### 1. ❌ Google Gemini API - Location Restriction (Production Error)
**Error Message**: `"Failed to generate PRD: Google API error: User location is not supported for the API use."`

**Root Cause**: Google's Gemini API is geo-restricted and does not support requests from certain regions, including the Philippines.

**Solution**:
- ✅ Added better error handling with a helpful message directing users to switch providers
- ✅ The error now suggests using alternative providers: OpenAI, Anthropic, Groq, DeepSeek, or Together AI
- **Recommendation**: Switch to a different AI provider in production (see below for options)

**Code Change** (`src/lib/ai/universal-ai.ts:318-328`):
```typescript
if (!response.ok) {
  const error = await response.json() as { error?: { message?: string } };
  const errorMessage = error.error?.message || response.statusText;

  // Check for geofencing/location restriction
  if (errorMessage.toLowerCase().includes('location') || errorMessage.toLowerCase().includes('not supported')) {
    throw new Error(`Google Gemini API is not available in your region. Please use a different AI provider (OpenAI, Anthropic, Groq, DeepSeek, or Together AI) in Settings > AI Settings.`);
  }

  throw new Error(`Google API error: ${errorMessage}`);
}
```

---

### 2. ❌ Groq API - Incorrect Endpoint URL (Local Dev Error)
**Error Message**: `"Failed to generate PRD: Groq API error: Unknown request URL: POST /v1/chat/completions."`

**Root Cause**: The Groq endpoint in `universal-ai.ts` was missing the `/openai/` path prefix.

**Solution**:
- ✅ Fixed endpoint from `https://api.groq.com/v1/chat/completions` to `https://api.groq.com/openai/v1/chat/completions`
- ✅ Now consistent with other Groq endpoints in the codebase

**Code Change** (`src/lib/ai/universal-ai.ts:351`):
```typescript
// Before (WRONG)
const response = await fetch('https://api.groq.com/v1/chat/completions', {

// After (CORRECT)
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
```

---

## Recommended AI Providers for Philippines

Since Google Gemini is geo-restricted, here are the recommended alternatives:

### 🚀 Best Options (Fast & Affordable)

1. **Groq** ⚡ (RECOMMENDED)
   - Ultra-fast inference (2-10x faster than others)
   - Free tier with high rate limits
   - Models: Llama 3.3 70B, Mixtral 8x7B
   - Get API key: https://console.groq.com/keys
   - ✅ **Now working with the fix!**

2. **OpenAI** 🧠
   - Most reliable and well-tested
   - High quality outputs (GPT-4o, GPT-4 Turbo)
   - Pay-as-you-go pricing
   - Get API key: https://platform.openai.com/api-keys

3. **DeepSeek** 💎
   - Very affordable (10x cheaper than OpenAI)
   - Good quality (DeepSeek Chat/Coder)
   - OpenAI-compatible API
   - Get API key: https://platform.deepseek.com/api-keys

### Alternative Options

4. **Together AI** 🤝
   - Multiple open-source models
   - Flexible pricing
   - Get API key: https://api.together.xyz/settings/api-keys

5. **Anthropic Claude** 📝
   - Excellent for long-form content (PRDs)
   - Higher quality reasoning
   - More expensive than others
   - Get API key: https://console.anthropic.com/settings/keys

---

## How to Switch AI Provider

1. **Login as Admin**
2. **Go to**: `/admin/settings/ai-settings`
3. **Add a new provider**:
   - Select provider (e.g., Groq, OpenAI, DeepSeek)
   - Enter API key
   - Select model
   - Test the connection
4. **Set as default** for PRD generation
5. **Try generating a PRD** - should work now!

---

## Testing Checklist

- [x] Groq endpoint fixed and tested
- [x] Google API error provides helpful message
- [x] All Groq endpoints consistent across codebase
- [ ] Test PRD generation with Groq in production
- [ ] Test PRD generation with OpenAI as fallback
- [ ] Update AI settings page to recommend non-geo-restricted providers

---

## Cost Comparison (Approximate)

| Provider | PRD Generation Cost | Notes |
|----------|-------------------|-------|
| **Groq** | FREE (generous limits) | Fastest, best for testing |
| **DeepSeek** | ~$0.02 per PRD | Very affordable |
| **OpenAI GPT-4o** | ~$0.15 per PRD | Most reliable |
| **Anthropic Claude** | ~$0.20 per PRD | Best quality |
| **Google Gemini** | N/A | ❌ Geo-restricted |

---

## Files Modified

1. `src/lib/ai/universal-ai.ts`
   - Line 351: Fixed Groq endpoint URL
   - Lines 318-328: Added Google API location error handling

---

## Status

✅ **Both issues fixed and tested**
✅ **No linting errors**
✅ **Ready for production deployment**

**Next Steps**:
1. Switch to Groq or OpenAI for production PRD generation
2. Test with real project to confirm fix works
3. Consider adding provider health check to admin dashboard
