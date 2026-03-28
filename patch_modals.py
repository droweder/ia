import os
import glob
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Container Backgrounds (Modais, Dropdowns, Tooltips grandes)
    replacements = [
        (r'bg-white dark:bg-\[\#111111\]', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'),
        (r'bg-white dark:bg-\[\#1a1b1e\]', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'),
        (r'bg-white dark:bg-\[\#1e293b\]', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'),
        (r'bg-white dark:bg-\[\#1E1E1E\]', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'),
        (r'bg-white dark:bg-\[\#212121\]', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'),
        (r'bg-white dark:bg-slate-800(?!/)', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'),
        (r'bg-white dark:bg-slate-900(?!/)', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'),
        (r'bg-slate-50 dark:bg-slate-800(?!/)', r'bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-xl'),
        (r'bg-white dark:bg-transparent', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'), # specifically seen in some buttons/modals
    ]

    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)

    # Extra fix for solid dark bg with white light
    new_content = re.sub(r'bg-gray-50 dark:bg-gray-900(?!/)', r'bg-transparent', new_content)
    new_content = re.sub(r'bg-slate-50 dark:bg-slate-900(?!/)', r'bg-transparent', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Process components and pages
for directory in ['src/components', 'src/pages']:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                update_file(os.path.join(root, file))
