import FAQClient from './FAQClient';

async function getFAQs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/faqs`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch FAQs');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

export default async function FAQ() {
  const faqs = await getFAQs();

  return <FAQClient faqs={faqs} />;
}
