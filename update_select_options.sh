#!/bin/bash
# Remove dark:[#111111] from option elements
sed -i -e "s/className=\"dark:bg-\[#111111\]\"/className=\"bg-white dark:bg-slate-800 text-slate-800 dark:text-gray-200\"/g" src/components/SelectProjectModal.tsx

# Also let's ensure the select itself has a solid background when opened by the browser to avoid text illegibility
sed -i -e "s/className=\"w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none dark:border-white\/10 dark:text-white\"/className=\"w-full rounded-xl border border-slate-200 bg-white\/40 dark:bg-black\/20 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none dark:border-white\/10 dark:text-white shadow-sm\"/g" src/components/SelectProjectModal.tsx
