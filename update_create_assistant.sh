#!/bin/bash
sed -i -e "s/className=\"bg-white dark:bg-\[#212121\] text-slate-800 dark:text-gray-200 w-full max-w-\[600px\] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200\"/className=\"bg-white\/90 dark:bg-slate-800\/90 backdrop-blur-xl border border-slate-200 dark:border-white\/10 text-slate-800 dark:text-gray-200 w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200\"/g" src/components/CreateAssistantModal.tsx

# Fix purple icons to standard blue/slate
sed -i -e "s/className=\"text-purple-500 dark:text-purple-400\"/className=\"text-blue-500 dark:text-blue-400\"/g" src/components/CreateAssistantModal.tsx
sed -i -e "s/text-purple-500/text-blue-500/g" src/components/CreateAssistantModal.tsx

# Check for #1E1E1E or similar inputs
sed -i -e "s/className=\"w-full bg-white\/40 dark:bg-black\/40 border border-slate-200 dark:border-white\/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-\[#3b82f6\] focus:ring-1 focus:ring-blue-500 dark:focus:ring-\[#3b82f6\] transition-colors shadow-sm\"/className=\"w-full bg-white\/40 dark:bg-black\/20 border border-slate-200 dark:border-white\/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-[#3b82f6] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#3b82f6] transition-colors shadow-sm\"/g" src/components/CreateAssistantModal.tsx

sed -i -e "s/className=\"px-5 py-2.5 rounded-xl bg-blue-600 dark:bg-\[#3b82f6\] hover:bg-blue-700 dark:hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed\"/className=\"px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed\"/g" src/components/CreateAssistantModal.tsx

sed -i -e "s/className=\"px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white\/5 transition-colors\"/className=\"px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white\/10 transition-colors\"/g" src/components/CreateAssistantModal.tsx
