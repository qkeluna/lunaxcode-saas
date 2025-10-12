# Lunaxcode - AI-Powered Project Management SaaS

AI-powered project management system for Filipino web development agencies using Next.js 15, Cloudflare Workers, D1, R2, and Google Gemini AI.

## Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)
- Google Cloud project (for OAuth and Gemini API)
- PayMongo account (for payments)

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd lunaxcode-saas

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Login to Cloudflare
wrangler login

# 5. Create D1 database
wrangler d1 create lunaxcode-dev

# 6. Update wrangler.toml with database ID from output

# 7. Run migrations
wrangler d1 migrations apply lunaxcode-dev --local

# 8. Create R2 bucket
wrangler r2 bucket create lunaxcode-files

# 9. Start development server
npm run dev
```

### Create First Admin User

```bash
# 1. Start dev server
npm run dev

# 2. Go to http://localhost:3000/login and sign in with Google

# 3. Set admin role
wrangler d1 execute lunaxcode-dev --local --command="UPDATE users SET role='admin' WHERE email='YOUR_EMAIL@gmail.com'"
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Runtime**: Cloudflare Workers (Edge)
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Storage**: Cloudflare R2
- **Auth**: NextAuth.js + Google OAuth
- **AI**: Google Gemini API
- **Payments**: PayMongo
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui components

## Project Structure

```
lunaxcode/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Auth pages (login)
│   │   ├── (dashboard)/  # Client dashboard
│   │   ├── (admin)/      # Admin dashboard
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── dashboard/   # Dashboard components
│   └── lib/             # Utilities
│       ├── db/          # Database schema & client
│       ├── auth.ts      # NextAuth config
│       └── utils.ts     # Helper functions
├── migrations/          # D1 database migrations
├── scripts/            # Utility scripts
└── public/            # Static assets
```

## Development Commands

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

# Database
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
npm run db:push       # Push schema changes
npm run db:studio     # Open Drizzle Studio
```

## Features

### Current (Phase 1 - Foundation)
- ✅ Next.js 15 with TypeScript
- ✅ Cloudflare Workers deployment
- ✅ D1 database with Drizzle ORM
- ✅ Google OAuth authentication
- ✅ Protected routes with middleware
- ✅ Dashboard layout with sidebar
- ✅ Responsive design

### Next Steps (Phase 2-7)
- 🔄 Google Gemini AI integration
- 🔄 Project onboarding form
- 🔄 AI-generated PRD & tasks
- 🔄 Task management system
- 🔄 PayMongo payment integration
- 🔄 Admin dashboard
- 🔄 CMS system

## Environment Variables

See `.env.example` for required environment variables.

### Required API Keys

1. **NextAuth Secret**: Generate with `openssl rand -base64 32`
2. **Google OAuth**: Get from [Google Cloud Console](https://console.cloud.google.com)
3. **Gemini API**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. **PayMongo**: Get from [PayMongo Dashboard](https://dashboard.paymongo.com)

## Deployment

### Production Deployment

```bash
# 1. Create production database
wrangler d1 create lunaxcode-prod

# 2. Update wrangler.toml with production database ID

# 3. Run migrations
wrangler d1 migrations apply lunaxcode-prod

# 4. Set production secrets
wrangler secret put NEXTAUTH_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put PAYMONGO_PUBLIC_KEY
wrangler secret put PAYMONGO_SECRET_KEY
wrangler secret put PAYMONGO_WEBHOOK_SECRET

# 5. Build and deploy
npm run build
wrangler pages deploy .vercel/output/static
```

## Documentation

See `docs/` directory for complete development plan and implementation details.

- `lunaxcode_complete_plan.txt` - Complete 34-task development plan
- `CLAUDE.md` - Claude Code integration guide

## License

MIT

## Support

For issues and questions, please check the documentation in `docs/` or refer to `CLAUDE.md` for AI-assisted development guidance.
