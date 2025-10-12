import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import * as relations from './relations';

// This will be used in API routes with Cloudflare context
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema: { ...schema, ...relations } });
}

// Type export for convenience
export type Database = ReturnType<typeof getDb>;

// Re-export schema
export * from './schema';
