#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const TABLES = [
  'users',
  'service_types',
  'questions',
  'question_options',
  'faqs',
  'portfolio',
  'process_steps',
  'features',
  'projects',
  'project_answers',
  'tasks',
  'payments',
  'messages',
  'files'
];

console.log('🔄 Syncing production data to local database...\n');

// Clear local data first (in reverse order to handle foreign keys)
console.log('🗑️  Clearing local data...');
for (let i = TABLES.length - 1; i >= 0; i--) {
  const table = TABLES[i];
  console.log(`  - Clearing ${table}...`);
  try {
    execSync(`npx wrangler d1 execute lunaxcode-dev --local --command="DELETE FROM ${table};" 2>/dev/null`, {
      stdio: 'ignore'
    });
  } catch (e) {
    // Ignore errors
  }
}

console.log('\n📥 Downloading production data...');

// Export and import each table
for (const table of TABLES) {
  console.log(`  - Syncing ${table}...`);

  try {
    // Export from production as JSON
    const result = execSync(
      `npx wrangler d1 execute lunaxcode-prod --remote --command="SELECT * FROM ${table};" --json`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );

    const data = JSON.parse(result);

    if (data && data[0] && data[0].results && data[0].results.length > 0) {
      const rows = data[0].results;
      const columns = Object.keys(rows[0]);

      // Create INSERT statements (quote column names to handle reserved keywords)
      const inserts = rows.map(row => {
        const values = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'number') return val;
          return "'" + String(val).replace(/'/g, "''") + "'";
        }).join(', ');
        const quotedColumns = columns.map(col => `"${col}"`).join(', ');
        return `INSERT INTO ${table} (${quotedColumns}) VALUES (${values});`;
      });

      // Write to temp file
      const tmpFile = `/tmp/lunaxcode_${table}.sql`;
      fs.writeFileSync(tmpFile, inserts.join('\n'));

      // Import to local
      execSync(`npx wrangler d1 execute lunaxcode-dev --local --file="${tmpFile}" 2>/dev/null`, {
        stdio: 'ignore'
      });

      // Cleanup
      fs.unlinkSync(tmpFile);

      console.log(`    ✓ ${rows.length} rows`);
    } else {
      console.log('    ✓ 0 rows');
    }
  } catch (error) {
    console.log(`    ✗ Error: ${error.message}`);
  }
}

console.log('\n✅ Production data synced to local database successfully!\n');
console.log('📊 Local database summary:');

// Show counts
for (const table of TABLES) {
  try {
    const result = execSync(
      `npx wrangler d1 execute lunaxcode-dev --local --command="SELECT COUNT(*) as count FROM ${table};" --json`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const data = JSON.parse(result);
    const count = data[0].results[0].count;
    console.log(`  ${table.padEnd(20)} ${count} rows`);
  } catch (e) {
    console.log(`  ${table.padEnd(20)} Error`);
  }
}

console.log('\n🎉 Sync complete!');
