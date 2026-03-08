import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

target = """  const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] = useState(false);
  const [chatToTransferId, setChatToTransferId] = useState<string | null>(null);"""

replacement = """  const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] = useState(false);
  const [chatToTransferId, setChatToTransferId] = useState<string | null>(null);

  const [isRenameProjectModalOpen, setIsRenameProjectModalOpen] = useState(false);
  const [projectToRenameId, setProjectToRenameId] = useState<string | null>(null);
  const [projectToRenameCurrentName, setProjectToRenameCurrentName] = useState("");

  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [projectToDeleteId, setProjectToDeleteId] = useState<string | null>(null);"""

if target in content and "isRenameProjectModalOpen" not in content:
    content = content.replace(target, replacement)
    with open("src/components/Layout.tsx", "w") as f:
        f.write(content)
    print("Patched project modal states")
else:
    print("Already patched or target not found")
