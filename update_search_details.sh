#!/bin/bash
# Improve search modal styling consistency
sed -i -e "s/className=\"flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white\/5 transition-colors text-left group\"/className=\"flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white\/10 transition-colors text-left group\"/g" src/components/SearchModal.tsx

sed -i -e "s/className=\"w-10 h-10 rounded-full bg-slate-100 dark:bg-white\/5 flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0\"/className=\"w-10 h-10 rounded-full bg-slate-100 dark:bg-black\/20 border border-slate-200 dark:border-white\/10 flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0\"/g" src/components/SearchModal.tsx

# Match backdrop blur with rest of modals
sed -i -e "s/className=\"fixed inset-0 z-50 flex items-start justify-center pt-\[15vh\] bg-slate-900\/50 dark:bg-slate-900\/50 backdrop-blur-sm p-4\"/className=\"fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-900\/50 dark:bg-black\/60 backdrop-blur-sm p-4\"/g" src/components/SearchModal.tsx
