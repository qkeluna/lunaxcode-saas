import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { projects, projectAnswers, serviceTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/auth/check-admin';

export const runtime = 'edge';

/**
 * Build PRD Prompt (extracted from universal-ai.ts for preview)
 */
function buildPRDPrompt(serviceName: string, description: string, questionAnswers: Record<string, any>): string {
  return `
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

# Project Requirements Document

## 1. Executive Summary
Brief overview of the project and its goals.

## 2. Project Overview
Detailed description of what we're building and why.

## 3. Target Audience & User Personas
Who will use this and what are their needs?

## 4. Core Features & Functionality
List all features with detailed descriptions:
- Feature 1: Description
- Feature 2: Description
(etc.)

## 5. Technical Requirements
- Frontend: Technologies and frameworks
- Backend: Server-side requirements
- Database: Data storage needs
- Third-party Integrations: External services
- Hosting & Deployment: Infrastructure requirements

## 6. Design Specifications
- Visual Style: Description of look and feel
- Color Scheme: Primary and secondary colors
- Typography: Font choices and hierarchy
- Layout: Page structure and navigation
- Responsive Design: Mobile, tablet, desktop breakpoints

## 7. Content Requirements
What content needs to be created or provided?

## 8. Timeline & Milestones
Estimated phases and key deliverables.

## 9. Success Metrics
How will we measure project success?

## 10. Assumptions & Constraints
Any limitations or assumptions made.

Format the PRD in clean Markdown with clear headings, bullet points, and organized sections.
`;
}

/**
 * Build Tasks Prompt (extracted from universal-ai.ts for preview)
 */
function buildTasksPrompt(prd: string): string {
  return `
Based on this PRD, generate 15-25 specific, actionable development tasks.

PRD:
${prd.substring(0, 8000)}

For each task, provide:
- title: Clear, concise task name (under 80 characters)
- description: 2-3 sentences explaining what needs to be done
- section: One of [Frontend, Backend, Database, Design, Testing, DevOps, Documentation]
- priority: One of [high, medium, low]
- estimatedHours: Realistic time estimate (1-40 hours)
- dependencies: Array of task indices that must be completed first (e.g., [0, 2])
- order: Sequential order number

**IMPORTANT: Return ONLY valid JSON array, no markdown formatting, no code blocks.**

Example format:
[
  {
    "title": "Setup Next.js project structure",
    "description": "Initialize Next.js 15 project with TypeScript, configure routing, and setup base layout components.",
    "section": "Frontend",
    "priority": "high",
    "estimatedHours": 4,
    "dependencies": [],
    "order": 1
  },
  {
    "title": "Design database schema",
    "description": "Create entity relationship diagram and define all database tables, relationships, and indexes.",
    "section": "Database",
    "priority": "high",
    "estimatedHours": 6,
    "dependencies": [],
    "order": 2
  }
]

Generate realistic, detailed tasks covering:
- Project setup and configuration
- Frontend development (UI components, pages, routing)
- Backend development (API endpoints, business logic)
- Database implementation (schema, queries, migrations)
- Design work (UI/UX, branding, assets)
- Testing (unit tests, integration tests, E2E)
- DevOps (deployment, CI/CD, monitoring)
- Documentation (code docs, user guides)

Return the JSON array now:
`;
}

/**
 * Admin endpoint to preview PRD and tasks prompt without executing AI
 * GET /api/admin/projects/[id]/preview-prompt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check admin authentication
    const { isAdmin, error } = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // 2. Get Cloudflare context and database
    const context = getCloudflareContext();
    if (!context?.env?.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const db = drizzle(context.env.DB);
    const { id } = await params;
    const projectId = parseInt(id);

    // 3. Get project details
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // 4. Get service type details
    const [service] = await db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.id, project.serviceTypeId))
      .limit(1);

    if (!service) {
      return NextResponse.json(
        { error: 'Service type not found' },
        { status: 404 }
      );
    }

    // 5. Get project answers
    const answers = await db
      .select()
      .from(projectAnswers)
      .where(eq(projectAnswers.projectId, projectId));

    // Convert answers to key-value object
    const questionAnswers: Record<string, any> = {};
    for (const answer of answers) {
      try {
        // Try to parse as JSON first
        questionAnswers[answer.questionKey] = JSON.parse(answer.answerValue);
      } catch {
        // If not JSON, use as string
        questionAnswers[answer.questionKey] = answer.answerValue;
      }
    }

    // 6. Build prompts
    const prdPrompt = buildPRDPrompt(
      project.service,
      project.description,
      questionAnswers
    );

    // For tasks prompt preview, use existing PRD if available, otherwise use placeholder
    const tasksPrompt = buildTasksPrompt(
      project.prd || '[PRD will be generated first]'
    );

    // 7. Build actual JSON request payloads for different providers
    // These are the EXACT payloads that will be sent to each AI API

    // Google Gemini format
    const googlePayload = {
      prd: {
        url: `https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          contents: [{
            parts: [{ text: prdPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8000,
          }
        }
      },
      tasks: {
        url: `https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          contents: [{
            parts: [{ text: tasksPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8000,
          }
        }
      }
    };

    // OpenAI / Anthropic / DeepSeek / Groq / Together format
    const openaiLikePayload = {
      prd: {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {apiKey}'
        },
        body: {
          model: '{model}',
          messages: [{ role: 'user', content: prdPrompt }],
          temperature: 0.7,
          max_tokens: 4000
        }
      },
      tasks: {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {apiKey}'
        },
        body: {
          model: '{model}',
          messages: [{ role: 'user', content: tasksPrompt }],
          temperature: 0.7,
          max_tokens: 4000
        }
      }
    };

    // 8. Create structured prompt data for display
    const promptData = {
      prd: {
        provider: 'Default AI provider from settings',
        model: 'Configured model',
        googlePayload: googlePayload.prd,
        openaiLikePayload: openaiLikePayload.prd,
        metadata: {
          serviceName: project.service,
          descriptionLength: project.description.length,
          requirementsCount: Object.keys(questionAnswers).length,
          estimatedTokens: Math.ceil(prdPrompt.length / 4),
        },
      },
      tasks: {
        provider: 'Default AI provider from settings',
        model: 'Configured model',
        googlePayload: googlePayload.tasks,
        openaiLikePayload: openaiLikePayload.tasks,
        metadata: {
          prdAvailable: !!project.prd,
          prdLength: project.prd?.length || 0,
          estimatedTokens: Math.ceil(tasksPrompt.length / 4),
        },
      },
      project: {
        id: project.id,
        name: project.name,
        service: project.service,
        description: project.description,
        questionAnswers,
      },
    };

    return NextResponse.json({
      success: true,
      data: promptData,
    });
  } catch (error: any) {
    console.error('Error generating prompt preview:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate prompt preview',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
