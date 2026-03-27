const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(/const \[projectToRenameCurrentName, setProjectToRenameCurrentName\] = useState\(''\);/, "");

fs.writeFileSync('src/components/Layout.tsx', content);
