import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

# Fix the main wrapper background, the current one is likely hardcoded `bg-[#0B0F19]`. Let's verify by replacing explicitly.
content = content.replace('bg-[#0B0F19] selection:bg-blue-500/30', 'bg-slate-50 dark:bg-[#0B0F19] selection:bg-blue-500/30')

# Sidebar is using bg-white/5. Let's give it a light background.
content = content.replace('bg-white/5 backdrop-blur-xl', 'bg-white/80 dark:bg-white/5 backdrop-blur-xl border-slate-200 dark:border-white/10')

# Nav links
content = content.replace('text-gray-300 hover:bg-white/10 hover:text-white', 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white')
content = content.replace('bg-white/10 text-white border-r-2 border-white/50', 'bg-slate-100 text-blue-600 border-r-2 border-blue-500 dark:bg-white/10 dark:text-white dark:border-white/50')

# Sidebar toggle button
content = content.replace('hover:bg-white/10 text-white', 'hover:bg-slate-200 text-slate-800 dark:hover:bg-white/10 dark:text-white')

# Mobile header
content = content.replace('bg-[#0B0F19]/90', 'bg-white/90 dark:bg-[#0B0F19]/90')
content = content.replace('border-white/10', 'border-slate-200 dark:border-white/10')

# Ensure text colors are dynamic
content = content.replace('text-gray-400', 'text-slate-500 dark:text-gray-400')
content = content.replace('text-white', 'text-slate-800 dark:text-white')

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
