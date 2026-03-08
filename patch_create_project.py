import re

file_path = "src/components/Layout.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Let's see if Toast is imported
if "import { Toast }" not in content:
    content = content.replace(
        "import { CreateProjectModal } from './CreateProjectModal';",
        "import { CreateProjectModal } from './CreateProjectModal';\nimport { Toast } from './Toast';"
    )

# Let's add toast state
if "const [toastMessage, setToastMessage] = useState<string | null>(null);" not in content:
    content = content.replace(
        "const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);",
        "const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);\n  const [toastMessage, setToastMessage] = useState<string | null>(null);"
    )

# Update handleCreateProject
new_func = """  const handleCreateProject = async (name: string, category?: string) => {
    if (!user || !companyId) {
        setToastMessage("Erro: Usuário ou empresa não identificados.");
        return;
    }

    try {
        const newProject = {
           created_by: user.id,
           company_id: companyId,
           name: name,
           description: category || '',
        };

        const { data, error } = await supabase
           .schema('droweder_ia')
           .from('projects')
           .insert([newProject])
           .select();

        if (error) {
           console.error("Failed to create project in DB:", error);
           setToastMessage(`Erro ao criar projeto: ${error.message}`);
        } else if (data) {
           setProjects(prev => [...data, ...prev]);
           setToastMessage("Projeto criado com sucesso!");
        }
    } catch (e: any) {
         console.error("Exception creating project", e);
         setToastMessage(`Erro inesperado: ${e.message}`);
    }
  };"""

content = re.sub(
    r"  const handleCreateProject = async \(name: string, category\?: string\) => \{.*?\n  \};\n"
    r"(?=\n  const handleTransferToProjectClick)",
    new_func + "\n",
    content,
    flags=re.DOTALL
)

# Render Toast
if "<Toast" not in content:
    content = content.replace(
        "</LayoutContext.Provider>",
        """
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastMessage.includes("Erro") ? "error" : "success"}
          onClose={() => setToastMessage(null)}
        />
      )}
    </LayoutContext.Provider>"""
    )

with open(file_path, "w") as f:
    f.write(content)
