import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

target = """  const executeTransferChat = async (projectId: string) => {"""

replacement = """  const handleRenameProject = async (newName: string) => {
      if (!projectToRenameId) return;
      const { error } = await supabase
          .schema('droweder_ia')
          .from('projects')
          .update({ name: newName })
          .eq('id', projectToRenameId);

      if (error) {
          showToast(`Erro ao renomear projeto: ${error.message}`, "error");
      } else {
          setProjects(prev => prev.map(p => p.id === projectToRenameId ? { ...p, name: newName } : p));
          showToast("Projeto renomeado com sucesso", "success");
      }
  };

  const handleDeleteProject = async () => {
      if (!projectToDeleteId) return;

      const { error } = await supabase
          .schema('droweder_ia')
          .from('projects')
          .delete()
          .eq('id', projectToDeleteId);

      if (error) {
          showToast(`Erro ao excluir projeto: ${error.message}`, "error");
      } else {
          setProjects(prev => prev.filter(p => p.id !== projectToDeleteId));
          showToast("Projeto excluído com sucesso", "success");
      }
  };

  const executeTransferChat = async (projectId: string) => {"""

if target in content and "handleRenameProject" not in content:
    content = content.replace(target, replacement)
    with open("src/components/Layout.tsx", "w") as f:
        f.write(content)
    print("Patched project functions")
else:
    print("Already patched or target not found")
