const fs = require('fs');

let content = fs.readFileSync('src/pages/Projects.tsx', 'utf8');

const loadChatsFunc = `
  const loadProjectChats = async (project: any) => {
    setActiveProject(project);
    setIsChatsLoading(true);
    try {
      const { data, error } = await supabase
        .schema('droweder_ia')
        .from('conversations')
        .select('*')
        .eq('project_id', project.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjectConversations(data || []);
    } catch (err) {
      console.error('Error loading project chats:', err);
      showToast('Erro ao carregar chats do projeto.', 'error');
    } finally {
      setIsChatsLoading(false);
    }
  };

  const handleOpenChat = (chatId: string) => {
    // Navigate to chat and set active conversation
    // We can rely on Layout's setActiveConversationId if we were passing it through OutletContext,
    // but the easiest is just navigating to /chat and letting the user select, OR...
    // To set active conversation, we need to pass it in state or use localStorage.
    // Actually, Layout.tsx uses activeConversationId from its own state, which isn't accessible directly unless we use useOutletContext.
    // Let's import useOutletContext.
  };
`;

if (!content.includes('loadProjectChats')) {
    content = content.replace("const loadProjects = async () => {", `${loadChatsFunc}\n\n  const loadProjects = async () => {`);
    fs.writeFileSync('src/pages/Projects.tsx', content);
}
