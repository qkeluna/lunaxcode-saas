import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ProjectInput {
  service: string;
  description: string;
  timeline: number;
  budget: number;
  features: string[];
}

export async function generatePRD(input: ProjectInput): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
You are a professional project manager creating a comprehensive Project Requirements Document (PRD).

Project Details:
- Service Type: ${input.service}
- Description: ${input.description}
- Timeline: ${input.timeline} days
- Budget: ₱${input.budget.toLocaleString()}
- Required Features: ${input.features.join(', ')}

Generate a detailed PRD in markdown format with the following sections:

1. Executive Summary
2. Project Objectives
3. Target Audience
4. Scope & Features
5. Technical Requirements
6. Design Guidelines
7. Success Metrics
8. Risks & Mitigation
9. Timeline Breakdown
10. Budget Allocation

Make it professional, detailed, and actionable. Focus on Filipino market context.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating PRD:', error);
    throw new Error('Failed to generate PRD');
  }
}

export interface TaskOutput {
  title: string;
  description: string;
  section: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  dependencies: string | null;
  order: number;
}

export async function generateTasks(
  prd: string,
  timeline: number
): Promise<TaskOutput[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
Based on the following PRD, generate a detailed task breakdown for development.

PRD:
${prd}

Timeline: ${timeline} days

Generate tasks in JSON format with the following structure:
[
  {
    "title": "Task title",
    "description": "Detailed description",
    "section": "Phase name (e.g., 'Setup', 'Frontend', 'Backend', 'Testing')",
    "priority": "low" | "medium" | "high",
    "estimatedHours": number,
    "dependencies": "comma-separated task titles or null",
    "order": number
  }
]

Guidelines:
- Break down into 15-25 actionable tasks
- Include setup, development, testing, and deployment tasks
- Estimate hours realistically based on timeline
- Identify dependencies between tasks
- Group by logical sections (Setup, Frontend, Backend, Database, Testing, Deployment)
- Order tasks sequentially within each section
- Consider Filipino developer skill levels and work patterns

Respond ONLY with valid JSON array, no markdown formatting or code blocks.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from response
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to find JSON array
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response:', text);
      throw new Error('Failed to parse tasks from AI response');
    }

    const tasks = JSON.parse(jsonMatch[0]);

    // Validate and sanitize tasks
    return tasks.map((task: any, index: number) => ({
      title: task.title || `Task ${index + 1}`,
      description: task.description || 'No description provided',
      section: task.section || 'General',
      priority: ['low', 'medium', 'high'].includes(task.priority)
        ? task.priority
        : 'medium',
      estimatedHours: Number(task.estimatedHours) || 8,
      dependencies: task.dependencies || null,
      order: task.order !== undefined ? Number(task.order) : index,
    }));
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw new Error('Failed to generate tasks');
  }
}

export async function estimatePrice(
  service: string,
  features: string[]
): Promise<number> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
As a Filipino web development agency pricing expert, estimate the cost for:

Service: ${service}
Features: ${features.join(', ')}

Consider:
- Philippine market rates (₱500-₱2,000 per hour)
- Complexity of features
- Standard agency overhead
- Quality assurance time
- Project management time

Respond ONLY with a number (the amount in PHP), nothing else.
Example: 75000
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Extract number from response
    const price = parseInt(text.replace(/[^0-9]/g, ''));

    // Validate price is reasonable (10k to 1M PHP)
    if (price < 10000 || price > 1000000 || isNaN(price)) {
      return 50000; // Default fallback
    }

    return price;
  } catch (error) {
    console.error('Error estimating price:', error);
    return 50000; // Default fallback
  }
}
