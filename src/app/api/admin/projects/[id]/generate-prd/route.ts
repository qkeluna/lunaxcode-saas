import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { projects, tasks, projectAnswers, serviceTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePRD, generateTasks } from '@/lib/ai/gemini';
import { checkIsAdmin } from '@/lib/auth/check-admin';

export const runtime = 'edge';

/**
 * Admin endpoint to generate PRD and tasks for a project
 * POST /api/admin/projects/[id]/generate-prd
 */
export async function POST(
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

    // 6. Check for Gemini API key
    const geminiApiKey = context.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured. Please set it in Cloudflare secrets.' },
        { status: 503 }
      );
    }

    console.log(`🤖 Admin generating PRD for project ${projectId}...`);

    // 7. Generate PRD
    const prd = await generatePRD({
      serviceName: project.service,
      description: project.description,
      questionAnswers: questionAnswers,
      apiKey: geminiApiKey
    });

    console.log(`✅ PRD generated (${prd.length} characters)`);

    // 8. Update project with PRD
    await db
      .update(projects)
      .set({ 
        prd, 
        updatedAt: new Date() 
      })
      .where(eq(projects.id, projectId));

    console.log(`🤖 Generating tasks for project ${projectId}...`);

    // 9. Generate tasks
    const generatedTasks = await generateTasks({
      prd,
      apiKey: geminiApiKey
    });

    console.log(`✅ ${generatedTasks.length} tasks generated`);

    // 10. Delete existing tasks (if any)
    await db
      .delete(tasks)
      .where(eq(tasks.projectId, projectId));

    // 11. Insert new tasks
    for (const task of generatedTasks) {
      await db.insert(tasks).values({
        projectId: projectId,
        title: task.title,
        description: task.description,
        section: task.section,
        priority: task.priority,
        status: 'pending',
        estimatedHours: task.estimatedHours,
        dependencies: task.dependencies,
        order: task.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`✅ All tasks saved to database for project ${projectId}`);

    return NextResponse.json({
      success: true,
      message: 'PRD and tasks generated successfully',
      prdLength: prd.length,
      tasksCount: generatedTasks.length
    });

  } catch (error: any) {
    console.error('Error generating PRD:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate PRD',
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

