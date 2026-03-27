const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Remove imports
content = content.replace("import { RenameProjectModal } from './RenameProjectModal';", "");
content = content.replace("import { DeleteProjectModal } from './DeleteProjectModal';", "");

// Remove functions
content = content.replace(/const handleRenameProject = async[^\}]+} catch[^\}]+}[^\}]+};/g, "");
content = content.replace(/const handleDeleteProject = async[^\}]+} catch[^\}]+}[^\}]+};/g, "");

fs.writeFileSync('src/components/Layout.tsx', content);
