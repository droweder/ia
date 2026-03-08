import re

file_path = "src/pages/Chat.tsx"

with open(file_path, "r") as f:
    content = f.read()

# I also need to make sure the same `.dark:scrollbar-track-transparent` is applied to `prose` if needed,
# but the instruction specifically says "da direita" which is the main messages container (`flex-1 overflow-y-auto`).
# The memory states that specific scrollbars "must strictly apply a dark theme using dark blue tones (e.g., scrollbar-thumb-blue-900 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-blue-800 dark:hover:scrollbar-thumb-blue-700), rather than light gray or standard blue variants."
# I have added the track classes and fixed the index.css.

# Let's ensure ALL places with these classes in Chat.tsx are strictly styled so it does not default to light.
# In `prose`, I will add `scrollbar-track-transparent dark:scrollbar-track-transparent`
content = content.replace(
    'prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 leading-relaxed break-words overflow-x-auto scrollbar-thin scrollbar-thumb-blue-900 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-blue-800 dark:hover:scrollbar-thumb-blue-700"',
    'prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 leading-relaxed break-words overflow-x-auto scrollbar-thin scrollbar-thumb-blue-900 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-blue-800 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent dark:scrollbar-track-transparent"'
)

with open(file_path, "w") as f:
    f.write(content)
