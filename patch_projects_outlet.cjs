const fs = require('fs');

let content = fs.readFileSync('src/pages/Projects.tsx', 'utf8');

if (!content.includes('useOutletContext')) {
    content = content.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useOutletContext } from 'react-router-dom';");
    content = content.replace("const [projectConversations, setProjectConversations]", "const { setActiveConversationId } = useOutletContext<any>();\n  const [projectConversations, setProjectConversations]");
}

if (!content.includes('const handleOpenChat = (chatId: string) => {')) {
    content = content.replace("const handleOpenChat = (chatId: string) => {", "const handleOpenChat = (chatId: string) => {\n    setActiveConversationId(chatId);\n    navigate('/chat');\n  };");
} else if (content.includes("const handleOpenChat = (chatId: string) => {\n    // Navigate to chat")) {
    content = content.replace(
      "const handleOpenChat = (chatId: string) => {\n    // Navigate to chat and set active conversation\n    // We can rely on Layout's setActiveConversationId if we were passing it through OutletContext,\n    // but the easiest is just navigating to /chat and letting the user select, OR...\n    // To set active conversation, we need to pass it in state or use localStorage.\n    // Actually, Layout.tsx uses activeConversationId from its own state, which isn't accessible directly unless we use useOutletContext.\n    // Let's import useOutletContext.\n  };",
      "const handleOpenChat = (chatId: string) => {\n    setActiveConversationId(chatId);\n    navigate('/chat');\n  };"
    );
}

fs.writeFileSync('src/pages/Projects.tsx', content);
