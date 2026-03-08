import sys

with open("src/components/CreateProjectModal.tsx", "r") as f:
    content = f.read()

# Make it match the rest of the app's glassmorphic styling
# From the previous instructions and context, the default styling for modals before I reverted it was using glassmorphism.
# App's "Aurora" style: bg-white/40 dark:bg-white/5 backdrop-blur-md

old_backdrop = 'className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4"'
new_backdrop = 'className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4"'

old_container = 'className="bg-white dark:bg-[#212121] text-slate-800 dark:text-gray-200 w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-white/10"'
new_container = 'className="bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-white/20 text-slate-800 dark:text-white w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"'

old_input = 'className="w-full bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors shadow-sm"'
new_input = 'className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors shadow-sm"'

old_footer = 'className="p-4 bg-slate-50 dark:bg-[#1E1E1E] flex justify-end gap-3 border-t border-slate-200 dark:border-white/10"'
new_footer = 'className="p-4 bg-white/40 dark:bg-black/20 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10"'

old_cancel = 'className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"'
new_cancel = 'className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"'

old_create = 'className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-sm"'
new_create = 'className="px-5 py-2.5 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"'

content = content.replace(old_backdrop, new_backdrop)
content = content.replace(old_container, new_container)
content = content.replace(old_input, new_input)
content = content.replace(old_footer, new_footer)
content = content.replace(old_cancel, new_cancel)
content = content.replace(old_create, new_create)

with open("src/components/CreateProjectModal.tsx", "w") as f:
    f.write(content)
print("Updated CreateProjectModal styling.")
