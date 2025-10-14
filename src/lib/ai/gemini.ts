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
  try {
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating PRD:', error);
    throw new Error('Failed to generate PRD');
  }
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
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

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
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw new Error('Failed to generate tasks');
  }
}
