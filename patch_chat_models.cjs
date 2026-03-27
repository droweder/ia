const fs = require('fs');
let content = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

const blockToReplace = `<div className="h-14 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-white/5 backdrop-blur-md px-4 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <div className="font-medium text-slate-700 dark:text-gray-200 text-sm py-1.5 pl-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Mia AI
                </div>
            </div>`;

const replaceWith = `<div className="h-14 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-white/5 backdrop-blur-md px-4 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <div className="font-medium text-slate-700 dark:text-gray-200 text-sm py-1.5 pl-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Mia AI
                </div>

                {/* Model Selector */}
                <div className="relative border-l border-slate-300 dark:border-white/10 pl-4 ml-2" ref={modelMenuRef}>
                    <button
                        onClick={() => setShowModelMenu(!showModelMenu)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-gray-300 transition-all shadow-sm"
                        title="Selecionar Modelo IA"
                    >
                        <Sparkles size={16} className={selectedModelId !== 'free' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-gray-400'} />
                        <span className="hidden sm:inline">{MODELS.find(m => m.id === selectedModelId)?.name || 'Modelo'}</span>
                        <ChevronDown size={14} className="text-slate-400" />
                    </button>

                    {/* Dropdown de Modelos */}
                    {showModelMenu && (
                        <div className="absolute top-full left-4 mt-2 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2 border-b border-slate-100 dark:border-white/5">
                                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider pl-2">Selecione o Modelo</p>
                            </div>
                            <div className="p-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700">
                                {MODELS.map(modelOption => (
                                    <button
                                        key={modelOption.id}
                                        onClick={() => {
                                            setSelectedModelId(modelOption.id);
                                            setShowModelMenu(false);
                                        }}
                                        className={\`w-full flex flex-col text-left px-3 py-2 rounded-lg transition-colors \${
                                            selectedModelId === modelOption.id
                                                ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20'
                                                : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                                        }\`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className={\`text-sm font-medium \${selectedModelId === modelOption.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-gray-200'}\`}>
                                                {modelOption.name}
                                            </span>
                                            {modelOption.isPaid ? (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">PAGO</span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">GRÁTIS</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{modelOption.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>`;

if (content.includes(blockToReplace)) {
    content = content.replace(blockToReplace, replaceWith);
    fs.writeFileSync('src/pages/Chat.tsx', content);
    console.log("Successfully injected model selector inside the chat header!");
} else {
    console.log("Could not find the header block to replace.");
}

// 4. Also update the `generateChatResponse` call to actually send `selectedModelId` inside OpenRouterClient payload.
// Wait, the `openRouterClient.ts` function `generateChatResponse` takes a `model` property?
