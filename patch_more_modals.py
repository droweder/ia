import os
import re

files_to_check = [
    'src/components/ArchivedChatsModal.tsx',
    'src/components/DeleteProjectModal.tsx',
    'src/components/RenameProjectModal.tsx',
    'src/components/SelectProjectModal.tsx',
    'src/components/NoProjectsWarningModal.tsx'
]

def update_file(filepath):
    if not os.path.exists(filepath):
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic fix for solid white / opaque dark backgrounds to translucent
    replacements = [
        (r'bg-white dark:bg-black/60', r'bg-white/40 dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white dark:bg-black/50', r'bg-white/40 dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white dark:bg-slate-800', r'bg-white/40 dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white p-6 shadow-xl dark:bg-slate-800', r'bg-white/40 p-6 shadow-xl dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white p-6 shadow-xl dark:bg-black/60', r'bg-white/40 p-6 shadow-xl dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white rounded-2xl shadow-xl dark:bg-black/60', r'bg-white/40 rounded-2xl shadow-xl dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white overflow-hidden shadow-xl dark:bg-black/60', r'bg-white/40 overflow-hidden shadow-xl dark:bg-white/5 backdrop-blur-xl'),
    ]

    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for filepath in files_to_check:
    update_file(filepath)
