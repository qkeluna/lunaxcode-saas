import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Import the in-memory store from the main route
// In production, this will query D1 database
const getProjectsStore = () => {
  // This is a workaround for development
  // In production with D1, we'll query the database directly
  return [];
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projectId = parseInt(params.id);

    // In production, query from D1
    // For now, return a placeholder
    return NextResponse.json({
      error: 'Project not found',
      message: 'Database not yet connected. Please set up D1 first.',
    }, { status: 404 });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
