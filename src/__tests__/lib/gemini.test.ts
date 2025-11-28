import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePRD, generateTasks } from '@/lib/ai/gemini';

// Mock Google Generative AI with proper constructor
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn(function (this: any) {
      this.getGenerativeModel = vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: vi.fn().mockReturnValue('# Mocked PRD Content\n\nThis is a test PRD.')
          }
        })
      });
    })
  };
});

describe('AI Generation - PRD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a PRD with service name and description', async () => {
    const result = await generatePRD({
      serviceName: 'Landing Page',
      description: 'A marketing landing page for a SaaS product',
      questionAnswers: {},
      apiKey: 'test-api-key'
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include question answers in PRD generation', async () => {
    const questionAnswers = {
      target_audience: 'Small business owners',
      key_features: ['Contact form', 'Pricing table', 'Testimonials']
    };

    const result = await generatePRD({
      serviceName: 'Business Website',
      description: 'Professional website for consulting business',
      questionAnswers,
      apiKey: 'test-api-key'
    });

    expect(result).toBeDefined();
  });

  it('should handle empty question answers', async () => {
    const result = await generatePRD({
      serviceName: 'E-Commerce Site',
      description: 'Online store for handmade products',
      questionAnswers: {},
      apiKey: 'test-api-key'
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});

describe('AI Generation - Tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate tasks from PRD', async () => {
    const mockPRD = `# Project Requirements Document
## Overview
Building a landing page with contact form.`;

    const tasks = await generateTasks({
      prd: mockPRD,
      apiKey: 'test-api-key'
    });

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
  });

  it('should return tasks with required fields', async () => {
    const mockPRD = '# Test PRD';

    const tasks = await generateTasks({
      prd: mockPRD,
      apiKey: 'test-api-key'
    });

    tasks.forEach(task => {
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('section');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('estimatedHours');
      expect(task).toHaveProperty('dependencies');
      expect(task).toHaveProperty('order');
    });
  });

  it('should handle long PRD content', async () => {
    const longPRD = '# PRD\n' + 'Content '.repeat(1000);

    const tasks = await generateTasks({
      prd: longPRD,
      apiKey: 'test-api-key'
    });

    expect(Array.isArray(tasks)).toBe(true);
  });
});
