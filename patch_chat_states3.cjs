const fs = require('fs');
let content = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

content = content.replace("FileIcon } from 'lucide-react';", "FileIcon, Sparkles } from 'lucide-react';");

fs.writeFileSync('src/pages/Chat.tsx', content);
