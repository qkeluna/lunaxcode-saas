import JsonLd from './JsonLd';

export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': 'https://app.lunaxcode.site/#organization',
    name: 'Lunaxcode',
    alternateName: 'Lunaxcode Web Development',
    description:
      'AI-powered web development agency serving Filipino businesses. Professional websites, e-commerce, and custom web applications.',
    url: 'https://app.lunaxcode.site',
    logo: 'https://app.lunaxcode.site/android-chrome-512x512.png',
    image: 'https://app.lunaxcode.site/og-image.png',
    telephone: '+639190852974',
    email: 'lunaxcode2030@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Metro Manila',
      addressRegion: 'NCR',
      addressCountry: 'PH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 14.5995,
      longitude: 120.9842,
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Metro Manila',
        '@id': 'https://www.wikidata.org/wiki/Q13580',
      },
      {
        '@type': 'Country',
        name: 'Philippines',
        '@id': 'https://www.wikidata.org/wiki/Q928',
      },
    ],
    priceRange: 'PHP8,000 - PHP200,000',
    currenciesAccepted: 'PHP',
    paymentAccepted: ['GCash', 'PayMaya', 'Bank Transfer', 'SeaBank'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [
      'https://facebook.com/lunaxcode',
      'https://instagram.com/lunaxcode',
      'https://linkedin.com/company/lunaxcode',
    ],
    foundingDate: '2024',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+639190852974',
        contactType: 'sales',
        availableLanguage: ['English', 'Filipino'],
        areaServed: 'PH',
      },
      {
        '@type': 'ContactPoint',
        email: 'lunaxcode2030@gmail.com',
        contactType: 'customer service',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return <JsonLd data={schema} />;
}
