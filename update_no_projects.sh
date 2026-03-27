#!/bin/bash
sed -i -e "s/className=\"bg-\[#212121\] text-gray-200 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200\"/className=\"bg-white\/90 dark:bg-slate-800\/90 backdrop-blur-xl border border-slate-200 dark:border-white\/10 text-slate-800 dark:text-gray-200 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200\"/g" src/components/NoProjectsWarningModal.tsx

sed -i -e "s/className=\"text-lg font-semibold text-white\"/className=\"text-lg font-semibold text-slate-800 dark:text-white\"/g" src/components/NoProjectsWarningModal.tsx

sed -i -e "s/className=\"p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white\/10\"/className=\"p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white\/10\"/g" src/components/NoProjectsWarningModal.tsx

sed -i -e "s/className=\"text-gray-300 leading-relaxed text-sm\"/className=\"text-slate-600 dark:text-gray-300 leading-relaxed text-sm\"/g" src/components/NoProjectsWarningModal.tsx

sed -i -e "s/className=\"p-4 bg-black\/20 flex justify-end gap-3 border-t border-white\/5\"/className=\"p-4 bg-slate-50 dark:bg-black\/20 flex justify-end gap-3 border-t border-slate-200 dark:border-white\/10\"/g" src/components/NoProjectsWarningModal.tsx

sed -i -e "s/className=\"px-5 py-2.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white\/10 transition-colors\"/className=\"px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white\/10 transition-colors\"/g" src/components/NoProjectsWarningModal.tsx

sed -i -e "s/className=\"px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm transition-all hover:opacity-90 active:scale-95\"/className=\"px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm transition-all shadow-md hover:bg-blue-700 active:scale-95\"/g" src/components/NoProjectsWarningModal.tsx
