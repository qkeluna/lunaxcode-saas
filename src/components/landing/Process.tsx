import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { processSteps } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackProcess } from '@/lib/db/fallback-data';
import ProcessClient from './ProcessClient';

interface ProcessStep {
  title: string;
  description: string;
}

async function getProcessSteps() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback process data for development');
      return fallbackProcess;
    }

    const db = drizzle(context.env.DB);
    const steps = await db
      .select()
      .from(processSteps)
      .where(eq(processSteps.isActive, true))
      .orderBy(processSteps.order);

    return steps;
  } catch (error) {
    console.error('Error fetching process steps:', error);
    return fallbackProcess;
  }
}

export default async function Process() {
  const processStepsData = await getProcessSteps();

  // Map database fields to component format
  const steps = processStepsData.map((step: any, index: number) => ({
    number: String(index + 1).padStart(2, '0'),
    title: step.title,
    description: step.description,
    iconIndex: index,
  }));

  return <ProcessClient steps={steps} />;
}
