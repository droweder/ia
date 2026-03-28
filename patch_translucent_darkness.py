import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Increase darkness for modais, containers, sidebars to look better on pure black
    # Instead of slate-800/90, let's use black/60 or slate-950/80 which is much darker.
    replacements = [
        (r'dark:bg-slate-800/90', r'dark:bg-black/60'),
        (r'dark:bg-slate-800/50', r'dark:bg-black/40'),
        (r'dark:bg-slate-800/40', r'dark:bg-black/40'),
        (r'dark:bg-slate-800/60', r'dark:bg-black/50'),
        (r'dark:bg-slate-900/50', r'dark:bg-black/60'),
        (r'dark:bg-white/5', r'dark:bg-white/5'), # Keep some highlights
        (r'dark:bg-black/40', r'dark:bg-white/5'), # Fix inputs that might have been black/40 to white/5
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
