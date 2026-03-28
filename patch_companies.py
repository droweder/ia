import re

file_path = "src/pages/admin/Companies.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Loading
content = content.replace(
    'className="p-8 flex items-center justify-center h-full dark:bg-gray-900"',
    'className="p-8 flex items-center justify-center h-full bg-transparent"'
)

# Access Denied
content = content.replace(
    'className="flex flex-col items-center justify-center h-full dark:bg-gray-900 text-gray-600 dark:text-gray-400 p-8 text-center space-y-4"',
    'className="flex flex-col items-center justify-center h-full bg-transparent text-slate-600 dark:text-gray-400 p-8 text-center space-y-4"'
)

# Main background
content = content.replace(
    'className="p-8 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200"',
    'className="p-8 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto bg-transparent transition-colors duration-200 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800"'
)

# Text updates
content = content.replace('text-gray-900', 'text-slate-900')
content = content.replace('text-gray-800', 'text-slate-800')
content = content.replace('text-gray-600', 'text-slate-600')
content = content.replace('text-gray-500', 'text-slate-500')
content = content.replace('text-gray-400', 'text-slate-400')
content = content.replace('text-gray-300', 'text-slate-300')
content = content.replace('text-gray-200', 'text-slate-200')
content = content.replace('text-gray-100', 'text-slate-100')

# Card/Table backgrounds and borders
content = content.replace(
    'bg-white dark:bg-gray-800',
    'bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl'
)
content = content.replace(
    'border border-gray-200 dark:border-gray-700',
    'border border-slate-200 dark:border-white/10'
)
content = content.replace(
    'border-b border-gray-100 dark:border-gray-700',
    'border-b border-slate-200 dark:border-white/10'
)
content = content.replace(
    'bg-gray-50/50 dark:bg-gray-800/50',
    'bg-white/50 dark:bg-slate-900/50'
)
content = content.replace(
    'bg-gray-50 dark:bg-gray-900/50',
    'bg-white/50 dark:bg-slate-900/50'
)
content = content.replace(
    'divide-gray-100 dark:divide-gray-700',
    'divide-slate-200 dark:divide-white/10'
)
content = content.replace(
    'hover:bg-gray-50 dark:hover:bg-gray-750',
    'hover:bg-white/60 dark:hover:bg-slate-800/60'
)

# Input field and specific table elements
content = content.replace(
    'bg-white dark:bg-gray-700 dark:text-slate-200 dark:placeholder-gray-500',
    'bg-white/50 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-400 backdrop-blur-sm'
)
content = content.replace(
    'border border-gray-200 dark:border-gray-600',
    'border border-slate-200 dark:border-white/10'
)
content = content.replace(
    'bg-gray-100 dark:bg-gray-700',
    'bg-white/60 dark:bg-slate-800/60'
)
content = content.replace(
    'hover:bg-gray-100 dark:hover:bg-gray-700',
    'hover:bg-white/80 dark:hover:bg-slate-700/80'
)
content = content.replace(
    'focus:ring-indigo-500/20 focus:border-indigo-500',
    'focus:ring-blue-500/20 focus:border-blue-500'
)
content = content.replace(
    'bg-indigo-600 hover:bg-indigo-700',
    'bg-blue-600 hover:bg-blue-700'
)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched Companies.tsx")
