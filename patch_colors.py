import re

files_to_patch = [
    'src/components/SearchModal.tsx',
    'src/components/GroupChatModal.tsx',
    'src/components/ShareChatModal.tsx',
    'src/components/ArchivedChatsModal.tsx',
    'src/components/CreateAssistantModal.tsx',
    'src/components/Layout.tsx',
    'src/components/CreateProjectModal.tsx',
    'src/components/RenameProjectModal.tsx',
    'src/components/ExploreAssistantsModal.tsx'
]

replacements = [
    # General tweaks for Aurora consistency
    (r'focus:border-\[\#7e639f\] dark:focus:border-\[\#7e639f\]', r'focus:border-blue-500 dark:focus:border-[#3b82f6]'),
    (r'hover:border-\[\#7e639f\]/50 dark:hover:border-\[\#7e639f\]/50', r'hover:border-blue-500/50 dark:hover:border-[#3b82f6]/50'),
    (r'bg-\[\#7e639f\]', r'bg-blue-600 dark:bg-blue-500'),
    (r'text-\[\#7e639f\]', r'text-blue-600 dark:text-blue-400'),
    (r'bg-white dark:bg-slate-800(?!/)', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10'),
    (r'bg-white dark:bg-\[\#111111\]', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10'),
    (r'border border-white/10', r'border border-slate-200 dark:border-white/10'),
    (r'bg-white dark:bg-\[\#1e293b\] border', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border'),
]

for filepath in files_to_patch:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        for old, new in replacements:
            content = re.sub(old, new, content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched colors in {filepath}")
    except Exception as e:
        print(f"Skipping {filepath}: {e}")
