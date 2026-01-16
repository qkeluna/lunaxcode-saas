# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lunaxcode is an AI-powered project management SaaS platform for Filipino web development agencies. The system automatically generates Project Requirements Documents (PRDs) and task breakdowns using AI, supports manual payment verification for Philippine payment methods (GCash, SeaBank, PayMaya, bank transfer), and provides client/admin dashboards.

**Current Status**: Core features implemented and deployed. Admin dashboard, CMS system, authentication, AI generation, messaging, and payment verification complete.

**Production URL**: https://app.lunaxcode.site

## Quick Reference

```bash
# Start development
npm run dev

# Build for Cloudflare (REQUIRED - not npm run build)
npm run pages:build

# Run tests
npm run test:run

# Deploy to production
npm run deploy

# Apply database migrations
npm run d1:migrate:prod
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Runtime**: Cloudflare Workers (Edge)
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: NextAuth.js with Google OAuth
- **AI**: Multi-provider support (Google Gemini, configurable via admin)
- **Payments**: Manual bank transfer verification (GCash, SeaBank, PayMaya, bank transfer)
- **Email**: Resend (for contact form)
- **Bot Protection**: Cloudflare Turnstile
- **Error Monitoring**: Sentry
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **Drag & Drop**: @dnd-kit
- **Testing**: Vitest + Testing Library
- **Deployment**: Cloudflare Pages
- **CLI**: Wrangler

## Development Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Build for production (use pages:build for Cloudflare)
npm run start                  # Start production server

# Testing (Vitest)
npm run test                   # Run tests in watch mode
npm run test:ui                # Run tests with UI
npm run test:run               # Run tests once
npm run test:coverage          # Run tests with coverage report

# Database (Drizzle + D1)
npm run db:generate           # Generate migrations from schema
npm run db:migrate            # Run migrations against D1
npm run db:push               # Push schema changes directly
npm run db:studio             # Open Drizzle Studio (visual DB editor)
npm run db:seed               # Seed local database with sample data
npm run db:seed:dev           # Seed remote dev database
npm run db:seed:prod          # Seed remote production database
npm run d1:migrate:local      # Apply migrations to local D1
npm run d1:migrate:dev        # Apply migrations to remote dev D1
npm run d1:migrate:prod       # Apply migrations to remote production D1

# Cloudflare (Wrangler CLI)
npm run pages:build               # Build for Cloudflare Pages (USE THIS, not npm run build)
npm run preview                   # Preview Cloudflare Pages build locally
npm run deploy                    # Build and deploy to Cloudflare Pages
npm run cf:deploy                 # Alias for deploy
npm run cf:deploy:prod            # Deploy to production environment
wrangler d1 create <db-name>              # Create D1 database
wrangler d1 execute <db-name> --command="SQL"   # Execute SQL command
wrangler r2 bucket create <bucket-name>   # Create R2 bucket
wrangler pages deployment list            # List recent deployments
wrangler login                            # Login to Cloudflare

# Linting & Formatting
npm run lint                 # Run ESLint

# Utility Scripts
npm run create-admin         # Create first admin user
npm run test:resend          # Test Resend email integration
```

## Architecture Overview

### High-Level Flow
```
Client Browser → Cloudflare Edge (Next.js) → D1 Database
                        ↓
        External Services (Google OAuth, Gemini AI, Resend Email)
                        ↓
                  R2 Storage (Files)
```

### Directory Structure (Current Implementation)
```
lunaxcode/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Public landing page
│   │   ├── (auth)/           # Authentication pages
│   │   │   └── login/        # Google OAuth login
│   │   ├── (dashboard)/      # Client dashboard (protected)
│   │   │   ├── dashboard/    # Overview & create project
│   │   │   ├── projects/     # Project list & detail pages
│   │   │   │   └── [id]/     # Project detail, messages, payment
│   │   │   └── settings/     # Client settings
│   │   ├── (admin)/          # Admin dashboard (protected, admin role)
│   │   │   └── admin/
│   │   │       ├── page.tsx              # Dashboard overview with stats
│   │   │       ├── clients/              # Client management
│   │   │       ├── projects/             # Project management & detail
│   │   │       ├── payments/             # Payment tracking
│   │   │       ├── users/                # User management
│   │   │       ├── settings/             # System settings
│   │   │       │   ├── page.tsx          # General settings
│   │   │       │   ├── payment-accounts/ # Payment accounts config
│   │   │       │   └── ai-settings/      # AI provider settings
│   │   │       └── cms/                  # Content management
│   │   │           ├── faqs/             # FAQ management
│   │   │           ├── portfolio/        # Portfolio items
│   │   │           ├── services/         # Service offerings
│   │   │           ├── process/          # Process steps
│   │   │           ├── features/         # Platform features
│   │   │           ├── questions/        # Dynamic onboarding questions
│   │   │           └── add-ons/          # Optional add-ons
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth handlers + session refresh
│   │   │   ├── projects/     # Project CRUD + create-from-onboarding
│   │   │   ├── tasks/        # Task status updates
│   │   │   ├── messages/     # Messaging (send, mark-read, unread count)
│   │   │   ├── payments/     # Payment submission
│   │   │   ├── ai/           # AI generation endpoints
│   │   │   ├── public/       # Public landing page data
│   │   │   ├── contact/      # Contact form
│   │   │   ├── questions/    # Dynamic questions per service
│   │   │   ├── add-ons/      # Add-ons API
│   │   │   ├── upload/       # File upload to R2
│   │   │   ├── site-settings/ # Site configuration
│   │   │   └── admin/        # Admin-only endpoints
│   │   ├── onboarding/       # Project creation wizard
│   │   ├── error.tsx         # Global error handler
│   │   ├── not-found.tsx     # 404 page
│   │   ├── global-error.tsx  # Root error handler
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── landing/          # Landing page components
│   │   ├── dashboard/        # Dashboard components
│   │   └── admin/            # Admin-specific components
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts     # Drizzle schema (20+ tables)
│   │   │   └── index.ts      # DB client
│   │   ├── auth.ts           # NextAuth configuration
│   │   └── utils.ts          # Utility functions
│   └── auth.ts               # NextAuth handlers
├── scripts/
│   ├── seed.ts               # TypeScript seed script
│   ├── seed.sql              # SQL seed script
│   └── create-admin.ts       # Create admin user script
├── docs/
│   ├── lunaxcode_complete_plan.txt  # Original development plan
│   └── SEEDING_SUMMARY.md           # Database seeding documentation
├── migrations/               # Database migrations (SQL)
├── public/                   # Static assets
├── .env.local                # Local environment variables
├── components.json           # shadcn/ui configuration
├── wrangler.toml             # Cloudflare configuration
└── CLAUDE.md                 # This file
```

### Key Pages & Routes

**Authentication:**
- `/login` - Google OAuth login with Turnstile bot protection

**Client Dashboard:**
- `/dashboard` - Overview with stats and quick actions
- `/dashboard/create-project` - Start new project wizard
- `/projects` - All client projects list
- `/projects/[id]` - Project detail (PRD, tasks, timeline)
- `/projects/[id]/messages` - Project messaging with admin
- `/projects/[id]/payment` - Payment submission with proof upload
- `/settings` - Client account settings
- `/onboarding` - Multi-step project creation wizard
- `/onboarding/complete` - Project creation confirmation

**Admin Dashboard:**
- `/admin` - Overview & analytics with stats cards (recharts)
- `/admin/projects` - All projects management with filters
- `/admin/projects/[id]` - Project detail with PRD generation
- `/admin/projects/[id]/messages` - Admin messaging with client
- `/admin/clients` - Client management with user table
- `/admin/users` - User management (all users)
- `/admin/payments` - Payment verification with status filters
- `/admin/settings` - System configuration
- `/admin/settings/payment-accounts` - Configure payment methods (GCash, SeaBank, etc.)
- `/admin/settings/ai-settings` - AI provider configuration (API keys, models)
- `/admin/cms/faqs` - FAQ content management
- `/admin/cms/portfolio` - Portfolio items management
- `/admin/cms/services` - Service offerings and pricing
- `/admin/cms/process` - Process steps management
- `/admin/cms/features` - Platform features management
- `/admin/cms/questions` - Dynamic onboarding questions per service
- `/admin/cms/add-ons` - Optional add-ons management

**API Routes:**

*Authentication:*
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/auth/refresh-session` - Force session refresh

*Projects:*
- `/api/projects` - Project CRUD (GET, POST)
- `/api/projects/[id]` - Individual project operations (GET, PUT, DELETE)
- `/api/projects/create-from-onboarding` - Create project from onboarding wizard

*Tasks:*
- `/api/tasks/[id]` - Task status updates (PATCH)

*Messaging:*
- `/api/messages` - Send/receive messages (GET, POST)
- `/api/messages/mark-read` - Mark messages as read (POST)
- `/api/messages/unread/count` - Get unread message count (GET)

*Payments:*
- `/api/payments` - Submit payment proof (POST)
- `/api/payment-accounts` - Get active payment accounts (GET)

*AI Generation:*
- `/api/ai/suggest-description` - AI description suggestions
- `/api/ai/validate` - Validate AI generation eligibility
- `/api/ai/stream` - Streaming AI responses
- `/api/ai/proxy` - AI proxy endpoint
- `/api/ai/secure-generate` - Secure AI generation with rate limiting

*Public (Landing Page):*
- `/api/public/features` - Get platform features
- `/api/public/faqs` - Get FAQs
- `/api/public/portfolio` - Get portfolio items
- `/api/public/services` - Get service types
- `/api/public/process` - Get process steps

*Other:*
- `/api/contact` - Contact form submission (Resend email)
- `/api/questions/[serviceId]` - Get dynamic questions for service
- `/api/add-ons` - Get available add-ons
- `/api/upload` - File upload to R2
- `/api/site-settings` - Get site configuration

*Admin API:*
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/clients` - Client management CRUD
- `/api/admin/users` - User management CRUD
- `/api/admin/projects` - Admin project management
- `/api/admin/projects/[id]` - Admin project operations
- `/api/admin/projects/[id]/tasks` - Task management for project
- `/api/admin/projects/[id]/generate-prd` - Generate PRD with AI
- `/api/admin/projects/[id]/preview-prompt` - Preview AI prompt
- `/api/admin/payments` - Payment management
- `/api/admin/payments/[id]` - Verify/reject payments
- `/api/admin/payment-accounts` - Payment accounts CRUD
- `/api/admin/ai-settings` - AI provider settings CRUD
- `/api/admin/ai-usage` - AI usage statistics
- `/api/admin/site-settings` - Site settings management
- `/api/admin/make-admin` - Promote user to admin
- `/api/admin/cms/*` - CMS endpoints (faqs, portfolio, services, process, features, questions, add-ons)

## Database Schema

### Core Tables (20+ tables in `src/lib/db/schema.ts`)

**User & Auth:**
- **users** - User profiles (role: 'admin' | 'client')
- **accounts** - OAuth accounts (NextAuth)
- **sessions** - User sessions (NextAuth)
- **verificationTokens** - Email verification tokens

**Projects & Tasks:**
- **projects** - Main project records with PRD, status, payment info
- **tasks** - AI-generated task breakdown (status: pending → to-do → in-progress → testing → done)
- **projectAnswers** - Stores onboarding question answers per project
- **projectAddOns** - Selected add-ons per project (junction table)

**Payments:**
- **payments** - Payment records with proof images and verification status
- **paymentAccounts** - Admin-configured payment methods (GCash, SeaBank, PayMaya, bank transfer)

**Messaging:**
- **messages** - Client-admin communication per project (with read/unread status)
- **unreadCounts** - Denormalized cache for message counts
- **messageSettings** - Per-project messaging configuration

**Files:**
- **files** - R2 file references for project uploads

**CMS Content:**
- **serviceTypes** - Service offerings with base pricing
- **questions** - Dynamic onboarding questions per service type
- **questionOptions** - Options for select/radio/checkbox questions
- **addOns** - Optional services/integrations with pricing
- **faqs** - FAQ content
- **portfolio** - Portfolio showcase items
- **processSteps** - Process/workflow steps
- **features** - Platform feature highlights

**AI & Settings:**
- **aiSettings** - Admin-configured AI provider settings (API keys, models, limits)
- **aiUsageLog** - Tracks AI generations per user for rate limiting
- **siteSettings** - Key-value store for site configuration

### Key Relationships
- User → Projects (one-to-many)
- Project → Tasks (one-to-many)
- Project → Payments (one-to-many)
- Project → Files (one-to-many)
- Project → Messages (one-to-many)
- Project → ProjectAnswers (one-to-many)
- Project → ProjectAddOns (one-to-many)
- ServiceType → Projects (one-to-many)
- ServiceType → Questions (one-to-many)
- ServiceType → AddOns (one-to-many, optional)
- Question → QuestionOptions (one-to-many)
- User → AIUsageLog (one-to-many)

### Seeded Data
The production database has been seeded with:
- **1 admin user**: admin@lunaxcode.com (from seed script)
- **2 sample clients**: Juan dela Cruz, Maria Santos
- **5 service types**: Landing Page (₱15k), Business Website (₱35k), E-Commerce (₱75k), Web App (₱150k), Mobile App (₱200k)
- **8 FAQs**: Common questions about services, timeline, payments
- **3 portfolio items**: FoodHub, SchoolConnect, StyleShop
- **5 process steps**: Discovery → Planning → Development → Testing → Launch
- **6 platform features**: AI-powered PRD, Task breakdown, Real-time updates, etc.
- **2 sample projects**: With complete task breakdowns

See `docs/SEEDING_SUMMARY.md` for detailed seed data documentation.

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

### Typography System
- **Body font**: Onest (`font-sans`) - Clean, readable sans-serif for body text
- **Display font**: Sora (`font-display`) - Bold display font for headings and CTAs
- Usage: Apply `font-display` class to section headings, hero text, and prominent CTAs
- CSS variables defined in `globals.css`, fonts configured in `tailwind.config.ts`

### Landing Page Component Pattern
Landing page components follow a Server Component + Client Component split:
- `Features.tsx` (Server) → fetches data from API, renders `FeaturesClient.tsx`
- `FeaturesClient.tsx` (Client) → handles animations and interactivity

This pattern is used for: Features, FAQ, Pricing, Process sections. Benefits:
- Server-side data fetching for SEO and performance
- Client-side interactivity (animations, accordions, carousels)
- Clean separation of concerns

### Performance
- Optimize images: WebP format, include size data, lazy loading
- Optimize Web Vitals (LCP, CLS, FID)
- Use 'nuqs' for URL search parameter state management

## Environment Variables

Required in `.env.local`:

```env
# NextAuth v5 (Auth.js)
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=<generate-with-openssl>

# Google OAuth
AUTH_GOOGLE_ID=<from-google-cloud-console>
AUTH_GOOGLE_SECRET=<from-google-cloud-console>

# Google Gemini API (AI generation - can also configure via admin dashboard)
GEMINI_API_KEY=<from-google-ai-studio>

# Resend (Email service for contact form)
RESEND_API_KEY=<from-resend.com>

# Cloudflare Turnstile (Bot Protection)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<from-cloudflare-dashboard>
TURNSTILE_SECRET_KEY=<from-cloudflare-dashboard>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sentry (Error Monitoring - optional)
SENTRY_DSN=<from-sentry.io>
```

**Note**: AI provider API keys can also be configured via the admin dashboard at `/admin/settings/ai-settings`. Environment variables serve as fallback.

### Getting Cloudflare Turnstile Keys

Cloudflare Turnstile is a privacy-first CAPTCHA alternative that protects the login form from bots.

**Setup Steps:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the left sidebar
3. Click **Add Site**
4. Configure:
   - **Site name**: Lunaxcode (or your project name)
   - **Domain**: Your domain (e.g., `lunaxcode-saas.pages.dev` or `localhost` for development)
   - **Widget Mode**: Managed (recommended) - automatically determines challenge difficulty
5. Click **Create**
6. Copy the **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
7. Copy the **Secret Key** → `TURNSTILE_SECRET_KEY`

**For Development:**
- Use Cloudflare's test keys that always pass:
  - Site Key: `1x00000000000000000000AA`
  - Secret Key: `1x0000000000000000000000000000000AA`
- Or create a Turnstile site with domain `localhost`

**For Production:**
- Create a new Turnstile site with your production domain
- Add the keys to Cloudflare Pages environment variables (see Deployment section)

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

## AI Integration (Multi-Provider)

### Configuration
AI providers are configured via the admin dashboard at `/admin/settings/ai-settings`. Supports:
- Google Gemini (default)
- OpenAI
- Anthropic
- DeepSeek
- Groq

### Rate Limiting
- Each user has a configurable limit of AI generations (default: 3 per project)
- Usage tracked in `aiUsageLog` table
- Limits configurable per provider via `aiSettings.maxGenerationsPerUser`
- Validation endpoint: `/api/ai/validate`

### Key Endpoints
- `/api/ai/suggest-description` - AI description suggestions during onboarding
- `/api/ai/secure-generate` - Secure PRD/task generation with rate limiting
- `/api/ai/stream` - Streaming AI responses for real-time feedback
- `/api/admin/projects/[id]/generate-prd` - Admin-triggered PRD generation
- `/api/admin/projects/[id]/preview-prompt` - Preview AI prompt before generation

### AI Generation Flow
1. User submits onboarding form (service type, description, answers to dynamic questions)
2. Admin reviews project and triggers PRD generation
3. System validates user hasn't exceeded generation limit
4. System calls configured AI provider to generate PRD (target: <30 seconds)
5. System generates task breakdown with estimates, dependencies, priorities
6. Usage logged to `aiUsageLog` table
7. All saved to D1 database atomically

## Payment Integration (Manual Verification)

### Supported Methods
- GCash (e-wallet)
- SeaBank (digital bank)
- PayMaya (e-wallet)
- Bank Transfer (traditional banks)

### Payment Flow
1. Admin configures payment accounts via `/admin/settings/payment-accounts`
2. Client views project payment page at `/projects/[id]/payment`
3. Client selects payment method and sees account details
4. Client makes payment externally (via banking app)
5. Client uploads payment proof (screenshot/receipt) via `/api/payments`
6. Admin reviews payment proof in `/admin/payments`
7. Admin verifies or rejects payment with optional notes
8. Project payment status updates automatically (pending → verified/rejected)

### Payment Types
- **Deposit** (50%): Required to start project
- **Completion** (50%): Required upon project completion

### Admin Verification
- View payment proof images
- Verify reference numbers
- Add admin notes
- Reject with reason if needed
- All verification actions logged with timestamp and admin ID

## Authentication & Authorization

### Roles
- **client** - Default role for new users, access to own projects only
- **admin** - Full system access, can view/edit all projects

### Authentication Strategy
- **NextAuth.js with JWT-only strategy** (no database session storage)
- **Google OAuth** as primary provider
- **JWT tokens** store user ID and role
- **Important**: Users authenticated via OAuth are NOT automatically added to the database
- **User records** must be created separately for database operations (projects, payments, etc.)

### Becoming an Admin
Since authentication uses JWT-only (no database persistence), users need to be added to the database manually:

1. **Login with Google OAuth** - Creates JWT session but no database record
2. **Call `/api/admin/make-admin` endpoint**:
   - `GET` - Check if your user exists in database
   - `POST` - Create/update your user record with admin role
3. **Browser console command**:
   ```javascript
   fetch('/api/admin/make-admin', {
     method: 'POST',
     credentials: 'include'
   }).then(r => r.json()).then(console.log);
   ```
4. **Refresh page** - Admin dashboard will now be accessible

**Note**: The make-admin endpoint uses the authenticated session email, so you must be logged in first.

### Middleware Protection
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires authentication + admin role
- `/projects/*` - Requires authentication + ownership check

### Session Management
- NextAuth.js with JWT strategy (no database sessions)
- Google OAuth as primary provider
- Session includes user ID and role
- Session checks on both client and server side
- **JWT role is set to 'client' by default** - admin access requires database record

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

1. **Build Process**: MUST use `npm run pages:build` for Cloudflare deployments, NOT `npm run build`. The standard Next.js build fails with edge runtime errors.

2. **Missing shadcn/ui Components**: If you add new shadcn/ui components to pages, install them first:
   ```bash
   npx shadcn@latest add button input textarea
   ```
   Missing components will cause production build failures.

3. **Edge Runtime Errors**: Remember to add `export const runtime = 'edge'` for routes using R2/D1. Without this, API routes won't work on Cloudflare Pages.

4. **User Database Records**: Users authenticated via Google OAuth are NOT automatically in the database. They need to:
   - Create projects (which creates their user record), OR
   - Use `/api/admin/make-admin` endpoint to manually create their record

5. **Database Schema Changes**: Always generate migrations with `npm run db:generate`, don't push directly in production. Run `npm run d1:migrate:prod` to apply.

6. **Payment Verification**: This system uses manual bank transfer verification (not PayMongo). Admins verify payment proofs via `/admin/payments`.

7. **Role Checks**: Always verify user role on server side, never trust client. Check database role, not just JWT token.

8. **AI Generation Timeouts**: Implement proper loading states, AI calls can take 20-30 seconds.

9. **File Upload Limits**: R2 has no size limits, but implement client-side validation for UX.

10. **Session Expiry**: Handle session expiry gracefully, redirect to login.

11. **Error Pages**: Next.js App Router requires `error.tsx`, `not-found.tsx`, and `global-error.tsx` for proper error handling in production builds.

12. **AI Rate Limiting**: Users have a configurable limit of AI generations per project. Check `aiSettings.maxGenerationsPerUser` and track usage in `aiUsageLog` table. Configure limits via `/admin/settings/ai-settings`.

13. **Payment Accounts Required**: Before clients can submit payments, admin must configure payment accounts in `/admin/settings/payment-accounts`. Without active accounts, the payment form won't show options.

14. **Dynamic Questions**: Onboarding questions are per-service-type and stored in the `questions` table. Update them via `/admin/cms/questions`. Each service can have different questions.

15. **Add-ons Pricing**: Add-ons can be service-specific or global (null serviceTypeId). Final project price = base service price + selected add-ons.

## Deployment

### Production Deployment

#### Step 1: Create Production Database
```bash
wrangler d1 create lunaxcode-prod
```

#### Step 2: Run Migrations
```bash
wrangler d1 migrations apply lunaxcode-prod --remote
```

#### Step 3: Seed Production Database
```bash
npm run db:seed:prod
```

#### Step 4: Set Environment Variables in Cloudflare Dashboard

**IMPORTANT:** Cloudflare Pages uses environment variables (not secrets). Add these via the dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to: **Pages** → **lunaxcode-saas** → **Settings** → **Environment variables**
3. Add the following variables for **Production** and **Preview**:

```
AUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://lunaxcode-saas.pages.dev (or your custom domain)

AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>

GEMINI_API_KEY=<your-gemini-api-key>

RESEND_API_KEY=<your-resend-api-key>

NEXT_PUBLIC_TURNSTILE_SITE_KEY=<your-turnstile-site-key>
TURNSTILE_SECRET_KEY=<your-turnstile-secret-key>

NEXT_PUBLIC_APP_URL=https://lunaxcode-saas.pages.dev (or your custom domain)

SENTRY_DSN=<your-sentry-dsn> (optional)
```

**Note:** For Workers (not Pages), you would use `wrangler secret put`, but Pages uses environment variables set via the dashboard.

#### Step 5: Build and Deploy
```bash
# IMPORTANT: Use pages:build, not build!
npm run pages:build    # Builds specifically for Cloudflare Pages
npm run deploy         # Or: npm run pages:build && wrangler pages deploy
```

### Cloudflare Pages Automatic Deployment
When you push to GitHub, Cloudflare Pages automatically:
1. Detects the push
2. Runs `npm run pages:build`
3. Deploys to production if on main branch
4. Provides deployment URL

Check deployment status:
```bash
npx wrangler pages deployment list --project-name=lunaxcode-saas
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
- **Cloudflare Turnstile**: https://developers.cloudflare.com/turnstile
- **Drizzle ORM**: https://orm.drizzle.team
- **Google Gemini**: https://ai.google.dev
- **shadcn/ui**: https://ui.shadcn.com
- **Resend**: https://resend.com/docs
- **Sentry**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Vitest**: https://vitest.dev
- **TanStack Table**: https://tanstack.com/table
- **dnd-kit**: https://dndkit.com

## Project Context

### Implementation Status

**✅ Completed Features:**
- Authentication system with Google OAuth (NextAuth.js)
- Bot protection with Cloudflare Turnstile (CAPTCHA alternative)
- Complete admin dashboard with 15+ pages
- CMS system (FAQs, Portfolio, Services, Process Steps, Features, Questions, Add-ons)
- Database schema with 20+ tables
- Database seeding scripts (TypeScript + SQL)
- All admin API endpoints (50+ routes)
- shadcn/ui component library installed
- Error pages for App Router
- Production deployment on Cloudflare Pages
- Light/Dark mode support throughout the application
- AI generation endpoints with rate limiting and usage tracking
- Client-admin messaging system with read/unread tracking
- Manual payment verification system (GCash, SeaBank, PayMaya, bank transfer)
- Payment accounts management for admin
- Dynamic onboarding questions per service type
- Add-ons system for optional services
- File upload to R2 storage
- Contact form with Resend email integration
- Site settings configuration
- Recharts dashboard analytics
- Drag-and-drop task management (@dnd-kit)
- Sentry error monitoring integration
- Enhanced landing page UI/UX (sticky CTA, touch swipe gestures, progress indicators)
- Dual-font typography system (Onest body + Sora display)
- Accessibility improvements (skip navigation, focus states)

**🚧 Potential Improvements:**
- Real-time messaging (WebSocket/SSE)
- Email notifications for project updates
- Invoice/receipt generation
- Client self-service features
- Advanced analytics and reporting

**📖 Development Plan:**
The original development plan (`docs/lunaxcode_complete_plan.txt`) contains the 34-task roadmap. Current progress: ~90% complete.

**🔗 Production URL:** https://app.lunaxcode.site

**📝 Key Documentation:**
- `CLAUDE.md` - This file (project overview and development guide)
- `docs/SEEDING_SUMMARY.md` - Database seeding documentation
- `docs/lunaxcode_complete_plan.txt` - Original 34-task implementation plan

**⚙️ Current Tech Choices:**
- JWT-only authentication (no database sessions)
- Edge runtime for all API routes
- Cloudflare D1 for database (SQLite)
- Cloudflare Pages for hosting
- Automatic deployments on git push
- Manual payment verification (no PayMongo - using proof uploads)
- Multi-provider AI support (configured via admin settings)
