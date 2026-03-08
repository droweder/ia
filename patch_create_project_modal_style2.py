import re
file_path = "src/components/CreateProjectModal.tsx"
with open(file_path, "r") as f:
    content = f.read()

# I will improve the visual contrast for standard Tailwind buttons in dark mode
# based on similar chatgpt styles or standard lucide UI styles.

new_content = content.replace(
    'className="px-5 py-2.5 rounded-xl bg-blue-600 dark:bg-blue-600 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"',
    'className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-sm"'
)

new_content = new_content.replace(
    'className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"',
    'className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"'
)

with open(file_path, "w") as f:
    f.write(new_content)
