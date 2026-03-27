const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// The `currentName={projectToRenameCurrentName}` is still used in the Modal because I didn't remove the Modal.
// If I leave `projectToRenameCurrentName` state alone, I just need to use it somewhere or silence the warning.
// Since we don't have the `Projects` list in the sidebar, these modals (RenameProject, DeleteProject) are useless here!
// They are used in `Projects.tsx`. So I should definitely remove them from `Layout.tsx`.

content = content.replace(/<RenameProjectModal[^]+?handleRenameProject}\n      \/>/, "");
content = content.replace(/<DeleteProjectModal[^]+?handleDeleteProject}\n      \/>/, "");

// Now remove the states associated with them.
content = content.replace(/const \[isRenameProjectModalOpen, setIsRenameProjectModalOpen\] = useState\(false\);/, "");
content = content.replace(/const \[projectToRenameId, setProjectToRenameId\] = useState<string \| null>\(null\);/, "");
content = content.replace(/const \[isDeleteProjectModalOpen, setIsDeleteProjectModalOpen\] = useState\(false\);/, "");
content = content.replace(/const \[projectToDeleteId, setProjectToDeleteId\] = useState<string \| null>\(null\);/, "");

// Also remove `handleRenameProject` and `handleDeleteProject` functions
content = content.replace(/const handleRenameProject = async \(newName: string\) => {[^]+?showToast\('Projeto renomeado com sucesso\.', 'success'\);\n        }\n    };/, "");
content = content.replace(/const handleDeleteProject = async \(\) => {[^]+?showToast\('Projeto excluído com sucesso\.', 'success'\);\n        }\n    };/, "");

fs.writeFileSync('src/components/Layout.tsx', content);
