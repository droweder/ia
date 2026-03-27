const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!content.includes("import { FileText, Folder, Plus")) {
    content = content.replace("import { FileText, Plus", "import { FileText, Folder, Plus");
    content = content.replace("import { FileText, Search", "import { FileText, Folder, Search");
    content = content.replace("import { FileText, LogOut", "import { FileText, Folder, LogOut");
}

fs.writeFileSync('src/components/Layout.tsx', content);
