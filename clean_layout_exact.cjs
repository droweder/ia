const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const r1 = content.indexOf('const handleRenameProject');
const r1end = content.indexOf('const handleDeleteProject');
const r2end = content.indexOf('const executeTransferChat');

if (r1 !== -1 && r1end !== -1 && r2end !== -1) {
  content = content.substring(0, r1) + content.substring(r2end);
}

content = content.replace("import { RenameProjectModal } from './RenameProjectModal';", "");
content = content.replace("import { DeleteProjectModal } from './DeleteProjectModal';", "");
content = content.replace(/const \[projectToRenameCurrentName, setProjectToRenameCurrentName\] = useState\(''\);/, "");

fs.writeFileSync('src/components/Layout.tsx', content);
