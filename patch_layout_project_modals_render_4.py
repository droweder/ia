import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

target = """      <DeleteChatModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
            setIsDeleteModalOpen(false);
            setChatToDeleteId(null);
        }}
        onConfirm={() => {
            if (chatToDeleteId) {
                handleDeleteChat(chatToDeleteId);
                setChatToDeleteId(null);
            }
        }}
      />"""

replacement = """      <DeleteChatModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
            setIsDeleteModalOpen(false);
            setChatToDeleteId(null);
        }}
        onConfirm={() => {
            if (chatToDeleteId) {
                handleDeleteChat(chatToDeleteId);
                setChatToDeleteId(null);
            }
        }}
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

content = content.replace(target, replacement)
with open("src/components/Layout.tsx", "w") as f:
    f.write(content)
print("Patched rendering successfully!")
