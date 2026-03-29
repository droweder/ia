import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Layout background
    content = content.replace('bg-[#0B0F19]', 'bg-slate-50 dark:bg-[#0B0F19]')

    # Sidebar styles
    content = content.replace('border-white/10 bg-white/5 backdrop-blur-xl', 'border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 backdrop-blur-xl')

    # Nav buttons
    content = content.replace('bg-white/10 text-white border-white/50', 'bg-slate-200 text-slate-900 border-slate-400 dark:bg-white/10 dark:text-white dark:border-white/50')
    content = content.replace('text-gray-300 hover:bg-white/10 hover:text-white', 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white')
    content = content.replace('text-gray-400 hover:text-white', 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white')

    # Chat message styling (if in Chat.tsx)
    content = content.replace('bg-white/5 text-gray-100', 'bg-white/40 text-slate-800 dark:bg-white/5 dark:text-gray-100')
    content = content.replace('border-white/10', 'border-slate-200 dark:border-white/10')

    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/components/Layout.tsx')
fix_file('src/pages/Chat.tsx')
