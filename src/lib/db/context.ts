// Helper to safely get Cloudflare context in both dev and production
import { getRequestContext } from '@cloudflare/next-on-pages';

export function getCloudflareContext() {
  try {
    // In production (Cloudflare Pages), this will work
    return getRequestContext();
  } catch (error) {
    // In development, this will fail - return null to use fallback data
    return null;
  }
}
