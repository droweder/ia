import re

file_path = "src/pages/Login.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('bg-slate-950', 'bg-black')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched Login.tsx")
