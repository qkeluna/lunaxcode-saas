import { eq, desc, and } from 'drizzle-orm';
import { Database } from './client';
import { projects, tasks, users, Project, Task } from './schema';

// Project queries
export async function createProject(db: Database, data: any) {
  if (!db) throw new Error('Database not available');

  const [project] = await db.insert(projects).values(data).returning();
  return project;
}

export async function getProjectsByUserId(db: Database, userId: string) {
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectById(db: Database, projectId: number, userId: string) {
  if (!db) throw new Error('Database not available');

  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
      )
    );

  return project;
}

export async function getProjectWithTasks(db: Database, projectId: number, userId: string) {
  if (!db) throw new Error('Database not available');

  const project = await getProjectById(db, projectId, userId);
  if (!project) return null;

  const projectTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.order);

  return {
    ...project,
    tasks: projectTasks,
  };
}

// Task queries
export async function createTasks(db: Database, taskData: any[]) {
  if (!db) throw new Error('Database not available');

  return await db.insert(tasks).values(taskData).returning();
}

export async function updateTaskStatus(db: Database, taskId: number, status: string) {
  if (!db) throw new Error('Database not available');

  const [task] = await db
    .update(tasks)
    .set({
      status,
      updatedAt: new Date().getTime(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  return task;
}

export async function getTasksByProjectId(db: Database, projectId: number) {
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.order);
}

// User queries
export async function getUserByEmail(db: Database, email: string) {
  if (!db) throw new Error('Database not available');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  return user;
}

// Stats queries
export async function getProjectStats(db: Database, userId: string) {
  if (!db) throw new Error('Database not available');

  const allProjects = await getProjectsByUserId(db, userId);

  return {
    total: allProjects.length,
    active: allProjects.filter(p => p.status === 'in-progress').length,
    completed: allProjects.filter(p => p.status === 'completed').length,
    pendingPayment: allProjects.filter(p => p.paymentStatus === 'pending').length,
  };
}
