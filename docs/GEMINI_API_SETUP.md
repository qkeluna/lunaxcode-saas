# Gemini API Setup Guide

**Required for AI-powered PRD and Task Generation**

---

## Why You Need This

The Gemini API key enables:
- ✅ **Automatic PRD Generation** - AI creates comprehensive Project Requirements Documents
- ✅ **Task Breakdown** - AI generates 15-25 actionable development tasks
- ✅ **Smart Estimates** - AI provides realistic time and effort estimates

Without the API key, projects will be created but won't have AI-generated content.

---

## Step 1: Get Your Gemini API Key

### Option A: Google AI Studio (Recommended - Free Tier Available)

1. **Go to Google AI Studio**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Sign in with your Google Account**

3. **Create API Key**
   - Click "Get API Key" or "Create API Key"
   - Choose "Create API key in new project" (or use existing project)
   - Copy your API key (starts with `AIza...`)

4. **Important**: Keep this key secure! Don't commit it to git or share publicly.

### Free Tier Limits:
- ✅ 60 requests per minute
- ✅ Perfect for small-medium agencies
- ✅ No credit card required

---

## Step 2: Set API Key in Cloudflare (Production)

### Using Wrangler CLI (Recommended)

```bash
# Navigate to your project
cd /path/to/lunaxcode-saas

# Set the secret (you'll be prompted to enter the value)
npx wrangler secret put GEMINI_API_KEY --env production

# When prompted, paste your API key and press Enter
```

### Using Cloudflare Dashboard

1. **Go to Cloudflare Pages Dashboard**
   ```
   https://dash.cloudflare.com/
   ```

2. **Navigate to Your Project**
   - Click on "Pages"
   - Select "lunaxcode-saas"

3. **Go to Settings**
   - Click "Settings" tab
   - Scroll to "Environment variables"

4. **Add Secret**
   - Click "Add variable"
   - Variable name: `GEMINI_API_KEY`
   - Value: Your Gemini API key (paste it)
   - Environment: `Production` (check the box)
   - Click "Save"

5. **Redeploy**
   - After adding the secret, trigger a redeploy
   - Or push any commit to trigger auto-deployment

---

## Step 3: Set API Key for Local Development

### For Local Testing

1. **Create/Edit `.env.local` file** in your project root:

```bash
# .env.local
GEMINI_API_KEY=your_actual_api_key_here
```

2. **Make sure `.env.local` is in `.gitignore`** (it should be already)

3. **Restart your dev server**:
```bash
npm run dev
```

---

## Step 4: Verify It's Working

### Test PRD Generation:

1. **Create a test project**:
   - Go to `/onboarding`
   - Select a service type
   - Fill in project details
   - Submit

2. **Check the project page**:
   - Navigate to `/projects/[id]`
   - You should see a fully generated PRD
   - Tasks should be listed below

3. **Check Logs** (if using local dev):
   ```bash
   # In your terminal where dev server is running, you should see:
   ✅ Project created: [ID]
   🤖 AI generation started in background
   🤖 Generating PRD for project [ID]...
   ✅ PRD generated (X characters)
   ✅ PRD saved to database
   🤖 Generating tasks for project [ID]...
   ✅ X tasks generated
   ✅ All tasks saved to database
   ```

---

## Troubleshooting

### Problem: "GEMINI_API_KEY not found" Warning

**Solution:**
- Check that you set the secret in Cloudflare
- Verify environment is "Production"
- Redeploy your app after setting the secret
- For local dev, check `.env.local` exists and has the key

### Problem: "API key not valid"

**Solution:**
- Verify your API key is correct (copy it again from Google AI Studio)
- Make sure there are no extra spaces or newlines
- Check that your Google Cloud project has Gemini API enabled

### Problem: "Quota exceeded"

**Solution:**
- You've hit the free tier limit (60 requests/minute)
- Wait a minute and try again
- Consider upgrading to paid tier if needed
- Or implement rate limiting in your app

### Problem: PRD is Empty or Shows Error

**Check these:**
1. **API Key Set?**
   ```bash
   # List secrets (production)
   npx wrangler secret list --env production
   
   # You should see: GEMINI_API_KEY (cannot view value)
   ```

2. **Check Deployment Logs**
   - Go to Cloudflare Pages dashboard
   - Click on your project
   - View deployment logs
   - Look for AI generation messages

3. **Test Locally First**
   - Set up `.env.local`
   - Run `npm run dev`
   - Create a test project
   - Watch terminal for errors

---

## API Key Security Best Practices

### ✅ DO:
- Store in Cloudflare Secrets (encrypted)
- Use `.env.local` for local development
- Keep `.env.local` in `.gitignore`
- Rotate keys periodically
- Monitor usage in Google AI Studio

### ❌ DON'T:
- Commit API keys to git
- Share keys publicly
- Use the same key across multiple projects
- Expose keys in client-side code
- Store keys in plain text files

---

## Cost Estimation

### Free Tier (Current):
- **60 requests per minute**
- **1,500 requests per day** (approx)
- Each project creation = 2 requests (PRD + Tasks)
- **~750 projects per day** maximum

### Paid Tier (If Needed):
- Check current pricing: https://ai.google.dev/pricing
- Pay-as-you-go model
- Usually $0.00025 per 1K characters (very affordable)

---

## Alternative: Manual PRD Entry

If you prefer not to use AI generation:

1. **Don't set GEMINI_API_KEY**
2. Projects will still be created
3. PRD will show a placeholder message
4. You can manually edit the PRD field in the database
5. Or build a manual PRD editor in the UI (future enhancement)

---

## Quick Command Reference

```bash
# Set production secret
npx wrangler secret put GEMINI_API_KEY --env production

# List secrets
npx wrangler secret list --env production

# Delete secret (if needed)
npx wrangler secret delete GEMINI_API_KEY --env production

# Test locally
echo "GEMINI_API_KEY=your_key" >> .env.local
npm run dev

# Check if secret is working (look for logs)
npx wrangler pages deployment tail
```

---

## Support

**Questions?**
- Google AI Studio Docs: https://ai.google.dev/tutorials/setup
- Cloudflare Secrets Docs: https://developers.cloudflare.com/workers/configuration/secrets/
- Check deployment logs in Cloudflare dashboard

---

**Your Gemini API integration is essential for the best user experience! Set it up now to enable AI-powered project generation. 🚀**

