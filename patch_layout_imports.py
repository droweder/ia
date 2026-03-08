import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

target = "import { DeleteChatModal } from './DeleteChatModal';"
replacement = """import { DeleteChatModal } from './DeleteChatModal';
import { RenameProjectModal } from './RenameProjectModal';
import { DeleteProjectModal } from './DeleteProjectModal';"""

if target in content and "RenameProjectModal" not in content:
    content = content.replace(target, replacement)
    with open("src/components/Layout.tsx", "w") as f:
        f.write(content)
    print("Patched imports")
else:
    print("Already patched or target not found")
