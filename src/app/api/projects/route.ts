import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generatePRD, generateTasks, estimatePrice } from '@/lib/gemini';
import { getDatabase } from '@/lib/db/client';
import { createProject, createTasks, getProjectsByUserId } from '@/lib/db/queries';

// Fallback in-memory store for when D1 is not available
let projectsStore: any[] = [];
let tasksStore: any[] = [];
let projectIdCounter = 1;
let taskIdCounter = 1;

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Try to get D1 database
  const db = getDatabase((request as any).env);
  const useDatabase = db !== null;

  if (useDatabase) {
    console.log('✅ Using D1 database');
  } else {
    console.log('⚠️  Using in-memory storage (D1 not available)');
  }

  try {
    const body = await request.json();
    const {
      service,
      description,
      features,
      timeline,
      budget,
      clientName,
      clientEmail,
      clientPhone,
    } = body;

    // Validate input
    if (!service || !description || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🤖 Starting AI project generation...');
    console.log('📝 Service:', service);
    console.log('📝 Features:', features.join(', '));

    // Generate PRD using AI
    console.log('🤖 Generating PRD with Gemini AI...');
    const prd = await generatePRD({
      service,
      description,
      timeline,
      budget,
      features,
    });

    console.log('✅ PRD generated successfully');
    console.log('🤖 Generating task breakdown...');

    // Generate tasks using AI
    const generatedTasks = await generateTasks(prd, timeline);

    console.log(`✅ Generated ${generatedTasks.length} tasks`);

    // Estimate price if not provided
    const estimatedPrice = budget || (await estimatePrice(service, features));

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + timeline);

    const userId = session.user.id || session.user.email!;

    // Create project data
    const projectData = {
      userId,
      name: `${service} for ${clientName}`,
      service,
      description,
      prd,
      clientName,
      clientEmail,
      clientPhone: clientPhone || null,
      timeline,
      budget,
      price: estimatedPrice,
      paymentStatus: 'pending' as const,
      depositAmount: 0,
      status: 'pending' as const,
      startDate: Math.floor(startDate.getTime()),
      endDate: Math.floor(endDate.getTime()),
      createdAt: Math.floor(Date.now()),
      updatedAt: Math.floor(Date.now()),
    };

    let project: any;

    if (useDatabase) {
      // Use D1 database
      project = await createProject(db, projectData);

      // Create tasks in database
      const taskData = generatedTasks.map((task, index) => ({
        projectId: project.id,
        title: task.title,
        description: task.description,
        section: task.section,
        priority: task.priority,
        status: 'pending' as const,
        estimatedHours: task.estimatedHours,
        dependencies: task.dependencies,
        order: task.order !== undefined ? task.order : index,
        createdAt: Math.floor(Date.now()),
        updatedAt: Math.floor(Date.now()),
      }));

      await createTasks(db, taskData);
    } else {
      // Use in-memory store
      project = {
        id: projectIdCounter++,
        ...projectData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      projectsStore.push(project);

      // Create tasks in memory
      const projectTasks = generatedTasks.map((task, index) => ({
        id: taskIdCounter++,
        projectId: project.id,
        title: task.title,
        description: task.description,
        section: task.section,
        priority: task.priority,
        status: 'pending',
        estimatedHours: task.estimatedHours,
        dependencies: task.dependencies,
        order: task.order !== undefined ? task.order : index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      tasksStore.push(...projectTasks);
    }

    console.log('✅ Project created successfully:', project.id);
    console.log(`📊 Total tasks: ${generatedTasks.length}`);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      message: 'Project created successfully',
      project: {
        id: project.id,
        name: project.name,
        tasksCount: generatedTasks.length,
      },
      usingDatabase: useDatabase,
    });
  } catch (error: any) {
    console.error('❌ Error creating project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}

// Get all projects for current user
export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Try to get D1 database
  const db = getDatabase((request as any).env);
  const userId = session.user.id || session.user.email!;

  try {
    let userProjects;

    if (db) {
      // Use D1 database
      userProjects = await getProjectsByUserId(db, userId);
    } else {
      // Use in-memory store
      userProjects = projectsStore
        .filter((p) => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      projects: userProjects,
      usingDatabase: db !== null,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// Get project by ID (internal helper for in-memory fallback)
async function getProjectById(projectId: number) {
  const project = projectsStore.find((p) => p.id === projectId);
  if (!project) return null;

  const projectTasks = tasksStore.filter((t) => t.projectId === projectId);

  return {
    ...project,
    tasks: projectTasks,
  };
}
