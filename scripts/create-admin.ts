// Note: This script is for reference. In Cloudflare D1, you'll need to:
// 1. Create D1 database: wrangler d1 create lunaxcode-dev
// 2. Apply migrations: wrangler d1 migrations apply lunaxcode-dev --local
// 3. Create admin user manually via SQL or through first Google OAuth login
// 4. Update user role to admin: wrangler d1 execute lunaxcode-dev --command="UPDATE users SET role='admin' WHERE email='your-email@gmail.com'"

console.log(`
🔧 Creating Admin User for Cloudflare D1

Step 1: Create D1 Database
  wrangler d1 create lunaxcode-dev

Step 2: Update wrangler.toml
  Copy the database_id from output and paste it into wrangler.toml

Step 3: Apply Migrations
  wrangler d1 migrations apply lunaxcode-dev --local

Step 4: Login with Google OAuth
  1. Start dev server: npm run dev
  2. Go to http://localhost:3000/login
  3. Sign in with your Google account

Step 5: Set Admin Role
  wrangler d1 execute lunaxcode-dev --local --command="UPDATE users SET role='admin' WHERE email='YOUR_EMAIL@gmail.com'"

For production, replace --local with production database name.
`);
