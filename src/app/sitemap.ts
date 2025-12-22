import { MetadataRoute } from 'next';

export const runtime = 'edge';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://app.lunaxcode.site';
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
