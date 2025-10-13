import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import * as relations from './relations';

// Get D1 database instance
// This works with Cloudflare Pages edge runtime
export function getDatabase(env?: any) {
  try {
    // Method 1: Try getRequestContext (works in API routes on Cloudflare Pages)
    const { getRequestContext } = require('@cloudflare/next-on-pages');
    const context = getRequestContext();

    if (context?.env?.DB) {
      return drizzle(context.env.DB, { schema: { ...schema, ...relations } });
    }
  } catch (e) {
    // getRequestContext might not be available in all contexts
  }

  // Method 2: Try provided env parameter
  if (env?.DB) {
    return drizzle(env.DB, { schema: { ...schema, ...relations } });
  }

  // Method 3: Try global (local dev)
  const d1 = (globalThis as any).DB;
  if (d1) {
    return drizzle(d1, { schema: { ...schema, ...relations } });
  }

  console.warn('⚠️  D1 database not available. No context found.');
  return null;
}

// Export types
export type Database = ReturnType<typeof getDatabase>;
