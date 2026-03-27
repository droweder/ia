import re

files_to_patch = {
    'src/components/SearchModal.tsx': [
        (r'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-gray-200', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10')
    ],
    'src/components/SelectProjectModal.tsx': [
        (r'bg-white p-6 shadow-xl dark:bg-\[\#111111\] border border-white/10', r'bg-white/90 p-6 shadow-xl dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10')
    ],
    'src/components/ArchivedChatsModal.tsx': [
        (r'bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-\[80vh\] overflow-hidden', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden')
    ],
    'src/components/CreateAssistantModal.tsx': [
        (r'bg-white dark:bg-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-\[90vh\] overflow-hidden', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden')
    ],
    'src/components/DeleteProjectModal.tsx': [
        (r'bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden')
    ],
    'src/components/NoProjectsWarningModal.tsx': [
        (r'bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden')
    ],
    'src/components/DeleteChatModal.tsx': [
        (r'bg-white dark:bg-\[\#1a1b1e\] p-6 rounded-2xl max-w-md w-full shadow-2xl border border-white/10', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10')
    ],
    'src/components/ExploreAssistantsModal.tsx': [
        (r'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-gray-200 w-full max-w-\[800px\] h-\[80vh\] rounded-2xl shadow-2xl flex flex-col overflow-hidden', r'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 w-full max-w-[800px] h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden')
    ]
}

for filepath, replacements in files_to_patch.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        for old, new in replacements:
            content = re.sub(old, new, content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filepath}")
    except Exception as e:
        print(f"Skipping {filepath}: {e}")
