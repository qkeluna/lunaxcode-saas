#!/bin/bash

echo "🚀 Lunaxcode D1 Database Setup"
echo "================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

echo "✅ Wrangler CLI found"
echo ""

# Login to Cloudflare
echo "📝 Step 1: Login to Cloudflare"
echo "You'll be redirected to authenticate..."
wrangler login

echo ""
echo "📝 Step 2: Creating D1 Database"
echo "Creating local development database..."

# Create D1 database
wrangler d1 create lunaxcode-dev

echo ""
echo "⚠️  IMPORTANT: Copy the database_id from above and update wrangler.toml"
echo ""
echo "📝 Step 3: Apply Migrations"
read -p "Press enter after updating wrangler.toml to continue..."

# Apply migrations locally
echo "Applying migrations to local database..."
wrangler d1 migrations apply lunaxcode-dev --local

echo ""
echo "📝 Step 4: Creating R2 Bucket"
wrangler r2 bucket create lunaxcode-files

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Test project creation at http://localhost:3000/onboarding"
echo "3. Data will now persist between restarts!"
echo ""
