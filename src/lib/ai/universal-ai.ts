/**
 * Universal AI Service
 * Supports multiple AI providers: OpenAI, Anthropic, Google, DeepSeek, Groq, Together AI
 */

interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
}

interface GeneratePRDParams {
  serviceName: string;
  description: string;
  questionAnswers: Record<string, any>;
  config: AIConfig;
}

interface GenerateTasksParams {
  prd: string;
  config: AIConfig;
}

/**
 * Generate PRD using any AI provider
 */
export async function generatePRDUniversal({
  serviceName,
  description,
  questionAnswers,
  config
}: GeneratePRDParams): Promise<string> {
  const prompt = buildPRDPrompt(serviceName, description, questionAnswers);

  switch (config.provider) {
    case 'openai':
      return await generateOpenAI(prompt, config);
    case 'anthropic':
      return await generateAnthropic(prompt, config);
    case 'google':
      return await generateGoogle(prompt, config);
    case 'deepseek':
      return await generateDeepSeek(prompt, config);
    case 'groq':
      return await generateGroq(prompt, config);
    case 'together':
      return await generateTogether(prompt, config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

/**
 * Generate tasks using any AI provider
 */
export async function generateTasksUniversal({
  prd,
  config
}: GenerateTasksParams): Promise<Array<{
  title: string;
  description: string;
  section: string;
  priority: string;
  estimatedHours: number;
  dependencies: string;
  order: number;
}>> {
  const prompt = buildTasksPrompt(prd);

  let responseText: string;

  switch (config.provider) {
    case 'openai':
      responseText = await generateOpenAI(prompt, config);
      break;
    case 'anthropic':
      responseText = await generateAnthropic(prompt, config);
      break;
    case 'google':
      responseText = await generateGoogle(prompt, config);
      break;
    case 'deepseek':
      responseText = await generateDeepSeek(prompt, config);
      break;
    case 'groq':
      responseText = await generateGroq(prompt, config);
      break;
    case 'together':
      responseText = await generateTogether(prompt, config);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }

  return parseTasksResponse(responseText);
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

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

function parseTasksResponse(text: string): Array<any> {
  // Clean up the response - remove markdown code blocks if present
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Find JSON array
  const jsonMatch = text.match(/\[[\s\S]*\]/);
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
    priority: task.priority || 'medium',
    estimatedHours: task.estimatedHours || 4,
    dependencies: JSON.stringify(task.dependencies || []),
    order: task.order || index + 1
  }));
}

// ============================================================================
// AI PROVIDER IMPLEMENTATIONS
// ============================================================================

async function generateOpenAI(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

async function generateAnthropic(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { content: Array<{ text: string }> };
  return data.content[0].text;
}

async function generateGoogle(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`Google API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
  return data.candidates[0].content.parts[0].text;
}

async function generateDeepSeek(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

async function generateGroq(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

async function generateTogether(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`Together AI error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

