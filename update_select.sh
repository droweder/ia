#!/bin/bash
sed -i -e "s/className=\"w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-\[#111111\] border border-white\/10\"/className=\"w-full max-w-md rounded-2xl bg-white\/90 dark:bg-slate-800\/90 backdrop-blur-xl p-6 shadow-xl border border-slate-200 dark:border-white\/10 animate-in fade-in zoom-in-95 duration-200\"/g" src/components/SelectProjectModal.tsx

sed -i -e "s/className=\"fixed inset-0 z-50 flex items-center justify-center bg-black\/50 p-4\"/className=\"fixed inset-0 z-50 flex items-center justify-center bg-slate-900\/50 dark:bg-black\/60 backdrop-blur-sm p-4\"/g" src/components/SelectProjectModal.tsx

sed -i -e "s/className=\"mb-4 block text-sm font-medium text-slate-700 dark:text-slate-300\"/className=\"mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300\"/g" src/components/SelectProjectModal.tsx

sed -i -e "s/className=\"w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white\/10 dark:bg-\[#1A1A1A\] dark:text-white dark:focus:border-blue-500\"/className=\"w-full rounded-xl border border-slate-200 bg-white\/40 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white\/10 dark:bg-black\/20 dark:text-white dark:focus:border-[#3b82f6]\"/g" src/components/SelectProjectModal.tsx

sed -i -e "s/className=\"rounded-xl px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white\/10\"/className=\"rounded-xl px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white\/10 transition-colors\"/g" src/components/SelectProjectModal.tsx

sed -i -e "s/className=\"rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50\"/className=\"rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 px-5 py-2.5 text-sm font-medium text-white transition-all disabled:cursor-not-allowed\"/g" src/components/SelectProjectModal.tsx
