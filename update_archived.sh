#!/bin/bash
# Note: It already has dark:bg-slate-900/90. I will update it to dark:bg-slate-800/90 to match CreateProjectModal precisely.
# I will also look for any #7e639f (purple) or #212121 or other flat backgrounds.

sed -i -e "s/className=\"bg-white\/90 dark:bg-slate-900\/90 backdrop-blur-xl border border-slate-200 dark:border-white\/10 text-slate-800 dark:text-gray-200 w-full max-w-\[600px\] h-\[70vh\] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200\"/className=\"bg-white\/90 dark:bg-slate-800\/90 backdrop-blur-xl border border-slate-200 dark:border-white\/10 text-slate-800 dark:text-gray-200 w-full max-w-[600px] h-[70vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200\"/g" src/components/ArchivedChatsModal.tsx

# Change purple icon to standard slate or blue
sed -i -e "s/className=\"text-\[#7e639f\]\"/className=\"text-blue-500\"/g" src/components/ArchivedChatsModal.tsx

# Fix hover states on list items
sed -i -e "s/className=\"flex items-center justify-between p-4 bg-slate-50 dark:bg-\[#212121\]\/50 border border-slate-200 dark:border-white\/5 rounded-xl hover:bg-slate-100 dark:hover:bg-\[#2A2A2A\]\/50 transition-colors group\"/className=\"flex items-center justify-between p-4 bg-slate-50 dark:bg-black\/20 border border-slate-200 dark:border-white\/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white\/10 transition-colors group\"/g" src/components/ArchivedChatsModal.tsx

# Check for #212121 or other purples/darks
sed -i -e "s/bg-purple-50 dark:bg-purple-900\/20/bg-blue-50 dark:bg-blue-900\/20/g" src/components/ArchivedChatsModal.tsx
sed -i -e "s/text-purple-600 dark:text-purple-400/text-blue-600 dark:text-blue-400/g" src/components/ArchivedChatsModal.tsx
