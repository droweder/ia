import re

files = ["src/pages/Files.tsx"]

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Inputs should have a bit of backdrop
    content = content.replace(
        'className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
        'className="flex-1 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10'
    )

    content = content.replace(
        'className="pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
        'className="pl-9 pr-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10'
    )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Patched Files.tsx inputs")
