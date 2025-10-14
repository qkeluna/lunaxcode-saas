# Next Steps - Implementation Roadmap

## Current Status

✅ **Completed:**
- Onboarding page with dynamic questions
- Schema design with `project_answers` table
- Workflow documentation
- Pricing page integration

❌ **Not Implemented Yet:**
- Database migrations
- Project creation API
- AI generation integration
- Login flow updates

---

## Priority Order (Do These in Sequence)

### 🔴 **CRITICAL - Must Do First**

#### 1. Run Database Migrations
**Why:** Schema changes are required for everything else to work

**Tasks:**
```bash
# 1.1 Generate migration
npm run db:generate

# When prompted about column renames:
# - label → question_text: SELECT "rename column"
# - type → question_type: SELECT "rename column"
# - is_required → required: SELECT "rename column"

# 1.2 Review generated migration
cat migrations/0004_*.sql

# 1.3 Backup production database
npx wrangler d1 backup create lunaxcode-prod --remote

# 1.4 Test on local database first
npx wrangler d1 migrations apply lunaxcode-dev --local

# 1.5 If successful, apply to production
npx wrangler d1 migrations apply lunaxcode-prod --remote
```

**Expected Changes:**
- ✅ `questions` table: Columns renamed
- ✅ `project_answers` table: Created
- ✅ `projects` table: service_type_id made NOT NULL
- ✅ `question_options` table: created_at added

---

#### 2. Update Questions API Endpoint
**Why:** Current API uses old column names that no longer exist

**File:** `/src/app/api/questions/[serviceId]/route.ts`

**Current Code (BROKEN):**
```typescript
const [question] = await db.select().from(questions)...
// Returns: { label, type, is_required } ❌ WRONG!
```

**Fix Required:**
```typescript
// Update the response mapping to use new column names
const questionsWithOptions = await Promise.all(
  serviceQuestions.map(async (question) => {
    const options = await db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, question.id))
      .orderBy(questionOptions.sortOrder);

    return {
      id: question.id,
      serviceId: question.serviceId,
      questionKey: question.questionKey,
      questionText: question.questionText, // ← NEW NAME
      questionType: question.questionType, // ← NEW NAME
      required: question.required,         // ← NEW NAME
      placeholder: question.placeholder,
      sortOrder: question.sortOrder,
      options: options.map(opt => opt.optionValue),
    };
  })
);
```

**Test:**
```bash
# Should return questions with new field names
curl http://localhost:3000/api/questions/1
```

---

#### 3. Create Project Creation API Endpoint
**Why:** This is the core endpoint that creates projects from onboarding data

**File:** `/src/app/api/projects/create-from-onboarding/route.ts` (NEW FILE)

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/client';
import { projects, projectAnswers, questions, serviceTypes, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePRD, generateTasks } from '@/lib/ai/gemini';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get onboarding data from request
    const body = await request.json();
    const {
      serviceId,
      serviceName,
      description,
      questionAnswers,
      clientName,
      clientEmail,
      clientPhone
    } = body;

    if (!serviceId || !description || !clientName || !clientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDatabase((request as any).env);
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // 3. Get service details
    const [service] = await db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.id, parseInt(serviceId)))
      .limit(1);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // 4. Create project
    const [project] = await db
      .insert(projects)
      .values({
        userId: session.user.id,
        serviceTypeId: service.id,
        name: `${serviceName} for ${clientName}`,
        service: serviceName,
        description: description,
        clientName: clientName,
        clientEmail: clientEmail,
        clientPhone: clientPhone || null,
        price: service.basePrice,
        timeline: null,
        budget: service.basePrice,
        prd: null,
        status: 'pending',
        paymentStatus: 'pending',
        depositAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 5. Store question answers
    if (questionAnswers && typeof questionAnswers === 'object') {
      for (const [questionKey, answerValue] of Object.entries(questionAnswers)) {
        const [question] = await db
          .select()
          .from(questions)
          .where(eq(questions.questionKey, questionKey))
          .limit(1);

        if (question) {
          await db.insert(projectAnswers).values({
            projectId: project.id,
            questionId: question.id,
            questionKey: questionKey,
            answerValue: typeof answerValue === 'object'
              ? JSON.stringify(answerValue)
              : String(answerValue),
            createdAt: new Date(),
          });
        }
      }
    }

    // 6. Generate PRD with AI (async - don't wait)
    generatePRDAndTasks(project.id, service, description, questionAnswers, db);

    // 7. Return success immediately
    return NextResponse.json({
      success: true,
      projectId: project.id,
      redirectUrl: `/projects/${project.id}`
    });

  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}

// Async function to generate PRD and tasks (runs in background)
async function generatePRDAndTasks(
  projectId: number,
  service: any,
  description: string,
  questionAnswers: any,
  db: any
) {
  try {
    // Generate PRD
    const prd = await generatePRD({
      serviceName: service.name,
      description,
      questionAnswers
    });

    // Update project with PRD
    await db
      .update(projects)
      .set({ prd })
      .where(eq(projects.id, projectId));

    // Generate tasks
    const generatedTasks = await generateTasks({ prd });

    // Insert tasks
    for (const task of generatedTasks) {
      await db.insert(tasks).values({
        projectId: projectId,
        ...task,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`✅ PRD and tasks generated for project ${projectId}`);
  } catch (error) {
    console.error(`❌ Failed to generate PRD/tasks for project ${projectId}:`, error);
  }
}
```

---

#### 4. Create AI Generation Functions
**Why:** The Gemini API calls for generating PRD and tasks

**File:** `/src/lib/ai/gemini.ts` (NEW FILE)

**Implementation:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generatePRD({
  serviceName,
  description,
  questionAnswers
}: {
  serviceName: string;
  description: string;
  questionAnswers: Record<string, any>;
}): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
Create a comprehensive Project Requirements Document (PRD) for a web development project.

Service Type: ${serviceName}
Project Description: ${description}

Client Requirements:
${Object.entries(questionAnswers)
  .map(([key, value]) => {
    const formattedValue = Array.isArray(value) ? value.join(', ') : value;
    return `- ${key.replace(/_/g, ' ')}: ${formattedValue}`;
  })
  .join('\n')}

Generate a detailed PRD with the following sections:
1. Executive Summary
2. Project Overview
3. Target Audience & User Personas
4. Core Features & Functionality
5. Technical Requirements
6. Design Specifications
7. Content Requirements
8. Timeline & Milestones
9. Success Metrics
10. Assumptions & Constraints

Format: Markdown with clear headings and bullet points.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generateTasks({
  prd
}: {
  prd: string;
}): Promise<Array<{
  title: string;
  description: string;
  section: string;
  priority: string;
  estimatedHours: number;
  dependencies: string;
  order: number;
}>> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
Based on this PRD, generate 15-25 specific, actionable development tasks.

PRD:
${prd}

For each task, provide:
- title: Clear, concise task name
- description: 2-3 sentences explaining what needs to be done
- section: One of [Frontend, Backend, Database, Design, Testing, DevOps, Documentation]
- priority: One of [high, medium, low]
- estimatedHours: Realistic time estimate (1-40 hours)
- dependencies: Array of task indices that must be completed first (e.g., [0, 2])
- order: Sequential order number

Return as JSON array. Example:
[
  {
    "title": "Setup Next.js project structure",
    "description": "Initialize Next.js 15 project with TypeScript, configure routing, and setup base layout components.",
    "section": "Frontend",
    "priority": "high",
    "estimatedHours": 4,
    "dependencies": [],
    "order": 1
  }
]

Generate realistic, detailed tasks covering all aspects of the project.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
  const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

  const tasks = JSON.parse(jsonText);

  return tasks.map((task: any) => ({
    ...task,
    dependencies: JSON.stringify(task.dependencies || [])
  }));
}
```

**Install Package:**
```bash
npm install @google/generative-ai
```

---

#### 5. Update Login/Signup Callback
**Why:** Need to check for onboarding data after authentication

**File:** `/src/app/api/auth/[...nextauth]/route.ts` or middleware

**Add Callback:**
```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // After successful authentication, check will happen on client side
    return true;
  },
  async redirect({ url, baseUrl }) {
    // If coming from onboarding, redirect to project creation
    if (url.includes('from=onboarding')) {
      return `${baseUrl}/api/projects/create-from-onboarding`;
    }
    return url.startsWith(baseUrl) ? url : baseUrl;
  }
}
```

**Or better: Client-side check in `/src/app/login/page.tsx`:**
```typescript
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // Check for onboarding data
      const onboardingData = sessionStorage.getItem('onboardingData');

      if (onboardingData) {
        // Send to project creation
        router.push('/api/projects/create-from-onboarding');
      } else {
        // Regular login
        router.push('/dashboard');
      }
    }
  }, [status, router]);

  return (
    // ... login form
  );
}
```

---

### 🟡 **IMPORTANT - Testing**

#### 6. Test Complete Flow End-to-End

**Test Steps:**
```
1. ✅ Go to landing page
2. ✅ Click "Get Started" on Landing Page service
3. ✅ Verify onboarding loads with service pre-selected
4. ✅ Fill Step 1: Project description
5. ✅ Fill Step 2: Answer all questions
6. ✅ Fill Step 3: Contact info
7. ✅ Submit → Should redirect to login
8. ✅ Create account with Google OAuth
9. ✅ After auth, should redirect to project creation API
10. ✅ Verify project created in database
11. ✅ Verify question answers stored
12. ✅ Wait for PRD generation (30s)
13. ✅ Verify PRD appears in project
14. ✅ Verify tasks generated (15-25 tasks)
15. ✅ View project dashboard
16. ✅ Verify all data displays correctly
```

**Database Checks:**
```sql
-- Check project created
SELECT * FROM projects WHERE user_id = 'user-id' ORDER BY created_at DESC LIMIT 1;

-- Check answers stored
SELECT * FROM project_answers WHERE project_id = X;

-- Check tasks generated
SELECT COUNT(*) FROM tasks WHERE project_id = X;

-- Check PRD exists
SELECT id, name, prd IS NOT NULL as has_prd FROM projects WHERE id = X;
```

---

### 🟢 **NICE TO HAVE - Enhancements**

#### 7. Add Loading State for AI Generation
Show user that PRD/tasks are being generated

#### 8. Add Error Handling
Handle AI generation failures gracefully

#### 9. Add Progress Indicators
Show percentage complete on dashboard

#### 10. Add Email Notifications
Notify client when project is ready

---

## Quick Start Command

```bash
# 1. Generate and apply migration
npm run db:generate
npx wrangler d1 migrations apply lunaxcode-prod --remote

# 2. Install AI package
npm install @google/generative-ai

# 3. Create new files (will do this together)
touch src/lib/ai/gemini.ts
touch src/app/api/projects/create-from-onboarding/route.ts

# 4. Run dev server
npm run dev

# 5. Test onboarding flow
open http://localhost:3000/#pricing
```

---

## Estimated Time

- **Migrations:** 15 minutes
- **Update Questions API:** 10 minutes
- **Create Project Creation API:** 45 minutes
- **Create AI Functions:** 30 minutes
- **Update Login Flow:** 20 minutes
- **Testing:** 30 minutes

**Total:** ~2.5 hours

---

## What to Do RIGHT NOW

Pick one:

**Option A - Safe Approach:**
```bash
1. Review the migration plan in docs/ONBOARDING_WORKFLOW.md
2. Generate migration (I'll help with prompts)
3. Test migration on local database
4. Apply to production if successful
```

**Option B - Quick Implementation:**
```bash
1. Skip migrations for now (use old column names)
2. Create project creation API with workarounds
3. Test end-to-end flow
4. Run migrations later
```

**Which approach do you prefer?** 🤔
