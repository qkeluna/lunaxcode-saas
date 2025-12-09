import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { features as featuresTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackFeatures } from '@/lib/db/fallback-data';
import FeaturesClient from './FeaturesClient';

async function getFeatures() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback features data for development');
      return fallbackFeatures;
    }

    const db = drizzle(context.env.DB);
    const features = await db
      .select()
      .from(featuresTable)
      .where(eq(featuresTable.isActive, true))
      .orderBy(featuresTable.order);

    return features;
  } catch (error) {
    console.error('Error fetching features:', error);
    return fallbackFeatures;
  }
}

export default async function Features() {
  const features = await getFeatures();

  return <FeaturesClient features={features} />;
}
