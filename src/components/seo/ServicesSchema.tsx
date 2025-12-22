import JsonLd from './JsonLd';

interface Service {
  name: string;
  description?: string | null;
  basePrice: number;
}

interface ServicesSchemaProps {
  services: Service[];
}

export default function ServicesSchema({ services }: ServicesSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.name,
        description: service.description || `Professional ${service.name} development services`,
        provider: {
          '@type': 'ProfessionalService',
          name: 'Lunaxcode',
          '@id': 'https://app.lunaxcode.site/#organization',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Philippines',
        },
        offers: {
          '@type': 'Offer',
          price: service.basePrice,
          priceCurrency: 'PHP',
          priceValidUntil: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split('T')[0],
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return <JsonLd data={schema} />;
}
