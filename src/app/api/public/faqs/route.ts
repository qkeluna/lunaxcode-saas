import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/client';
import { faqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fallbackFaqs } from '@/lib/db/fallback-data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase((request as any).env);

    if (!db) {
      console.log('Using fallback FAQs data for development');
      return NextResponse.json(fallbackFaqs);
    }

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
