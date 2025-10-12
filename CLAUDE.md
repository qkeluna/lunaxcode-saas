# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lunaxcode is an AI-powered project management SaaS platform for Filipino web development agencies. The system automatically generates Project Requirements Documents (PRDs) and task breakdowns using Google Gemini AI, integrates PayMongo for Philippine payment methods, and provides client/admin dashboards.

**Current Status**: Codebase reset - ready for fresh implementation following the complete development plan in `docs/lunaxcode_complete_plan.txt`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Runtime**: Cloudflare Workers (Edge)
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: NextAuth.js with Google OAuth
- **AI**: Google Gemini API
- **Payments**: PayMongo (Philippine payment gateway)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Deployment**: Cloudflare Pages
- **CLI**: Wrangler

## Development Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Build for production
npm run start                  # Start production server

# Database (Drizzle + D1)
npm run db:generate           # Generate migrations from schema
npm run db:migrate            # Run migrations against D1
npm run db:push               # Push schema changes directly
npm run db:studio             # Open Drizzle Studio (visual DB editor)

# Wrangler (Cloudflare CLI)
wrangler d1 create <db-name>              # Create D1 database
wrangler d1 migrations apply <db-name>    # Apply migrations
wrangler d1 migrations apply <db-name> --local  # Apply to local DB
wrangler r2 bucket create <bucket-name>   # Create R2 bucket
wrangler secret put <SECRET_NAME>         # Set production secret
wrangler pages deploy                     # Deploy to Cloudflare Pages
wrangler login                            # Login to Cloudflare

# Linting & Formatting
npm run lint                 # Run ESLint
npm run format               # Format with Prettier

# Utility Scripts
npm run create-admin         # Create first admin user
```

## Architecture Overview

### High-Level Flow
```
Client Browser → Cloudflare Edge (Next.js) → D1 Database
                        ↓
        External Services (Google OAuth, Gemini AI, PayMongo)
                        ↓
                  R2 Storage (Files)
```

### Directory Structure (To Be Built)
```
lunaxcode/
├── app/
│   ├── (auth)/           # Login/signup pages
│   ├── (dashboard)/      # Client dashboard (protected)
│   ├── (admin)/          # Admin dashboard (admin only)
│   ├── (public)/         # Public pages (FAQ, terms, privacy)
│   ├── api/              # API routes
│   └── actions/          # Server actions
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard-specific components
│   ├── projects/         # Project management components
│   └── admin/            # Admin-specific components
├── lib/
│   ├── db/
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   ├── relations.ts  # Table relations
│   │   └── index.ts      # DB client
│   ├── gemini.ts         # Google Gemini AI integration
│   ├── paymongo.ts       # PayMongo SDK wrapper
│   └── utils.ts          # Utility functions
├── migrations/           # Database migrations (SQL)
├── public/               # Static assets
├── .env.local            # Local environment variables
├── .env.example          # Environment template
├── wrangler.toml         # Cloudflare configuration
└── docs/                 # Project documentation
```

### Key Pages & Routes

**Authentication:**
- `/login` - Google OAuth login
- `/signup` - User registration

**Client Dashboard:**
- `/dashboard` - Overview with stats
- `/projects` - All projects list
- `/projects/[id]` - Project detail (PRD, tasks, timeline)
- `/projects/[id]/messages` - Project messaging
- `/projects/[id]/payment` - Payment interface
- `/onboarding` - New project creation (3-step form)

**Admin Dashboard:**
- `/admin` - Overview & analytics
- `/admin/projects` - All projects management
- `/admin/clients` - Client management
- `/admin/payments` - Payment tracking
- `/admin/content` - CMS (services, FAQ, emails)
- `/admin/settings` - System configuration

**API Routes:**
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/projects` - Project CRUD
- `/api/payment` - Payment processing
- `/api/upload` - File upload to R2
- `/api/webhooks/paymongo` - Payment webhooks

## Database Schema

### Core Tables
- **users** - Authentication and user profiles (role: 'admin' | 'client')
- **projects** - Main project records with PRD, status, payment info
- **tasks** - AI-generated task breakdown for each project
- **payments** - Payment records linked to projects
- **files** - R2 file references for project uploads
- **messages** - Client-agency communication per project
- **service_types** - CMS for service offerings and pricing
- **faqs** - CMS for FAQ content

### Key Relationships
- User → Projects (one-to-many)
- Project → Tasks (one-to-many)
- Project → Payments (one-to-many)
- Project → Files (one-to-many)
- Project → Messages (one-to-many)

## Code Style & Patterns

### TypeScript
- Use TypeScript for all code
- Prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with interfaces

### React/Next.js
- Use functional and declarative programming patterns
- Avoid classes
- Minimize 'use client', 'useEffect', 'setState' - favor React Server Components (RSC)
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Use the "function" keyword for pure functions

### Naming Conventions
- Directories: lowercase with dashes (e.g., `components/auth-wizard`)
- Components: PascalCase files, named exports
- Variables: Descriptive with auxiliary verbs (e.g., `isLoading`, `hasError`)
- File structure: exported component → subcomponents → helpers → static content → types

### Styling
- Use Tailwind CSS with mobile-first approach
- Use shadcn/ui and Radix UI for components
- Implement responsive design (min 320px mobile support)

### Performance
- Optimize images: WebP format, include size data, lazy loading
- Optimize Web Vitals (LCP, CLS, FID)
- Use 'nuqs' for URL search parameter state management

## Environment Variables

Required in `.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl>

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>

# Google Gemini API (AI generation)
GEMINI_API_KEY=<from-google-ai-studio>

# PayMongo (Philippine payments)
PAYMONGO_PUBLIC_KEY=pk_test_<your-key>
PAYMONGO_SECRET_KEY=sk_test_<your-key>
PAYMONGO_WEBHOOK_SECRET=whsec_<your-secret>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Cloudflare-Specific Considerations

### D1 Database (Serverless SQLite)
- Use Drizzle ORM for all database operations
- Define schema in `lib/db/schema.ts` using Drizzle syntax
- Generate migrations with `npm run db:generate`
- Apply migrations with Wrangler CLI
- Local dev uses `.wrangler/state/v3/d1/miniflare-D1DatabaseObject`
- Production uses remote D1 database specified in `wrangler.toml`

### R2 Storage (Object Storage)
- Access via `getCloudflareContext()` in Edge runtime
- Store project files: `/projects/{projectId}/{timestamp}-{filename}`
- Generate signed URLs for secure access
- Configure CORS for direct browser uploads

### Edge Runtime
- API routes that use R2 must use `export const runtime = 'edge'`
- Access Cloudflare bindings via `getCloudflareContext()`
- Be mindful of Edge runtime limitations (no Node.js APIs)

### Wrangler Configuration
The `wrangler.toml` file should include:
- D1 database binding
- R2 bucket binding
- Environment-specific settings
- Compatibility flags for Next.js

## AI Integration (Google Gemini)

### Key Functions (lib/gemini.ts)
- `generatePRD()` - Creates comprehensive Project Requirements Document
- `generateTasks()` - Breaks down PRD into 15-25 structured tasks
- `estimatePrice()` - AI-powered pricing estimation based on scope

### AI Generation Flow
1. User submits onboarding form (service type, description, features, timeline)
2. System calls Gemini API to generate PRD (target: <30 seconds)
3. System generates task breakdown with estimates, dependencies, priorities
4. All saved to D1 database atomically
5. User redirected to project detail page

## Payment Integration (PayMongo)

### Supported Methods
- Credit/Debit Cards (Visa, Mastercard)
- GCash (e-wallet)
- PayMaya (e-wallet)

### Payment Flow
1. Client views project payment page
2. Selects payment method and amount
3. Creates payment intent via `/api/payment`
4. Redirects to PayMongo checkout (for e-wallets) or processes card (for cards)
5. Webhook receives payment confirmation
6. System updates project payment status
7. Client sees confirmation

### Webhook Security
- Always verify PayMongo signature in webhook handler
- Use `PAYMONGO_WEBHOOK_SECRET` for verification
- Update database only after successful verification

## Authentication & Authorization

### Roles
- **client** - Default role for new users, access to own projects only
- **admin** - Full system access, can view/edit all projects

### Middleware Protection
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires authentication + admin role
- `/projects/*` - Requires authentication + ownership check

### Session Management
- NextAuth.js with JWT strategy
- Google OAuth as primary provider
- Session includes user ID and role
- Session checks on both client and server side

## Development Workflow

### Starting Development
```bash
# 1. Clone and install
git clone <repo>
cd lunaxcode
npm install

# 2. Setup environment
cp .env.example .env.local
# Fill in all required API keys

# 3. Login to Cloudflare
wrangler login

# 4. Create local D1 database
wrangler d1 create lunaxcode-dev

# 5. Update wrangler.toml with database_id from output

# 6. Run migrations
wrangler d1 migrations apply lunaxcode-dev --local

# 7. Create R2 bucket
wrangler r2 bucket create lunaxcode-files

# 8. Create first admin user
npm run create-admin

# 9. Start dev server
npm run dev
```

### Implementation Sequence
Follow the 34-task plan in `docs/lunaxcode_complete_plan.txt`:
- **Phase 1**: Authentication (Tasks 1-5)
- **Phase 2**: AI Generation (Tasks 6-8)
- **Phase 3**: Client Dashboard (Tasks 9-16)
- **Phase 4**: Payment Integration (Tasks 17-20)
- **Phase 5**: Admin Dashboard (Tasks 21-26)
- **Phase 6**: CMS System (Tasks 27-31)
- **Phase 7**: Testing & Launch (Tasks 32-34)

### Branch Strategy
```bash
# Create feature branch per task
git checkout -b task-XXX-description

# Implement according to spec in plan document

# Test locally
npm run dev
npm run lint

# Commit with task number
git commit -m "TASK-XXX: Description"

# Merge to main
git checkout main
git merge task-XXX-description
```

## Testing Checklist

### Manual Testing Required
- [ ] Authentication flow (login/logout)
- [ ] Project creation with AI generation
- [ ] Task status updates
- [ ] File upload to R2
- [ ] Payment processing (all methods)
- [ ] Admin dashboard access control
- [ ] Responsive design (mobile/tablet/desktop)

### Performance Targets
- Page load: <2 seconds
- PRD generation: <30 seconds
- Concurrent projects: 50+
- Payment success rate: 99.9%

## Common Pitfalls

1. **Edge Runtime Errors**: Remember to add `export const runtime = 'edge'` for routes using R2/D1
2. **Database Schema Changes**: Always generate migrations, don't push directly in production
3. **Payment Webhooks**: Must verify signature before processing to prevent fraud
4. **Role Checks**: Always verify user role on server side, never trust client
5. **AI Generation Timeouts**: Implement proper loading states, AI calls can take 20-30 seconds
6. **File Upload Limits**: R2 has no size limits, but implement client-side validation
7. **Session Expiry**: Handle session expiry gracefully, redirect to login

## Deployment

### Production Deployment
```bash
# 1. Create production database
wrangler d1 create lunaxcode-prod

# 2. Run migrations
wrangler d1 migrations apply lunaxcode-prod

# 3. Set production secrets
wrangler secret put NEXTAUTH_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put PAYMONGO_PUBLIC_KEY
wrangler secret put PAYMONGO_SECRET_KEY
wrangler secret put PAYMONGO_WEBHOOK_SECRET

# 4. Build and deploy
npm run build
wrangler pages deploy
```

### Post-Deployment
- Configure custom domain in Cloudflare dashboard
- Set up error monitoring
- Enable analytics
- Test all critical flows in production
- Configure backup schedule for D1 database

## Support & Resources

- **Next.js 15 Docs**: https://nextjs.org/docs
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Cloudflare D1**: https://developers.cloudflare.com/d1
- **Cloudflare R2**: https://developers.cloudflare.com/r2
- **Drizzle ORM**: https://orm.drizzle.team
- **Google Gemini**: https://ai.google.dev
- **PayMongo**: https://developers.paymongo.com
- **shadcn/ui**: https://ui.shadcn.com

## Project Context

This is a complete rebuild following a comprehensive 34-task development plan. The plan document (`docs/lunaxcode_complete_plan.txt`) contains:
- Detailed architecture specifications
- Complete database schema with migrations
- Full implementation code for all 34 tasks
- Testing checklist
- Deployment procedures

Estimated total development time: ~29 hours for complete MVP.
