# AI Provider Models Reference

## Current Model List (Updated October 2025)

### 🤖 OpenAI
**Latest Models (Recommended):**
- `gpt-4o` - Most capable, multimodal, faster than GPT-4 Turbo
- `gpt-4-turbo` - High intelligence, good for complex tasks
- `gpt-4` - Reliable, widely tested
- `gpt-3.5-turbo` - Fast, cost-effective

**Best for PRD Generation:** `gpt-4o` or `gpt-4-turbo`

---

### 🧠 Anthropic Claude
**Latest Models (Recommended):**
- `claude-3-5-sonnet-20241022` - Best balance of intelligence & speed (Recommended)
- `claude-3-opus-20240229` - Most capable, best for complex reasoning
- `claude-3-sonnet-20240229` - Balanced performance
- `claude-3-haiku-20240307` - Fast, efficient

**Best for PRD Generation:** `claude-3-5-sonnet-20241022`

**Note:** Model names include version dates for reproducibility.

---

### 🌟 Google Gemini
**Latest Models (2025 - Recommended):**
- `gemini-2.5-pro` - Most capable, advanced reasoning, coding (Recommended)
- `gemini-2.5-flash` - Balanced speed/performance, 1M token context
- `gemini-2.5-flash-lite` - Fastest, most cost-efficient, high-volume tasks

**Stable Models (Still Supported):**
- `gemini-1.5-pro` - Previous generation, stable, 1M token context
- `gemini-1.5-flash` - Previous generation, fast

**Deprecated Models (DO NOT USE):**
- ❌ `gemini-pro` - No longer supported by API
- ❌ `gemini-pro-vision` - Replaced by newer models
- ❌ `gemini-1.5-pro-latest` - Use specific version names
- ❌ `gemini-2.0-flash-exp` - Experimental, replaced by 2.5

**Best for PRD Generation:** `gemini-2.5-pro`

**API Endpoint:** `https://generativelanguage.googleapis.com/v1/models/`

**Key Features:**
- Huge context window (1M tokens)
- Multimodal (text, images, audio, video)
- Free tier available
- State-of-the-art performance
- Fast inference

---

### 💻 DeepSeek
**Latest Models:**
- `deepseek-chat` - General purpose, good reasoning
- `deepseek-coder` - Optimized for code generation

**Best for PRD Generation:** `deepseek-chat`

**Key Features:**
- Cost-effective
- Good for technical content
- Chinese company, competitive pricing

---

### ⚡ Groq
**Latest Models (Ultra-Fast Inference):**
- `llama-3.3-70b-versatile` - Latest Llama 3.3, best quality (Recommended)
- `llama-3.1-70b-versatile` - Llama 3.1, very fast
- `mixtral-8x7b-32768` - Good for long context (32K tokens)
- `gemma2-9b-it` - Small, efficient

**Best for PRD Generation:** `llama-3.3-70b-versatile`

**Key Features:**
- Extremely fast inference (500+ tokens/sec)
- Free tier available
- Custom hardware acceleration

---

### 🤝 Together AI
**Latest Models:**
- `meta-llama/Llama-3.3-70B-Instruct-Turbo` - Latest Llama, optimized (Recommended)
- `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` - Llama 3.1
- `mistralai/Mixtral-8x7B-Instruct-v0.1` - Mixture of Experts

**Best for PRD Generation:** `meta-llama/Llama-3.3-70B-Instruct-Turbo`

**Key Features:**
- Multiple open-source models
- Competitive pricing
- Good for experimentation

---

## Recommendations by Use Case

### 💰 Best Cost/Performance
1. **Google Gemini** - `gemini-2.5-flash-lite` (Fastest, most cost-efficient, free tier)
2. **Groq** - `llama-3.3-70b-versatile` (Free tier, ultra-fast)
3. **DeepSeek** - `deepseek-chat` (Very affordable)

### 🏆 Best Quality
1. **Anthropic** - `claude-3-5-sonnet-20241022` (Best reasoning)
2. **Google** - `gemini-2.5-pro` (State-of-the-art, advanced reasoning)
3. **OpenAI** - `gpt-4o` (Most capable, multimodal)

### ⚡ Fastest
1. **Groq** - `llama-3.3-70b-versatile` (500+ tokens/sec)
2. **Google** - `gemini-2.5-flash-lite` (Fastest in 2.5 family)
3. **Google** - `gemini-2.5-flash` (Balanced speed/quality)

### 🆓 Free Tier Available
1. **Google Gemini** - Generous free tier
2. **Groq** - Free tier with rate limits
3. **OpenAI** - Free trial credits

---

## Model Changes & Deprecations

### January 2025 Updates

**Google Gemini - 2.5 Family Released:**
- ✅ **NEW**: `gemini-2.5-pro` (Most capable, advanced reasoning)
- ✅ **NEW**: `gemini-2.5-flash` (Balanced speed/performance)
- ✅ **NEW**: `gemini-2.5-flash-lite` (Fastest, most cost-efficient)
- ✅ Stable: `gemini-1.5-pro`, `gemini-1.5-flash` (Still supported)
- ❌ Deprecated: `gemini-pro`, `gemini-pro-vision`, `gemini-1.5-pro-latest`, `gemini-2.0-flash-exp`
- 🔄 API Version: Use `v1` (not `v1beta`)

**Anthropic Claude:**
- ✅ Added: `claude-3-5-sonnet-20241022` (latest & best)
- 📝 Note: All models now include version dates

**OpenAI:**
- ✅ Added: `gpt-4o` (most capable)
- 📝 Note: `gpt-4-turbo` is now stable

**Groq:**
- ✅ Added: `llama-3.3-70b-versatile` (latest Llama)
- 📝 Note: Ultra-fast inference on custom hardware

**Together AI:**
- ✅ Added: `Llama-3.3-70B-Instruct-Turbo`
- 📝 Note: Model names include full paths

---

## Testing Recommendations

When switching providers, test with a simple project first:

1. Configure AI settings with your API key
2. Create a test project
3. Generate PRD and tasks
4. Compare quality, speed, and cost
5. Choose your preferred provider

**Pro Tip:** Keep multiple API keys configured and switch based on:
- **Speed needed** → Groq or Gemini 2.5 Flash-Lite
- **Quality needed** → Claude 3.5 Sonnet or Gemini 2.5 Pro
- **Long context** → Gemini 2.5 Pro (1M tokens)
- **Budget** → Gemini 2.5 Flash-Lite (free tier) or DeepSeek

---

## API Key Management

### Security Best Practices
- ✅ Store keys in localStorage (client-side only)
- ✅ Never commit keys to git
- ✅ Rotate keys regularly
- ✅ Use separate keys for dev/prod
- ✅ Monitor usage dashboards

### Getting API Keys
1. **OpenAI**: https://platform.openai.com/api-keys
2. **Anthropic**: https://console.anthropic.com/settings/keys
3. **Google**: https://aistudio.google.com/app/apikey
4. **DeepSeek**: https://platform.deepseek.com/api-keys
5. **Groq**: https://console.groq.com/keys
6. **Together**: https://api.together.xyz/settings/api-keys

---

**Last Updated:** January 15, 2025 (Gemini 2.5 Family Update)  
**Next Review:** Check for updates monthly

