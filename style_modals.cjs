const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace dark grays with Aurora slate
  content = content.replace(/bg-\[\#1E1E1E\]/g, 'bg-slate-800/90 backdrop-blur-xl');
  content = content.replace(/bg-\[\#212121\]/g, 'bg-slate-800/90 backdrop-blur-xl');
  content = content.replace(/bg-\[\#2A2A2A\]/g, 'bg-white/5');

  // Replace purple accents with blue
  content = content.replace(/text-purple-500/g, 'text-blue-500');
  content = content.replace(/text-purple-400/g, 'text-blue-400');
  content = content.replace(/bg-purple-600/g, 'bg-blue-600');
  content = content.replace(/hover:bg-purple-700/g, 'hover:bg-blue-700');
  content = content.replace(/ring-purple-500\/50/g, 'ring-blue-500/50');
  content = content.replace(/border-purple-500\/30/g, 'border-blue-500/30');

  // Any text-[#7e639f] replaced with blue
  content = content.replace(/text-\[\#7e639f\]/g, 'text-blue-500');

  fs.writeFileSync(filePath, content);
}
