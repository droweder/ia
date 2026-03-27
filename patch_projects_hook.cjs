const fs = require('fs');
let content = fs.readFileSync('src/pages/Projects.tsx', 'utf8');

if (!content.includes('useOutletContext')) {
    content = content.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useOutletContext } from 'react-router-dom';");
}

if (!content.includes('const { setActiveConversationId }')) {
    content = content.replace(
      "const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);",
      "const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);\n  const { setActiveConversationId } = useOutletContext<any>();"
    );
}

fs.writeFileSync('src/pages/Projects.tsx', content);
