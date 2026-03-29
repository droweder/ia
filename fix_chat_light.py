import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# Fix the main wrapper background, the current one is likely hardcoded `bg-[#0B0F19]`. Let's verify by replacing explicitly.
content = content.replace('bg-[#0B0F19]', 'bg-slate-50 dark:bg-[#0B0F19]')

# Fix user message bubble
content = content.replace('bg-white/10 text-white', 'bg-blue-600 text-white')
content = content.replace('border-white/20', 'border-slate-200 dark:border-white/20')

# Fix AI message bubble
content = content.replace('bg-white/5 text-gray-100', 'bg-white/60 dark:bg-white/5 text-slate-800 dark:text-gray-100')
content = content.replace('border-white/10', 'border-slate-200 dark:border-white/10')

# Fix input area
content = content.replace('bg-[#0B0F19]/90', 'bg-white/90 dark:bg-[#0B0F19]/90')
content = content.replace('bg-white/5', 'bg-white/60 dark:bg-white/5')
content = content.replace('text-white', 'text-slate-800 dark:text-white')
content = content.replace('text-gray-400', 'text-slate-500 dark:text-gray-400')

with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)
