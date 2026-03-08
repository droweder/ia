import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

target = """      <DeleteChatModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
            setIsDeleteModalOpen(false);
            setChatToDeleteId(null);
        }}
        onConfirm={executeDeleteChat}
      />"""

replacement = """      <DeleteChatModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
            setIsDeleteModalOpen(false);
            setChatToDeleteId(null);
        }}
        onConfirm={executeDeleteChat}
      />

      <RenameProjectModal
        isOpen={isRenameProjectModalOpen}
        onClose={() => {
            setIsRenameProjectModalOpen(false);
            setProjectToRenameId(null);
        }}
        currentName={projectToRenameCurrentName}
        onRename={handleRenameProject}
      />

      <DeleteProjectModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => {
            setIsDeleteProjectModalOpen(false);
            setProjectToDeleteId(null);
        }}
        onConfirm={handleDeleteProject}
      />"""

if target in content:
    content = content.replace(target, replacement)
    with open("src/components/Layout.tsx", "w") as f:
        f.write(content)
    print("Patched missing components")
else:
    print("Target not found for components rendering")
