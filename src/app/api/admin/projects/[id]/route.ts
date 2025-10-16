import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { projects, tasks, users, projectAnswers, questions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/auth/check-admin';

export const runtime = 'edge';

/**
 * GET /api/admin/projects/[id]
 * Fetch a single project with its tasks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const { isAdmin, error } = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get Cloudflare context and database
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

    // Fetch project
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

    // Fetch tasks for this project
    const projectTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(tasks.order);

    // Fetch onboarding answers with questions
    const answersWithQuestions = await db
      .select({
        id: projectAnswers.id,
        projectId: projectAnswers.projectId,
        questionId: projectAnswers.questionId,
        questionKey: projectAnswers.questionKey,
        questionText: questions.questionText,
        answerValue: projectAnswers.answerValue,
        questionType: questions.questionType,
      })
      .from(projectAnswers)
      .innerJoin(questions, eq(projectAnswers.questionId, questions.id))
      .where(eq(projectAnswers.projectId, projectId));

    // Fetch user info
    let user = null;
    if (project.userId) {
      const [userResult] = await db
        .select()
        .from(users)
        .where(eq(users.id, project.userId))
        .limit(1);
      
      if (userResult) {
        user = {
          id: userResult.id,
          name: userResult.name,
          email: userResult.email,
        };
      }
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        service: project.service,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        description: project.description,
        timeline: project.timeline,
        budget: project.budget,
        price: project.price,
        status: project.status,
        paymentStatus: project.paymentStatus,
        depositAmount: project.depositAmount,
        prd: project.prd,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt,
      },
      tasks: projectTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        section: task.section,
        priority: task.priority,
        status: task.status,
        estimatedHours: task.estimatedHours,
        dependencies: task.dependencies,
        order: task.order,
      })),
      onboardingAnswers: answersWithQuestions.map(answer => ({
        id: answer.id,
        projectId: answer.projectId,
        questionId: answer.questionId,
        questionKey: answer.questionKey,
        questionText: answer.questionText,
        answerValue: answer.answerValue,
        questionType: answer.questionType,
      })),
      user,
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/projects/[id]
 * Update project details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const { isAdmin, error } = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get Cloudflare context and database
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

    // Get update data from request body
    const body = await request.json() as {
      status?: string;
      paymentStatus?: string;
      startDate?: string;
      endDate?: string;
      timeline?: number;
      budget?: number;
      price?: number;
    };

    // Convert string dates to Date objects if provided
    const updateData: Record<string, unknown> = {
      ...body,
      updatedAt: new Date(),
    };
    
    if (body.startDate) {
      updateData.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      updateData.endDate = new Date(body.endDate);
    }

    // Update project
    await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId));

    return NextResponse.json({ 
      success: true,
      message: 'Project updated successfully' 
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/projects/[id]
 * Delete a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const { isAdmin, error } = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get Cloudflare context and database
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

    // Delete project (CASCADE will delete related tasks, files, etc.)
    await db
      .delete(projects)
      .where(eq(projects.id, projectId));

    return NextResponse.json({ 
      success: true,
      message: 'Project deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
