import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { projects, tasks, projectAnswers, serviceTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePRDUniversal, generateTasksUniversal } from '@/lib/ai/universal-ai';
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

    // 2. Get AI config from request body
    const body = await request.json() as { aiConfig?: { provider: string; apiKey: string; model: string } };
    const aiConfig = body.aiConfig;

    if (!aiConfig || !aiConfig.provider || !aiConfig.apiKey) {
      return NextResponse.json(
        { error: 'AI configuration is required. Please configure your AI provider in Settings.' },
        { status: 400 }
      );
    }

    // 3. Get Cloudflare context and database
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

    console.log(`🤖 Admin generating PRD for project ${projectId}...`);
    console.log(`AI Provider: ${aiConfig.provider}`);
    console.log(`AI Model: ${aiConfig.model}`);
    console.log(`Service: ${project.service}`);
    console.log(`Description length: ${project.description?.length || 0}`);
    console.log(`Answers count: ${Object.keys(questionAnswers).length}`);

    // 7. Generate PRD using universal AI service
    try {
      const prd = await generatePRDUniversal({
        serviceName: project.service,
        description: project.description,
        questionAnswers: questionAnswers,
        config: aiConfig
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

      // 9. Generate tasks using universal AI service
      const generatedTasks = await generateTasksUniversal({
        prd,
        config: aiConfig
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
    } catch (genError: any) {
      console.error('❌ AI Generation Error:', genError);
      return NextResponse.json(
        { 
          error: 'Failed to generate PRD: ' + (genError.message || 'AI service error'),
          details: genError.toString()
        },
        { status: 500 }
      );
    }

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

