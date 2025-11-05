# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lunaxcode is an AI-powered project management SaaS platform for Filipino web development agencies. The system automatically generates Project Requirements Documents (PRDs) and task breakdowns using Google Gemini AI, integrates PayMongo for Philippine payment methods, and provides client/admin dashboards.

**Current Status**: Core features implemented and deployed. Admin dashboard, CMS system, authentication, and database seeding complete. Production deployment: https://lunaxcode-saas.pages.dev

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
npm run db:seed               # Seed local database with sample data
npm run db:seed:dev           # Seed remote dev database
npm run db:seed:prod          # Seed remote production database

# Cloudflare (Wrangler CLI)
npm run pages:build               # Build for Cloudflare Pages (USE THIS, not npm run build)
npm run preview                   # Preview Cloudflare Pages build locally
npm run deploy                    # Build and deploy to Cloudflare Pages
wrangler d1 create <db-name>              # Create D1 database
wrangler d1 migrations apply <db-name>    # Apply migrations
wrangler d1 migrations apply <db-name> --local  # Apply to local DB
wrangler d1 execute <db-name> --command="SQL"   # Execute SQL command
wrangler r2 bucket create <bucket-name>   # Create R2 bucket
wrangler secret put <SECRET_NAME>         # Set production secret
wrangler pages deploy                     # Deploy to Cloudflare Pages
wrangler pages deployment list            # List recent deployments
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

### Directory Structure (Current Implementation)
```
lunaxcode/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Public landing page
│   │   ├── (admin)/          # ✅ Admin dashboard (implemented)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx          # Dashboard overview with stats
│   │   │   │   ├── clients/page.tsx  # Client management
│   │   │   │   ├── projects/page.tsx # Project management
│   │   │   │   ├── payments/page.tsx # Payment tracking
│   │   │   │   ├── settings/page.tsx # System settings
│   │   │   │   └── cms/              # CMS system
│   │   │   │       ├── faqs/page.tsx      # FAQ management
│   │   │   │       ├── portfolio/page.tsx # Portfolio management
│   │   │   │       ├── services/page.tsx  # Services management
│   │   │   │       ├── process/page.tsx   # Process steps
│   │   │   │       └── features/page.tsx  # Platform features
│   │   ├── api/              # ✅ API routes (implemented)
│   │   │   ├── auth/         # NextAuth handlers
│   │   │   ├── projects/     # Project CRUD
│   │   │   ├── tasks/        # Task management
│   │   │   ├── messages/     # Project messaging
│   │   │   └── admin/        # Admin API endpoints
│   │   │       ├── clients/  # Client management API
│   │   │       ├── projects/ # Admin project management
│   │   │       ├── payments/ # Payment tracking API
│   │   │       ├── cms/      # CMS API (faqs, portfolio, services, process)
│   │   │       ├── stats/    # Dashboard statistics
│   │   │       └── make-admin/ # User to admin promotion endpoint
│   │   ├── dashboard/        # Client dashboard
│   │   ├── projects/         # Project pages
│   │   ├── login/            # Login page
│   │   ├── onboarding/       # Project creation wizard
│   │   ├── error.tsx         # ✅ Global error handler
│   │   ├── not-found.tsx     # ✅ 404 page
│   │   ├── global-error.tsx  # ✅ Root error handler
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   └── ui/               # ✅ shadcn/ui components (installed)
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── label.tsx
│   │       ├── switch.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── badge.tsx
│   │       ├── dialog.tsx
│   │       ├── card.tsx
│   │       └── tabs.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts     # ✅ Drizzle schema (complete)
│   │   │   └── index.ts      # DB client
│   │   ├── auth.ts           # NextAuth configuration
│   │   └── utils.ts          # Utility functions
│   └── auth.ts               # NextAuth handlers
├── scripts/
│   ├── seed.ts               # ✅ TypeScript seed script
│   └── seed.sql              # ✅ SQL seed script
├── docs/
│   ├── lunaxcode_complete_plan.txt  # Original development plan
│   └── SEEDING_SUMMARY.md           # ✅ Database seeding documentation
├── migrations/               # Database migrations (SQL)
├── public/                   # Static assets
├── .env.local                # Local environment variables
├── components.json           # ✅ shadcn/ui configuration
├── wrangler.toml             # Cloudflare configuration
└── CLAUDE.md                 # This file
```

### Key Pages & Routes

**Authentication:**
- ✅ `/login` - Google OAuth login
- `/signup` - User registration (to be implemented)

**Client Dashboard:**
- ✅ `/dashboard` - Overview with stats
- ✅ `/projects` - All projects list
- ✅ `/projects/[id]` - Project detail (PRD, tasks, timeline)
- `/projects/[id]/messages` - Project messaging (to be implemented)
- `/projects/[id]/payment` - Payment interface (to be implemented)
- ✅ `/onboarding` - New project creation (3-step form)

**Admin Dashboard (✅ Fully Implemented):**
- ✅ `/admin` - Overview & analytics with stats cards
- ✅ `/admin/projects` - All projects management
- ✅ `/admin/clients` - Client management with user table
- ✅ `/admin/payments` - Payment tracking with status filters
- ✅ `/admin/cms/faqs` - FAQ content management
- ✅ `/admin/cms/portfolio` - Portfolio items management
- ✅ `/admin/cms/services` - Service offerings and pricing
- ✅ `/admin/cms/process` - Process steps management
- ✅ `/admin/cms/features` - Platform features management
- ✅ `/admin/settings` - System configuration (profile, system, notifications, security)

**API Routes:**
- ✅ `/api/auth/[...nextauth]` - NextAuth handlers
- ✅ `/api/projects` - Project CRUD
- ✅ `/api/projects/[id]` - Individual project operations
- ✅ `/api/tasks/[id]` - Task status updates
- ✅ `/api/messages` - Project messaging
- ✅ `/api/admin/clients` - Client management API
- ✅ `/api/admin/clients/[id]` - Individual client operations
- ✅ `/api/admin/projects` - Admin project management
- ✅ `/api/admin/projects/[id]` - Admin project operations
- ✅ `/api/admin/payments` - Payment tracking API
- ✅ `/api/admin/payments/[id]` - Individual payment operations
- ✅ `/api/admin/stats` - Dashboard statistics
- ✅ `/api/admin/cms/faqs` - FAQ CRUD operations
- ✅ `/api/admin/cms/faqs/[id]` - Individual FAQ operations
- ✅ `/api/admin/cms/portfolio` - Portfolio CRUD
- ✅ `/api/admin/cms/portfolio/[id]` - Individual portfolio operations
- ✅ `/api/admin/cms/services` - Services CRUD
- ✅ `/api/admin/cms/services/[id]` - Individual service operations
- ✅ `/api/admin/cms/process` - Process steps CRUD
- ✅ `/api/admin/cms/process/[id]` - Individual process operations
- ✅ `/api/admin/make-admin` - Promote authenticated user to admin (GET to check, POST to promote)
- `/api/payment` - Payment processing (to be implemented)
- `/api/upload` - File upload to R2 (to be implemented)
- `/api/webhooks/paymongo` - Payment webhooks (to be implemented)

## Database Schema

### Core Tables (✅ All Implemented)
- **users** - Authentication and user profiles (role: 'admin' | 'client')
- **projects** - Main project records with PRD, status, payment info
- **tasks** - AI-generated task breakdown for each project
- **payments** - Payment records linked to projects
- **files** - R2 file references for project uploads
- **messages** - Client-agency communication per project
- **service_types** - CMS for service offerings and pricing
- **faqs** - CMS for FAQ content
- **portfolio** - CMS for portfolio showcase items
- **process_steps** - CMS for process/workflow steps
- **platform_features** - CMS for platform feature highlights

### Key Relationships
- User → Projects (one-to-many)
- Project → Tasks (one-to-many)
- Project → Payments (one-to-many)
- Project → Files (one-to-many)
- Project → Messages (one-to-many)
- ServiceType → Projects (one-to-many)

### Seeded Data (✅ Production Database)
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

# Google Gemini API (AI generation)
GEMINI_API_KEY=<from-google-ai-studio>

# PayMongo (Philippine payments)
PAYMONGO_PUBLIC_KEY=pk_test_<your-key>
PAYMONGO_SECRET_KEY=sk_test_<your-key>
PAYMONGO_WEBHOOK_SECRET=whsec_<your-secret>

# Resend (Email service for contact form)
RESEND_API_KEY=<from-resend.com>

# Cloudflare Turnstile (Bot Protection)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<from-cloudflare-dashboard>
TURNSTILE_SECRET_KEY=<from-cloudflare-dashboard>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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

5. **Database Schema Changes**: Always generate migrations with `npm run db:generate`, don't push directly in production. Run `wrangler d1 migrations apply` to apply.

6. **Payment Webhooks**: Must verify PayMongo signature before processing to prevent fraud.

7. **Role Checks**: Always verify user role on server side, never trust client. Check database role, not just JWT token.

8. **AI Generation Timeouts**: Implement proper loading states, AI calls can take 20-30 seconds.

9. **File Upload Limits**: R2 has no size limits, but implement client-side validation for UX.

10. **Session Expiry**: Handle session expiry gracefully, redirect to login.

11. **Error Pages**: Next.js App Router requires `error.tsx`, `not-found.tsx`, and `global-error.tsx` for proper error handling in production builds.

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

PAYMONGO_PUBLIC_KEY=<your-paymongo-public-key>
PAYMONGO_SECRET_KEY=<your-paymongo-secret-key>
PAYMONGO_WEBHOOK_SECRET=<your-webhook-secret>

RESEND_API_KEY=<your-resend-api-key>

NEXT_PUBLIC_TURNSTILE_SITE_KEY=<your-turnstile-site-key>
TURNSTILE_SECRET_KEY=<your-turnstile-secret-key>

NEXT_PUBLIC_APP_URL=https://lunaxcode-saas.pages.dev (or your custom domain)
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
- **PayMongo**: https://developers.paymongo.com
- **shadcn/ui**: https://ui.shadcn.com

## Project Context

### Implementation Status

**✅ Completed Features:**
- Authentication system with Google OAuth (NextAuth.js)
- Bot protection with Cloudflare Turnstile (CAPTCHA alternative)
- Complete admin dashboard with 10+ pages
- CMS system (FAQs, Portfolio, Services, Process Steps, Features)
- Database schema with 11 tables
- Database seeding scripts (TypeScript + SQL)
- All admin API endpoints (20+ routes)
- shadcn/ui component library installed
- Error pages for App Router
- Production deployment on Cloudflare Pages
- Light/Dark mode support throughout the application

**🚧 In Progress / To Be Implemented:**
- AI-powered PRD generation (Google Gemini integration)
- PayMongo payment integration
- Client project messaging system
- File upload to R2 storage
- Payment webhooks
- Advanced client dashboard features

**📖 Development Plan:**
The original development plan (`docs/lunaxcode_complete_plan.txt`) contains the 34-task roadmap. Current progress: ~40% complete (focusing on admin features first).

**🔗 Production URL:** https://lunaxcode-saas.pages.dev

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
