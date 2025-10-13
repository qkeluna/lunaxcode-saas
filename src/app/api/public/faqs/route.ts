import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { faqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackFaqs } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET() {
  try {
    const context = getCloudflareContext();

    if (!context) {
      console.log('Using fallback FAQs data for development');
      return NextResponse.json(fallbackFaqs);
    }

    const db = drizzle(context.env.DB);
    const faqItems = await db
      .select()
      .from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(faqs.order);

    return NextResponse.json(faqItems);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
