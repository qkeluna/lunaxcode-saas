import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import * as relations from './relations';

// Get D1 database instance
// This works with Cloudflare Workers and local development
export function getDatabase(env?: any) {
  // In Cloudflare Workers, env.DB is available
  // In local dev, we use process.env
  const d1 = env?.DB || (globalThis as any).DB;

  if (!d1) {
    console.warn('⚠️  D1 database not available. Using fallback.');
    return null;
  }

  return drizzle(d1, { schema: { ...schema, ...relations } });
}

// Export types
export type Database = ReturnType<typeof getDatabase>;
