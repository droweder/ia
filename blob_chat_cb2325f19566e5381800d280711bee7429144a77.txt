#!/bin/bash
sed -i -e "s/className={selectedModelId !== 'free' ? 'text-purple-500 dark:text-purple-400' : 'text-slate-500 dark:text-gray-400'}/className={selectedModelId !== 'free' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-gray-400'}/g" src/pages/Chat.tsx

sed -i -e "s/className=\"absolute top-full left-0 mt-2 w-64 bg-white dark:bg-\[#1E1E1E\] border border-slate-200 dark:border-white\/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200\"/className=\"absolute top-full left-0 mt-2 w-64 bg-white\/90 dark:bg-slate-800\/90 backdrop-blur-xl border border-slate-200 dark:border-white\/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200\"/g" src/pages/Chat.tsx

sed -i -e "s/className={\`w-full flex flex-col text-left px-3 py-2 rounded-lg transition-colors \${/className={\`w-full flex flex-col text-left px-3 py-2 rounded-lg transition-colors \${/g" src/pages/Chat.tsx

sed -i -e "s/selectedModelId === modelOption.id/selectedModelId === modelOption.id/g" src/pages/Chat.tsx

sed -i -e "s/? 'bg-purple-50 dark:bg-purple-500\/10 border border-purple-100 dark:border-purple-500\/20'/? 'bg-blue-50 dark:bg-blue-500\/10 border border-blue-100 dark:border-blue-500\/20'/g" src/pages/Chat.tsx

sed -i -e "s/: 'hover:bg-slate-50 dark:hover:bg-white\/5 border border-transparent'/: 'hover:bg-slate-50 dark:hover:bg-white\/10 border border-transparent'/g" src/pages/Chat.tsx

sed -i -e "s/<span className={\`text-sm font-medium \${selectedModelId === modelOption.id ? 'text-purple-700 dark:text-purple-400' : 'text-slate-700 dark:text-gray-200'}\`}>/<span className={\`text-sm font-medium \${selectedModelId === modelOption.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-gray-200'}\`}>/g" src/pages/Chat.tsx
