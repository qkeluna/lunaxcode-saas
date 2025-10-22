import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { serviceTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackServices } from '@/lib/db/fallback-data';
import PricingClient from './PricingClient';

async function getServices() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback services data for development');
      return fallbackServices;
    }

    const db = drizzle(context.env.DB);
    const services = await db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.isActive, true));

    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return fallbackServices;
  }
}

export default async function Pricing() {
  const services = await getServices();

  // Map services to plans format - limit to 3 most important
  const plans = services
    .sort((a: any, b: any) => {
      // Sort: popular first, then by price
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.basePrice - b.basePrice;
    })
    .slice(0, 3) // Limit to 3 plans
    .map((service: any) => ({
      id: service.id,
      name: service.name,
      price: (service.basePrice / 1000).toFixed(0) + 'k', // Format as 15k, 35k, etc.
      pricePerMonth: Math.round(service.basePrice / 1000), // Numeric value
      description: service.description || '',
      features: service.features ? JSON.parse(service.features) : [],
      timeline: service.timeline || 'Contact for estimate',
      popular: service.popular === true || service.popular === 1,
    }));

  return <PricingClient plans={plans} />;
}
