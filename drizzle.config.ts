import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  // For Drizzle Studio, point to local SQLite file
  dbCredentials: {
    url: 'file:./local.db',
  },
} satisfies Config;
