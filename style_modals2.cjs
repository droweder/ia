const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if they are already styled using different names or variables
  content = content.replace(/dark:bg-slate-900/g, 'dark:bg-slate-800/90 dark:backdrop-blur-xl');
  content = content.replace(/dark:bg-gray-800/g, 'dark:bg-slate-800/90 dark:backdrop-blur-xl');
  content = content.replace(/dark:bg-gray-900/g, 'dark:bg-slate-800/90 dark:backdrop-blur-xl');

  fs.writeFileSync(filePath, content);
}
