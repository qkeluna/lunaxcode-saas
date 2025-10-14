#!/bin/bash
# Sync production database to local development environment

set -e

echo "🔄 Syncing production data to local database..."
echo ""

# Tables to sync (in dependency order)
TABLES=(
  "users"
  "service_types"
  "questions"
  "question_options"
  "faqs"
  "portfolio"
  "process_steps"
  "features"
  "projects"
  "project_answers"
  "tasks"
  "payments"
  "messages"
  "files"
)

# Clear local data first (in reverse order to handle foreign keys)
echo "🗑️  Clearing local data..."
for ((i=${#TABLES[@]}-1; i>=0; i--)); do
  TABLE="${TABLES[$i]}"
  echo "  - Clearing $TABLE..."
  npx wrangler d1 execute lunaxcode-prod --local --command="DELETE FROM $TABLE;" 2>/dev/null || true
done

echo ""
echo "📥 Downloading production data..."

# Export and import each table
for TABLE in "${TABLES[@]}"; do
  echo "  - Syncing $TABLE..."

  # Export from production
  EXPORT_FILE="/tmp/lunaxcode_${TABLE}.sql"

  # Get the data as JSON and convert to SQL INSERT statements
  npx wrangler d1 execute lunaxcode-prod --remote --command="SELECT * FROM $TABLE;" --json > "${EXPORT_FILE}.json" 2>/dev/null

  # Parse JSON and create INSERT statements using Node.js
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('${EXPORT_FILE}.json', 'utf8'));

    if (data && data[0] && data[0].results && data[0].results.length > 0) {
      const rows = data[0].results;
      const columns = Object.keys(rows[0]);

      const inserts = rows.map(row => {
        const values = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'number') return val;
          return \"'\" + String(val).replace(/'/g, \"''\") + \"'\";
        }).join(', ');
        return \`INSERT INTO $TABLE (${columns.join(', ')}) VALUES (${values});\`;
      });

      fs.writeFileSync('${EXPORT_FILE}', inserts.join('\\n'));
      console.log(\`    ✓ ${rows.length} rows\`);
    } else {
      fs.writeFileSync('${EXPORT_FILE}', '');
      console.log('    ✓ 0 rows');
    }
  "

  # Import to local if file has content
  if [ -s "$EXPORT_FILE" ]; then
    npx wrangler d1 execute lunaxcode-prod --local --file="$EXPORT_FILE" 2>/dev/null || true
  fi

  # Cleanup
  rm -f "${EXPORT_FILE}" "${EXPORT_FILE}.json"
done

echo ""
echo "✅ Production data synced to local database successfully!"
echo ""
echo "📊 Local database summary:"
for TABLE in "${TABLES[@]}"; do
  COUNT=$(npx wrangler d1 execute lunaxcode-prod --local --command="SELECT COUNT(*) as count FROM $TABLE;" --json 2>/dev/null | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(data[0].results[0].count);")
  printf "  %-20s %s rows\n" "$TABLE:" "$COUNT"
done

echo ""
echo "🎉 Sync complete!"
