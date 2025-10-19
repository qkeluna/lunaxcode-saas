import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
}

interface RequestBody {
  serviceName: string;
  mode: 'generate' | 'enhance';
  currentDescription?: string;
  aiConfig: AIConfig;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RequestBody;
    const { serviceName, mode, currentDescription, aiConfig } = body;

    if (!serviceName) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    if (!aiConfig || !aiConfig.provider || !aiConfig.apiKey) {
      return NextResponse.json(
        { error: 'AI configuration is required. Please configure AI settings in Admin Settings.' },
        { status: 400 }
      );
    }

    let prompt: string;

    if (mode === 'enhance' && currentDescription) {
      prompt = `Enhance this client's project description for a "${serviceName}" service. Keep their intention and goals clear:

"${currentDescription}"

Improve it by:
- Keeping their motivation and "why" at the forefront (their problem/need)
- Making their goals and desired outcomes clearer
- Adding specific details about what they want to achieve
- Keeping it natural and genuine (first-person perspective: "I need...", "I want...")
- Staying concise (30-80 words)
- Maintaining Filipino business context if present

Return ONLY the enhanced intention-focused description as plain text, no quotes, no markdown:`;
    } else {
      prompt = `Generate 3 example project descriptions that help a client articulate WHY they want to build a "${serviceName}".

Each description should be written from the client's perspective, explaining their intention and goals:
- Start with their motivation/problem (e.g., "I need to...", "I want to...", "My business needs...")
- Explain the specific goal or outcome they're trying to achieve
- Be 30-80 words (concise but clear about intentions)
- Sound natural and genuine (how a real client would describe their needs)
- Focus on Filipino business context when relevant

Examples of good intention-based descriptions:
- "I need a landing page to promote my new online tutoring service and capture student sign-ups before the school year starts. I want to showcase my teaching credentials and make it easy for parents to book a free trial session."
- "I want to build a website for my catering business to attract more corporate clients. I need to display my menu packages, show photos of past events, and allow customers to request quotes online."

Return ONLY a JSON array of 3 intention-focused descriptions, no markdown formatting:
["description 1", "description 2", "description 3"]`;
    }

    // Generate response using the appropriate AI provider
    const text = await generateWithProvider(prompt, aiConfig);

    // Handle enhance mode - return enhanced text directly
    if (mode === 'enhance') {
      const enhancedText = text.replace(/```\s*/g, '').replace(/^["']|["']$/g, '').trim();
      return NextResponse.json({
        enhanced: enhancedText
      });
    }

    // Handle generate mode - parse and return suggestions array
    const cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const suggestions = JSON.parse(jsonMatch[0]) as string[];

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('No suggestions generated');
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 3) // Ensure max 3 suggestions
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions. Please check your AI configuration.' },
      { status: 500 }
    );
  }
}

// Generate text using the configured AI provider
async function generateWithProvider(prompt: string, config: AIConfig): Promise<string> {
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

// OpenAI
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
      temperature: 0.8,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

// Anthropic
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
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { content: Array<{ text: string }> };
  return data.content[0].text;
}

// Google
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
          temperature: 0.8,
          maxOutputTokens: 500,
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

// DeepSeek
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
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

// Groq
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
      temperature: 0.8,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText;

    try {
      const error = JSON.parse(errorText) as { error?: { message?: string } };
      errorMessage = error.error?.message || response.statusText;
    } catch {
      errorMessage = errorText || response.statusText;
    }

    throw new Error(`Groq API error: ${errorMessage}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

// Together AI
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
      temperature: 0.8,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`Together AI error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}
