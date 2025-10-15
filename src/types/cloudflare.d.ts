// Cloudflare environment types
declare module '@cloudflare/next-on-pages' {
  interface CloudflareEnv {
    DB: D1Database;
    FILES_DEV?: R2Bucket;
    FILES_PROD?: R2Bucket;
    GEMINI_API_KEY?: string;
  }
}

