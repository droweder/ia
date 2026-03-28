import re

file_path = "src/components/ExploreAssistantsModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix broken button styling
broken_btn = r'className="w-full py-2 px-4 rounded-lg bg-blue-600 dark:bg-blue-500/10 dark:bg-blue-600 dark:bg-blue-500/20 text-blue-500 dark:text-\[\#a881d8\] font-medium text-sm hover:bg-blue-600 dark:bg-blue-500 hover:text-white dark:hover:bg-blue-600 dark:bg-blue-500 dark:hover:text-white transition-colors"'
fixed_btn = r'className="w-full py-2 px-4 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium text-sm hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors"'

content = re.sub(broken_btn, fixed_btn, content)

# General review of ExploreAssistantsModal container transparency
# from "bg-white/90 dark:bg-black/60 backdrop-blur-xl" -> to something much more transluscent like chat
# Chat container has bg-transparent, and its header has dark:bg-white/5
# We can use dark:bg-white/5 or dark:bg-black/40 with strong backdrop blur
content = content.replace('bg-slate-900/50 dark:bg-black/60 dark:backdrop-blur-xl/50 backdrop-blur-sm', 'bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm')
content = content.replace('bg-white/90 dark:bg-black/60 backdrop-blur-xl', 'bg-white/40 dark:bg-white/5 backdrop-blur-2xl')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched ExploreAssistantsModal.tsx buttons and background")
