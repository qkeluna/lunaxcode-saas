const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
    'src/app/(admin)/admin',
    'src/components/admin',
];

const REPLACEMENTS = [
    { regex: /\bbg-white\b/g, replace: 'bg-card' },
    { regex: /\btext-gray-900\b/g, replace: 'text-foreground' },
    { regex: /\btext-gray-800\b/g, replace: 'text-foreground' },
    { regex: /\btext-gray-700\b/g, replace: 'text-muted-foreground' },
    { regex: /\btext-gray-600\b/g, replace: 'text-muted-foreground' },
    { regex: /\btext-gray-500\b/g, replace: 'text-muted-foreground' },
    { regex: /\btext-gray-400\b/g, replace: 'text-muted-foreground' },
    { regex: /\bbg-gray-50\b/g, replace: 'bg-muted/50' },
    { regex: /\bbg-gray-100\b/g, replace: 'bg-muted' },
    { regex: /\bbg-gray-200\b/g, replace: 'bg-muted/80' },
    { regex: /\bbg-gray-800\b/g, replace: 'bg-muted' }, // Assuming this was a manual dark mode attempt
    { regex: /\bbg-gray-900\b/g, replace: 'bg-card' }, // Assuming this was a manual dark mode attempt
    { regex: /\bborder-gray-200\b/g, replace: 'border-border' },
    { regex: /\bborder-gray-300\b/g, replace: 'border-border' },
    { regex: /\bbg-red-100 text-red-800(?! dark:)/g, replace: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
    { regex: /\bbg-yellow-100 text-yellow-800(?! dark:)/g, replace: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
    { regex: /\bbg-green-100 text-green-800(?! dark:)/g, replace: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
    { regex: /\bbg-blue-100 text-blue-800(?! dark:)/g, replace: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
    { regex: /\bbg-purple-100 text-purple-800(?! dark:)/g, replace: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
];

function processPath(targetPath) {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
        const files = fs.readdirSync(targetPath);
        for (const file of files) {
            processPath(path.join(targetPath, file));
        }
    } else if (stat.isFile() && (targetPath.endsWith('.tsx') || targetPath.endsWith('.ts'))) {
        let content = fs.readFileSync(targetPath, 'utf8');
        let modified = false;

        for (const { regex, replace } of REPLACEMENTS) {
            if (regex.test(content)) {
                content = content.replace(regex, replace);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(targetPath, content, 'utf8');
            console.log(`Updated: ${targetPath}`);
        }
    }
}

for (const dir of DIRECTORIES) {
    processPath(path.join(process.cwd(), dir));
}

console.log('Theme replacement complete.');
