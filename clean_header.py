import re

file_path = "src/pages/Chat.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Also remove the border-l since there's no item to its left anymore
pattern = r"""<div className="relative border-l border-slate-300 dark:border-white/10 pl-4 ml-2" ref=\{modelMenuRef\}>"""
replacement = r"""<div className="relative" ref={modelMenuRef}>"""

new_content = re.sub(pattern, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Cleaned up Model Selector wrapper")
