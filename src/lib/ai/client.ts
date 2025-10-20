/**
 * Unified AI Client
 *
 * Provides a single interface for PRD and task generation across all AI providers
 * Handles both direct API calls (CORS-enabled) and proxy calls (Anthropic)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  PRDGenerationParams,
  TaskGenerationParams,
  GeneratedTask,
  AIProxyRequest,
  AIProxyResponse,
} from './types';
import { requiresProxy } from './config';

/**
 * Generate PRD using configured AI provider
 */
export async function generatePRD(
  params: PRDGenerationParams & {
    provider: string;
    model: string;
    apiKey: string;
  }
): Promise<string> {
  const { serviceName, description, questionAnswers, provider, model, apiKey } = params;

  const prompt = buildPRDPrompt(serviceName, description, questionAnswers);

  // Use proxy for non-CORS providers
  if (requiresProxy(provider)) {
    return generateViaProxy(provider, model, apiKey, prompt);
  }

  // Direct API calls for CORS-enabled providers
  switch (provider) {
    case 'google':
      return generatePRDWithGoogle(apiKey, model, prompt);
    case 'openai':
      return generatePRDWithOpenAI(apiKey, model, prompt);
    case 'deepseek':
    case 'groq':
    case 'together':
      return generatePRDWithOpenAICompatible(provider, apiKey, model, prompt);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Generate tasks using configured AI provider
 */
export async function generateTasks(
  params: TaskGenerationParams & {
    provider: string;
    model: string;
    apiKey: string;
  }
): Promise<GeneratedTask[]> {
  const { prd, provider, model, apiKey } = params;

  const prompt = buildTasksPrompt(prd);

  let responseText: string;

  // Use proxy for non-CORS providers
  if (requiresProxy(provider)) {
    responseText = await generateViaProxy(provider, model, apiKey, prompt);
  } else {
    // Direct API calls for CORS-enabled providers
    switch (provider) {
      case 'google':
        responseText = await generatePRDWithGoogle(apiKey, model, prompt);
        break;
      case 'openai':
        responseText = await generatePRDWithOpenAI(apiKey, model, prompt);
        break;
      case 'deepseek':
      case 'groq':
      case 'together':
        responseText = await generatePRDWithOpenAICompatible(provider, apiKey, model, prompt);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  return parseTasksResponse(responseText);
}

/**
 * Test connection to AI provider
 */
export async function testConnection(
  provider: string,
  model: string,
  apiKey: string
): Promise<{ success: boolean; message: string; latency?: number }> {
  const startTime = Date.now();

  try {
    const testPrompt = 'Say "OK" if you can read this message.';

    let response: string;

    if (requiresProxy(provider)) {
      response = await generateViaProxy(provider, model, apiKey, testPrompt);
    } else {
      switch (provider) {
        case 'google':
          response = await generatePRDWithGoogle(apiKey, model, testPrompt);
          break;
        case 'openai':
          response = await generatePRDWithOpenAI(apiKey, model, testPrompt);
          break;
        case 'deepseek':
        case 'groq':
        case 'together':
          response = await generatePRDWithOpenAICompatible(provider, apiKey, model, testPrompt);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    }

    const latency = Date.now() - startTime;

    return {
      success: true,
      message: `Connection successful! Response received in ${latency}ms`,
      latency,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// ============================================================================
// PROVIDER-SPECIFIC IMPLEMENTATIONS
// ============================================================================

/**
 * Generate with Google Gemini (direct API call)
 */
async function generatePRDWithGoogle(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Google Gemini API error:', error);
    throw new Error('Failed to generate with Google Gemini');
  }
}

/**
 * Generate with OpenAI (direct API call)
 */
async function generatePRDWithOpenAI(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error instanceof Error ? error : new Error('Failed to generate with OpenAI');
  }
}

/**
 * Generate with OpenAI-compatible providers (DeepSeek, Groq, Together AI)
 */
async function generatePRDWithOpenAICompatible(
  provider: string,
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  // Base URLs for OpenAI-compatible providers
  const baseUrls: Record<string, string> = {
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    together: 'https://api.together.xyz/v1/chat/completions',
  };

  const baseUrl = baseUrls[provider];
  if (!baseUrl) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `${provider} API request failed`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(`${provider} API error:`, error);
    throw error instanceof Error ? error : new Error(`Failed to generate with ${provider}`);
  }
}

/**
 * Generate via server-side proxy (for non-CORS providers like Anthropic)
 */
async function generateViaProxy(
  provider: string,
  model: string,
  apiKey: string,
  prompt: string
): Promise<string> {
  try {
    const request: AIProxyRequest = {
      provider: provider as any,
      model,
      messages: [{ role: 'user', content: prompt }],
      apiKey,
      temperature: 0.7,
    };

    const response = await fetch('/api/ai/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Proxy request failed');
    }

    const data: AIProxyResponse = await response.json();
    return data.text;
  } catch (error) {
    console.error('Proxy API error:', error);
    throw error instanceof Error ? error : new Error('Failed to generate via proxy');
  }
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * Build PRD generation prompt
 */
function buildPRDPrompt(
  serviceName: string,
  description: string,
  questionAnswers: Record<string, any>
): string {
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
 * Build tasks generation prompt
 */
function buildTasksPrompt(prd: string): string {
  return `
Based on this PRD, generate 15-25 specific, actionable development tasks.

PRD:
${prd.substring(0, 8000)} // Limit to avoid token limits

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
 * Parse tasks response from AI
 */
function parseTasksResponse(text: string): GeneratedTask[] {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // Find JSON array
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in AI response');
    }

    const tasks = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('Invalid tasks format from AI');
    }

    // Ensure all tasks have required fields and convert dependencies to string
    return tasks.map((task: any, index: number) => ({
      title: task.title || `Task ${index + 1}`,
      description: task.description || 'No description provided',
      section: task.section || 'General',
      priority: (task.priority || 'medium') as 'low' | 'medium' | 'high',
      estimatedHours: task.estimatedHours || 4,
      dependencies: JSON.stringify(task.dependencies || []),
      order: task.order || index + 1,
    }));
  } catch (error) {
    console.error('Failed to parse tasks:', error);
    throw new Error('Failed to parse AI response into tasks');
  }
}
