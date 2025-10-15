# Universal AI Settings

## Overview

Instead of storing AI API keys on Cloudflare servers, Lunaxcode now supports **client-side AI configuration** where administrators can choose their preferred AI provider and store API keys securely in their browser's localStorage.

## Supported AI Providers

| Provider | Models | API Docs |
|----------|--------|----------|
| **OpenAI** | gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo | https://platform.openai.com/api-keys |
| **Anthropic Claude** | claude-3-5-sonnet-20241022, claude-3-opus-20240229, claude-3-haiku-20240307 | https://console.anthropic.com/settings/keys |
| **Google Gemini** | gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-1.5-pro | https://aistudio.google.com/app/apikey |
| **DeepSeek** | deepseek-chat, deepseek-coder | https://platform.deepseek.com/api-keys |
| **Groq** | llama-3.3-70b-versatile, llama-3.1-70b-versatile, mixtral-8x7b-32768 | https://console.groq.com/keys |
| **Together AI** | meta-llama/Llama-3.3-70B-Instruct-Turbo, meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo | https://api.together.xyz/settings/api-keys |

## How It Works

### 1. Admin Configuration
- Navigate to **Admin Dashboard → Settings → AI Settings**
- Select your preferred AI provider
- Choose a model
- Enter your API key
- Click "Save API Key"

### 2. Secure Storage
- API keys are stored in browser's `localStorage`
- Never transmitted to Lunaxcode servers
- Only used to call AI providers directly from browser

### 3. PRD Generation
- When admin clicks "Generate PRD" in Projects Management
- Modal retrieves AI config from localStorage
- Sends config to `/api/admin/projects/[id]/generate-prd` endpoint
- Endpoint calls the selected AI provider directly
- PRD and tasks are generated and saved to database

## Security Features

✅ **Client-Side Storage** - Keys never touch our servers
✅ **Direct API Calls** - Your browser calls AI providers directly  
✅ **Admin-Only Access** - Only administrators can configure and use AI generation
✅ **Provider Choice** - Use any AI provider you prefer
✅ **Cost Control** - You control your own API usage and billing

## Storage Keys

The following keys are stored in localStorage:

```javascript
localStorage.getItem('ai_provider')  // e.g., 'openai', 'anthropic', 'google'
localStorage.getItem('ai_api_key')   // Your API key
localStorage.getItem('ai_model')     // Selected model
```

## API Integration

### Frontend (GeneratePRDModal.tsx)
```typescript
const aiProvider = localStorage.getItem('ai_provider');
const aiApiKey = localStorage.getItem('ai_api_key');
const aiModel = localStorage.getItem('ai_model');

const response = await fetch(`/api/admin/projects/${projectId}/generate-prd`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    aiConfig: {
      provider: aiProvider,
      apiKey: aiApiKey,
      model: aiModel
    }
  })
});
```

### Backend (generate-prd/route.ts)
```typescript
const body = await request.json();
const aiConfig = body.aiConfig;

const prd = await generatePRDUniversal({
  serviceName: project.service,
  description: project.description,
  questionAnswers: questionAnswers,
  config: aiConfig
});

const tasks = await generateTasksUniversal({
  prd,
  config: aiConfig
});
```

## Universal AI Service (universal-ai.ts)

The `universal-ai.ts` module handles all AI provider integrations:

- **OpenAI**: Uses `/v1/chat/completions` endpoint
- **Anthropic**: Uses `/v1/messages` endpoint with `x-api-key` header
- **Google Gemini**: Uses `/v1beta/models/:generateContent` with API key in URL
- **DeepSeek**: OpenAI-compatible endpoint
- **Groq**: OpenAI-compatible endpoint with ultra-fast inference
- **Together AI**: OpenAI-compatible endpoint

## Error Handling

The system provides helpful error messages:

| Error | Message | Solution |
|-------|---------|----------|
| No API key | "Please configure your AI provider in Settings → AI Settings first." | Configure AI in settings |
| Invalid API key | Provider-specific error | Check API key validity |
| Quota exceeded | "API quota exceeded" | Wait or upgrade plan |
| Network error | "Network error. Please try again." | Check internet connection |

## Benefits vs Server-Side Storage

### ✅ With Client-Side Storage (Current)
- **No server secrets** - Simplified deployment
- **Provider flexibility** - Switch providers anytime
- **Cost transparency** - You manage your own API usage
- **Security** - Keys never leave your browser
- **Multi-provider** - Support 6+ AI providers

### ❌ With Server-Side Storage (Old)
- Required Cloudflare secrets configuration
- Locked to single provider (Gemini)
- Shared API costs across all admins
- Keys stored on server
- Less flexibility

## Migration from Gemini-Only

If you were using the old Gemini-only system:

1. Go to **Admin → Settings → AI Settings**
2. Select "Google Gemini" as provider
3. Select **"gemini-2.5-pro"** as model (latest and best)
4. Enter your `GEMINI_API_KEY`
5. Save settings

**Important**: Google's latest models (2025):
- ✅ `gemini-2.5-pro` (recommended - best performance, advanced reasoning)
- ✅ `gemini-2.5-flash` (balanced - fast and efficient)
- ✅ `gemini-2.5-flash-lite` (fastest - cost-efficient, high-volume)
- ✅ `gemini-1.5-pro` (stable - still supported)
- ✅ `gemini-1.5-flash` (stable - still supported)
- ❌ `gemini-pro` (deprecated, no longer supported)

Your old Gemini setup will continue working with the new models, and you can also try other providers!

## Future Enhancements

Possible future improvements:

- [ ] Multiple API key profiles
- [ ] Team member API key sharing
- [ ] Usage analytics per provider
- [ ] Automatic failover between providers
- [ ] Cost estimation before generation
- [ ] Custom prompt templates

## Support

For issues:
1. Check browser console for errors
2. Verify API key is valid on provider's dashboard
3. Test API key directly with provider's API
4. Check provider's status page for outages

## Files Changed

- ✅ `src/app/(admin)/admin/settings/ai-settings/page.tsx` - AI Settings UI
- ✅ `src/lib/ai/universal-ai.ts` - Universal AI service
- ✅ `src/components/admin/GeneratePRDModal.tsx` - Modal with localStorage
- ✅ `src/app/api/admin/projects/[id]/generate-prd/route.ts` - Backend endpoint
- ✅ `src/components/admin/AdminSidebar.tsx` - Navigation link
- ✅ `docs/UNIVERSAL_AI_SETTINGS.md` - This documentation

---

**Last Updated**: October 15, 2025

