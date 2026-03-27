const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// I'll put the states back to avoid breaking compilation of unused variables that were missed.
content = content.replace("const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);", "const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);\nconst [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);\nconst [projectToRenameCurrentName, setProjectToRenameCurrentName] = useState('');\nconst [projectToRenameId, setProjectToRenameId] = useState<string | null>(null);\nconst [projectToDeleteId, setProjectToDeleteId] = useState<string | null>(null);\nconst [isRenameProjectModalOpen, setIsRenameProjectModalOpen] = useState(false);\nconst [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);");

fs.writeFileSync('src/components/Layout.tsx', content);
