# Cloudflare Pages Environment Variables Setup

## 🎯 Quick Guide: Add RESEND_API_KEY to Production

### Step-by-Step Instructions:

1. **Open Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com/

2. **Navigate to Your Project**
   - Click on **"Pages"** in the left sidebar
   - Find and click **"lunaxcode-saas"**

3. **Open Environment Variables Settings**
   - Click **"Settings"** tab
   - Scroll to **"Environment variables"** section
   - Click **"Add variable"** button

4. **Add RESEND_API_KEY**
   ```
   Variable name: RESEND_API_KEY
   Value: your_resend_api_key_here
   Environment: ✅ Production  ✅ Preview
   ```

5. **Save and Redeploy**
   - Click **"Save"** button
   - **Important:** Trigger a redeploy for changes to take effect:
     - **Option A:** Push a commit to GitHub (automatic deployment)
     - **Option B:** Manual redeploy from Cloudflare dashboard

## 📋 Complete Environment Variables Checklist

Make sure ALL these are set in Cloudflare Pages:

### Authentication & Session
- [ ] `NEXTAUTH_SECRET` - Your NextAuth secret
- [ ] `NEXTAUTH_URL` - https://lunaxcode-saas.pages.dev (or custom domain)
- [ ] `NEXT_PUBLIC_APP_URL` - https://lunaxcode-saas.pages.dev (or custom domain)

### Google OAuth
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

### AI Generation
- [ ] `GEMINI_API_KEY` - From Google AI Studio

### Payments (PayMongo)
- [ ] `PAYMONGO_PUBLIC_KEY` - From PayMongo dashboard
- [ ] `PAYMONGO_SECRET_KEY` - From PayMongo dashboard
- [ ] `PAYMONGO_WEBHOOK_SECRET` - From PayMongo webhook settings

### Email Service (Resend)
- [ ] `RESEND_API_KEY` - From Resend dashboard ⭐ **NEW!**

## 🔄 After Adding Variables

### Verify Deployment
1. Wait for automatic deployment to complete (if using GitHub)
2. Or manually trigger deployment from Cloudflare dashboard
3. Check deployment logs for any errors
4. Test the contact form on production site

### Test Contact Form
1. Visit: https://lunaxcode-saas.pages.dev
2. Click "Request Custom Quote" button
3. Fill out and submit the form
4. Check `lunaxcode2030@gmail.com` for the email
5. Verify success toast notification appears

## 🚨 Troubleshooting

### If emails don't send in production:

1. **Check Environment Variable**
   - Verify `RESEND_API_KEY` is set in Cloudflare Pages
   - Make sure it's enabled for both Production and Preview
   - Confirm the value matches your Resend API key

2. **Check Deployment Logs**
   - Go to Cloudflare Pages → Deployments
   - Click on latest deployment
   - Check build logs for errors
   - Look for "Email service not configured" errors

3. **Verify API Route**
   - Check if `/api/contact` endpoint is accessible
   - Test with: `curl https://lunaxcode-saas.pages.dev/api/contact`
   - Should return Method Not Allowed (we only accept POST)

4. **Check Resend Dashboard**
   - Login to https://resend.com/
   - Check "Logs" section for API calls
   - Verify account email matches: lunaxcode2030@gmail.com

## 💡 Pro Tips

- **Use both Production and Preview**: This ensures the contact form works in preview deployments too
- **Keep API keys secure**: Never commit API keys to git
- **Use different keys**: Consider using different API keys for Production vs Preview
- **Monitor Resend logs**: Check Resend dashboard regularly for delivery issues

## 📚 Related Documentation

- [CLAUDE.md - Deployment Section](../CLAUDE.md#deployment)
- [CONTACT_MODAL_SETUP.md](./CONTACT_MODAL_SETUP.md)
- [Cloudflare Pages Environment Variables Docs](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)
- [Resend Dashboard](https://resend.com/emails)
