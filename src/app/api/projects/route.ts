import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generatePRD, generateTasks, estimatePrice } from '@/lib/gemini';

// For now, we'll use a simple in-memory store
// In production with Cloudflare, this will use D1 database
let projectsStore: any[] = [];
let tasksStore: any[] = [];
let projectIdCounter = 1;
let taskIdCounter = 1;

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Create project
    const project = {
      id: projectIdCounter++,
      userId: session.user.id || session.user.email,
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
      paymentStatus: 'pending',
      depositAmount: 0,
      status: 'pending',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projectsStore.push(project);

    // Create tasks
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

    console.log('✅ Project created successfully:', project.id);
    console.log(`📊 Total tasks: ${projectTasks.length}`);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      message: 'Project created successfully',
      project: {
        id: project.id,
        name: project.name,
        tasksCount: projectTasks.length,
      },
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

  try {
    const userId = session.user.id || session.user.email;
    const userProjects = projectsStore
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ projects: userProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// Get project by ID
export async function getProjectById(projectId: number) {
  const project = projectsStore.find((p) => p.id === projectId);
  if (!project) return null;

  const projectTasks = tasksStore.filter((t) => t.projectId === projectId);

  return {
    ...project,
    tasks: projectTasks,
  };
}
