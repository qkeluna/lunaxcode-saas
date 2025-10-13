import FAQClient from './FAQClient';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { faqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackFaqs } from '@/lib/db/fallback-data';

async function getFAQs() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback FAQs data for development');
      return fallbackFaqs;
    }

    const db = drizzle(context.env.DB);
    const faqItems = await db
      .select()
      .from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(faqs.order);

    return faqItems;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return fallbackFaqs;
  }
}

export default async function FAQ() {
  const faqs = await getFAQs();

  return <FAQClient faqs={faqs} />;
}
