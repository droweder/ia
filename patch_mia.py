import re

file_path = "src/pages/Chat.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to find the header div containing "Mia AI"
pattern = r"""(<div className="flex items-center gap-4">\s*)<div className="font-medium text-slate-700 dark:text-gray-200 text-sm py-1\.5 pl-2 flex items-center gap-2">\s*<span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>\s*Mia AI\s*</div>"""

new_content = re.sub(pattern, r"\1", content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Patched Chat.tsx")
