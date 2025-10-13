import { drizzle } from 'drizzle-orm/d1';
import { getRequestContext } from '@cloudflare/next-on-pages';
import * as schema from './schema';
import * as relations from './relations';

// Get D1 database instance
// This works with Cloudflare Pages edge runtime
export function getDatabase(env?: any) {
  try {
    // Method 1: Try getRequestContext (works in API routes on Cloudflare Pages)
    const context = getRequestContext();

    if (context?.env?.DB) {
      console.log('[getDatabase] Using getRequestContext - DB available');
      return drizzle(context.env.DB, { schema: { ...schema, ...relations } });
    } else {
      console.log('[getDatabase] getRequestContext returned but no DB binding:', {
        hasContext: !!context,
        hasEnv: !!context?.env,
        hasDB: !!context?.env?.DB
      });
    }
  } catch (e: any) {
    console.log('[getDatabase] getRequestContext failed:', e.message);
  }

  // Method 2: Try provided env parameter
  if (env?.DB) {
    console.log('[getDatabase] Using provided env parameter');
    return drizzle(env.DB, { schema: { ...schema, ...relations } });
  }

  // Method 3: Try global (local dev)
  const d1 = (globalThis as any).DB;
  if (d1) {
    console.log('[getDatabase] Using global DB (local dev)');
    return drizzle(d1, { schema: { ...schema, ...relations } });
  }

  console.error('[getDatabase] ⚠️  D1 database not available. No context found.');
  return null;
}

// Export types
export type Database = ReturnType<typeof getDatabase>;
