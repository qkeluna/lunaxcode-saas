import JsonLd from './JsonLd';

export default function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://app.lunaxcode.site/#website',
    url: 'https://app.lunaxcode.site',
    name: 'Lunaxcode',
    description:
      'AI-powered web development agency for Filipino businesses. Professional websites from PHP8,000.',
    publisher: {
      '@id': 'https://app.lunaxcode.site/#organization',
    },
    inLanguage: 'en-PH',
  };

  return <JsonLd data={schema} />;
}
