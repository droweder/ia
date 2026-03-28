import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = [
        (r'bg-white dark:bg-black/60 backdrop-blur-xl', r'bg-white/40 dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white dark:bg-slate-800/90 backdrop-blur-xl', r'bg-white/40 dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white p-6 shadow-xl dark:bg-slate-800/90 backdrop-blur-xl', r'bg-white/40 p-6 shadow-xl dark:bg-white/5 backdrop-blur-xl')
    ]

    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

update_file('src/components/CreateAssistantModal.tsx')
update_file('src/components/ExploreAssistantsModal.tsx')
