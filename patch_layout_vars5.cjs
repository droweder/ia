const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// I will just remove all project renaming/deleting references from Layout.tsx because they belong to Projects.tsx now.
content = content.replace(/const \[projectToRenameCurrentName, setProjectToRenameCurrentName\] = useState[^]+?const \[isArchivedChatsModalOpen, setIsArchivedChatsModalOpen\] = useState\(false\);/, "const [isArchivedChatsModalOpen, setIsArchivedChatsModalOpen] = useState(false);");

// Now we need to remove the references inside useEffect
content = content.replace(/\/\/ Close project menu if clicking outside[^]+?setOpenProjectMenuId\(null\);\n      }/, "");
content = content.replace(/if \(openProjectMenuId\) {\n            setOpenProjectMenuId\(null\);\n        }/, "");
content = content.replace(/, openProjectMenuId/g, "");

content = content.replace(/const projectMenuRef = useRef<HTMLDivElement>\(null\);/g, "");

content = content.replace(/const handleRenameProject = async \(newName: string\) => {[^]+?showToast\('Projeto renomeado com sucesso\.', 'success'\);\n        }\n    };/g, "");
content = content.replace(/const handleDeleteProject = async \(\) => {[^]+?showToast\('Projeto excluído com sucesso\.', 'success'\);\n        }\n    };/g, "");

fs.writeFileSync('src/components/Layout.tsx', content);
