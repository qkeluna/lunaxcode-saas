# Cloudflare Deployment Guide

This guide explains how to deploy Lunaxcode SaaS to Cloudflare Pages with D1 Database and R2 Storage.

## Prerequisites

- Cloudflare account
- Wrangler CLI authenticated (`wrangler login`)
- GitHub repository connected to Cloudflare Pages

## Infrastructure Setup

### ✅ Already Configured

The following resources have been created:

#### D1 Databases
- **Development**: `lunaxcode-dev` (ID: `9ba54a27-7382-4499-a64e-4ed4b810e2b2`)
- **Production**: `lunaxcode-prod` (ID: `9b84ba4b-4654-44f9-bbbf-45b8454d321e`)

#### R2 Buckets
- **Development**: `lunaxcode-files-dev`
- **Production**: `lunaxcode-files-prod`

#### Database Schema
- ✅ Migrations applied to both databases
- ✅ 11 tables created (users, projects, tasks, payments, files, messages, etc.)

## Deployment Commands

### Development Deployment

```bash
# Deploy to development environment
npm run cf:deploy

# This runs:
# 1. npm run build (Next.js build)
# 2. wrangler pages deploy (Deploy to Cloudflare Pages)
```

### Production Deployment

```bash
# Deploy to production environment
npm run cf:deploy:prod

# This runs:
# 1. npm run build
# 2. wrangler pages deploy --env production
```

## Database Management

### Run Migrations

```bash
# Local development database
npm run d1:migrate:local

# Remote development database
npm run d1:migrate:dev

# Remote production database
npm run d1:migrate:prod
```

### Query Database

```bash
# View users in development
npm run d1:studio:dev

# View users in production
npm run d1:studio:prod

# Custom query (development)
npx wrangler d1 execute lunaxcode-dev --command="SELECT * FROM projects LIMIT 10"

# Custom query (production)
npx wrangler d1 execute lunaxcode-prod --command="SELECT * FROM projects LIMIT 10" --remote
```

## Environment Variables

### Required Secrets

Set these in Cloudflare Pages dashboard or via wrangler:

```bash
# Set production secrets
wrangler pages secret put AUTH_SECRET
wrangler pages secret put AUTH_GOOGLE_ID
wrangler pages secret put AUTH_GOOGLE_SECRET
wrangler pages secret put GEMINI_API_KEY
wrangler pages secret put PAYMONGO_PUBLIC_KEY
wrangler pages secret put PAYMONGO_SECRET_KEY
wrangler pages secret put PAYMONGO_WEBHOOK_SECRET
```

### Environment Variables in Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables
2. Add for **Production**:
   - `NEXTAUTH_URL` = `https://yourdomain.com`
   - `NODE_ENV` = `production`
3. Add for **Preview**:
   - `NEXTAUTH_URL` = `https://preview-branch.pages.dev`
   - `NODE_ENV` = `development`

## Cloudflare Pages Configuration

### Build Settings

- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `/`

### Bindings (Auto-configured via wrangler.toml)

#### Development
- **D1 Database**: `lunaxcode-dev` → Binding: `DB`
- **R2 Bucket**: `lunaxcode-files-dev` → Binding: `R2_BUCKET`

#### Production
- **D1 Database**: `lunaxcode-prod` → Binding: `DB`
- **R2 Bucket**: `lunaxcode-files-prod` → Binding: `R2_BUCKET`

## First Deployment Checklist

- [ ] Connect GitHub repository to Cloudflare Pages
- [ ] Set environment variables in Cloudflare Dashboard
- [ ] Set production secrets via wrangler
- [ ] Verify D1 database bindings in Pages settings
- [ ] Verify R2 bucket bindings in Pages settings
- [ ] Deploy to production: `npm run cf:deploy:prod`
- [ ] Test authentication flow
- [ ] Test project creation with AI generation
- [ ] Verify database writes are working
- [ ] Test file uploads to R2

## Custom Domain Setup

1. Go to Cloudflare Pages → Your Project → Custom domains
2. Add your domain (e.g., `lunaxcode.com`)
3. Cloudflare will automatically configure DNS
4. Update `NEXTAUTH_URL` environment variable to your domain
5. Update Google OAuth redirect URIs to include your domain

## Monitoring & Debugging

### View Logs

```bash
# Tail Pages logs
wrangler pages deployment tail

# View D1 queries
wrangler d1 execute lunaxcode-prod --command="SELECT COUNT(*) FROM projects"
```

### Check Database Size

```bash
# Development
wrangler d1 info lunaxcode-dev

# Production
wrangler d1 info lunaxcode-prod
```

### Backup Database

```bash
# Export production database
wrangler d1 execute lunaxcode-prod --command=".dump" --remote > backup.sql

# Restore from backup
wrangler d1 execute lunaxcode-prod --file=backup.sql --remote
```

## Troubleshooting

### Issue: "D1 database not available"

**Solution**: Verify bindings in Cloudflare Pages settings match `wrangler.toml`

### Issue: "Authentication fails in production"

**Solutions**:
1. Check `NEXTAUTH_URL` matches your domain
2. Verify Google OAuth redirect URIs include production URL
3. Ensure `AUTH_SECRET` is set in production

### Issue: "AI generation fails"

**Solution**: Verify `GEMINI_API_KEY` is set in Cloudflare Pages secrets

### Issue: "File uploads fail"

**Solutions**:
1. Check R2 bucket binding is configured
2. Verify CORS settings on R2 bucket if uploading from browser
3. Check file size limits

## Performance Optimization

### Enable Caching

Add caching headers in your Next.js config or middleware:

```typescript
// middleware.ts
export function middleware(request: Request) {
  const response = NextResponse.next();

  // Cache static assets
  if (request.url.includes('/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}
```

### Use Edge Runtime

For API routes that use D1 or R2:

```typescript
// app/api/projects/route.ts
export const runtime = 'edge'; // Enable edge runtime
```

## Cost Estimation

### Free Tier Includes:
- **Pages**: 500 builds/month, unlimited requests
- **D1**: 5M reads/day, 100k writes/day, 5GB storage
- **R2**: 10M reads/month, 1M writes/month, 10GB storage

### Estimated Monthly Cost (Low Traffic):
- **Pages**: $0 (within free tier)
- **D1**: $0 (within free tier)
- **R2**: $0 (within free tier)

### Estimated Monthly Cost (High Traffic - 10k users):
- **Pages**: $0-5
- **D1**: $5-15 (additional reads/writes)
- **R2**: $0-5 (additional storage/bandwidth)

**Total**: $5-25/month for production workload

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **D1 Docs**: https://developers.cloudflare.com/d1/
- **R2 Docs**: https://developers.cloudflare.com/r2/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

## Next Steps

1. Set up automatic deployments from GitHub
2. Configure production environment variables
3. Test the complete deployment
4. Set up monitoring and alerts
5. Configure custom domain
6. Enable Cloudflare Analytics
