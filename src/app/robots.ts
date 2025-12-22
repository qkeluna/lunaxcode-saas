import { MetadataRoute } from 'next';

export const runtime = 'edge';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://app.lunaxcode.site';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/projects/',
          '/onboarding/',
          '/settings/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
