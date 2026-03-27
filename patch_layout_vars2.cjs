const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Remove remaining unused project rename variables
content = content.replace("const [projectToRenameId, setProjectToRenameId] = useState<string | null>(null);", "");

fs.writeFileSync('src/components/Layout.tsx', content);
