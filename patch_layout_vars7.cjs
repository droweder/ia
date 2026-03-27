const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Just remove these 5 exact declarations.
content = content.replace("const [isProjectsOpen, setIsProjectsOpen] = useState(true);", "");
content = content.replace("const [projectMenuPosition, setProjectMenuPosition] = useState({ top: 0, left: 0 });", "");
content = content.replace(/const \[projectToRenameCurrentName, setProjectToRenameCurrentName\] = useState\(''\);/, "");

fs.writeFileSync('src/components/Layout.tsx', content);
