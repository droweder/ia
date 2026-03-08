import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

# Let's see if the <DeleteChatModal> logic is correct
if "RenameProjectModal" in content and "<RenameProjectModal" not in content:
    print("Wait, RenameProjectModal component usage is missing!")

# Let's find where executeDeleteChat is
if "executeDeleteChat" in content:
    print("executeDeleteChat found.")
