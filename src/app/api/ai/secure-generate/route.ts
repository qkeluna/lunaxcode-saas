/**
 * Secure AI Generation Endpoint
 *
 * This endpoint allows authenticated users (including clients) to use AI features
 * without exposing API keys. It enforces per-user generation limits.
 *
 * Features:
 * - Uses admin-configured API keys stored server-side
 * - Enforces per-user generation limits (default: 3 max)
 * - Admins bypass limits
 * - Logs all usage to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { canUserGenerate, logAIUsage, type GenerationType } from '@/lib/ai/usage';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

// Supported generation types
const VALID_GENERATION_TYPES: GenerationType[] = [
  'prd',
  'tasks',
  'description_suggestion',
  'description_enhance',
];

interface GenerateRequest {
  type: GenerationType;
  projectId?: number;
  // Type-specific data
  data: {
    // For PRD generation
    serviceName?: string;
    description?: string;
    questionAnswers?: Record<string, any>;
    // For task generation
    prd?: string;
    // For description suggestions
    serviceType?: string;
    currentDescription?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
    const body: GenerateRequest = await request.json();

    if (!body.type || !VALID_GENERATION_TYPES.includes(body.type)) {
      return NextResponse.json(
        {
          error: 'Invalid generation type',
          code: 'INVALID_TYPE',
          validTypes: VALID_GENERATION_TYPES,
        },
        { status: 400 }
      );
    }

    // 3. Get database connection
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    // Use session user ID or email as user identifier
    const userId = session.user.id || session.user.email;

    // 4. Check if user can generate (includes limit check)
    const { allowed, config, usage, isAdmin } = await canUserGenerate(
      db,
      userId,
      body.type
    );

    if (!config) {
      return NextResponse.json(
        {
          error: 'AI generation is not configured. Please contact the administrator to set up AI providers.',
          code: 'NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    if (!allowed) {
      return NextResponse.json(
        {
          error: usage.message,
          code: 'LIMIT_REACHED',
          usage: {
            used: usage.used,
            limit: usage.limit,
            remaining: usage.remaining,
          },
        },
        { status: 429 }
      );
    }

    // 5. Generate content based on type
    let result: string;
    let tokenInfo = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    try {
      switch (body.type) {
        case 'prd':
          result = await generatePRD(config.apiKey, config.model, body.data);
          break;

        case 'tasks':
          result = await generateTasks(config.apiKey, config.model, body.data);
          break;

        case 'description_suggestion':
          result = await generateDescriptionSuggestions(
            config.apiKey,
            config.model,
            body.data
          );
          break;

        case 'description_enhance':
          result = await enhanceDescription(config.apiKey, config.model, body.data);
          break;

        default:
          return NextResponse.json(
            { error: 'Unsupported generation type', code: 'UNSUPPORTED_TYPE' },
            { status: 400 }
          );
      }

      // 6. Log successful usage
      await logAIUsage(db, {
        userId,
        projectId: body.projectId,
        generationType: body.type,
        provider: config.provider,
        model: config.model,
        ...tokenInfo,
        status: 'success',
      });

      // 7. Return result with updated usage info
      const newUsage = {
        used: usage.used + 1,
        limit: usage.limit,
        remaining: Math.max(0, usage.remaining - 1),
      };

      return NextResponse.json({
        success: true,
        result,
        usage: isAdmin
          ? { used: usage.used + 1, limit: 'unlimited', remaining: 'unlimited' }
          : newUsage,
        isAdmin,
      });
    } catch (genError: any) {
      // Log failed generation
      await logAIUsage(db, {
        userId,
        projectId: body.projectId,
        generationType: body.type,
        provider: config.provider,
        model: config.model,
        status: 'error',
        errorMessage: genError.message || 'Unknown error',
      });

      throw genError;
    }
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      {
        error: error.message || 'AI generation failed',
        code: 'GENERATION_FAILED',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check usage status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const userId = session.user.id || session.user.email;

    const { allowed, config, usage, isAdmin } = await canUserGenerate(db, userId);

    return NextResponse.json({
      configured: config !== null,
      isAdmin,
      usage: isAdmin
        ? { used: usage.used, limit: 'unlimited', remaining: 'unlimited', allowed: true }
        : usage,
    });
  } catch (error: any) {
    console.error('Error checking AI status:', error);
    return NextResponse.json(
      { error: 'Failed to check AI status' },
      { status: 500 }
    );
  }
}

// Helper functions for AI generation

async function generatePRD(
  apiKey: string,
  model: string,
  data: GenerateRequest['data']
): Promise<string> {
  if (!data.serviceName || !data.description) {
    throw new Error('Service name and description are required for PRD generation');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const aiModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });

  const prompt = `
Create a comprehensive Project Requirements Document (PRD) for a web development project.

Service Type: ${data.serviceName}
Project Description: ${data.description}

${
  data.questionAnswers
    ? `Client Requirements:
${Object.entries(data.questionAnswers)
  .map(([key, value]) => {
    const formattedValue = Array.isArray(value) ? value.join(', ') : value;
    return `- ${key.replace(/_/g, ' ')}: ${formattedValue}`;
  })
  .join('\n')}`
    : ''
}

Generate a detailed PRD with the following sections:

# Project Requirements Document

## 1. Executive Summary
Brief overview of the project and its goals.

## 2. Project Overview
Detailed description of what we're building and why.

## 3. Target Audience & User Personas
Who will use this and what are their needs?

## 4. Core Features & Functionality
List all features with detailed descriptions.

## 5. Technical Requirements
Frontend, Backend, Database, Third-party Integrations, Hosting.

## 6. Design Specifications
Visual Style, Color Scheme, Typography, Layout, Responsive Design.

## 7. Content Requirements
What content needs to be created or provided?

## 8. Timeline & Milestones
Estimated phases and key deliverables.

## 9. Success Metrics
How will we measure project success?

## 10. Assumptions & Constraints
Any limitations or assumptions made.

Format the PRD in clean Markdown.
`;

  const result = await aiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function generateTasks(
  apiKey: string,
  model: string,
  data: GenerateRequest['data']
): Promise<string> {
  if (!data.prd) {
    throw new Error('PRD is required for task generation');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const aiModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });

  const prompt = `
Based on this PRD, generate 15-25 specific, actionable development tasks.

PRD:
${data.prd.substring(0, 8000)}

For each task, provide:
- title: Clear, concise task name (under 80 characters)
- description: 2-3 sentences explaining what needs to be done
- section: One of [Frontend, Backend, Database, Design, Testing, DevOps, Documentation]
- priority: One of [high, medium, low]
- estimatedHours: Realistic time estimate (1-40 hours)
- dependencies: Array of task indices that must be completed first
- order: Sequential order number

**IMPORTANT: Return ONLY valid JSON array, no markdown formatting, no code blocks.**

Return the JSON array now:
`;

  const result = await aiModel.generateContent(prompt);
  const response = await result.response;
  let text = response.text();

  // Clean up response
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Validate JSON
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from AI');
  }

  // Parse and validate
  const tasks = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Invalid tasks format from AI');
  }

  return JSON.stringify(tasks);
}

async function generateDescriptionSuggestions(
  apiKey: string,
  model: string,
  data: GenerateRequest['data']
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const aiModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });

  const prompt = `
Generate 3 different project description examples for a ${data.serviceType || 'web development'} project.

Each description should be:
- 2-3 sentences long
- Professional but approachable
- Specific about features and goals
- Unique in approach/focus

${data.currentDescription ? `Current draft for reference: ${data.currentDescription}` : ''}

**IMPORTANT: Return ONLY a JSON array of 3 strings, no markdown formatting.**

Example format:
["Description 1...", "Description 2...", "Description 3..."]

Return the JSON array:
`;

  const result = await aiModel.generateContent(prompt);
  const response = await result.response;
  let text = response.text();

  // Clean up response
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  return text;
}

async function enhanceDescription(
  apiKey: string,
  model: string,
  data: GenerateRequest['data']
): Promise<string> {
  if (!data.currentDescription) {
    throw new Error('Current description is required for enhancement');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const aiModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });

  const prompt = `
Enhance this project description to be more professional, detailed, and compelling.

Service Type: ${data.serviceType || 'Web Development'}
Current Description: ${data.currentDescription}

Guidelines:
- Keep it 2-4 sentences
- Be specific about goals and features
- Use professional but approachable language
- Maintain the original intent

Return ONLY the enhanced description text, no formatting or explanation.
`;

  const result = await aiModel.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}
