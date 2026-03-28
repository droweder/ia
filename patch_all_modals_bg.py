import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The user wants all windows to match the main app screen style exactly.
    # The main screen uses extreme translucency: dark:bg-white/5 backdrop-blur-md/xl
    replacements = [
        # Fix the over-darkened modals (black/60) to be white/5 for perfect glassmorphism
        (r'bg-white/90 dark:bg-black/60 backdrop-blur-xl', r'bg-white/40 dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white/90 dark:bg-black/50 backdrop-blur-xl', r'bg-white/40 dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white/90 dark:bg-black/40 backdrop-blur-xl', r'bg-white/40 dark:bg-white/5 backdrop-blur-xl'),
        (r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl', r'bg-white/40 dark:bg-white/5 backdrop-blur-xl'),
        (r'dark:bg-\[\#111111\] border border-white/10', r'dark:bg-white/5 backdrop-blur-xl border border-white/10'),
        (r'bg-white p-6 shadow-xl dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10', r'bg-white/40 p-6 shadow-xl dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10'),
    ]

    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for directory in ['src/components', 'src/pages']:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                update_file(os.path.join(root, file))
