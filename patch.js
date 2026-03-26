const fs = require('fs');

let fileStr = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// The block to replace:
const blockToReplace = `                            <button
                                onClick={() => setShowModelMenu(!showModelMenu)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
                                title="Selecionar Modelo IA"
                            >
                                <Sparkles size={18} strokeWidth={2} className={selectedModelId !== 'free' ? 'text-purple-500 dark:text-purple-400' : ''} />
                            </button>

                            {/* Dropdown de Modelos */}
                            {showModelMenu && (
                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                                                        ? 'bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20'
                                                        : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                                                }\`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className={\`text-sm font-medium \${selectedModelId === modelOption.id ? 'text-purple-700 dark:text-purple-400' : 'text-slate-700 dark:text-gray-200'}\`}>
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
                            )}`;

if (fileStr.includes(blockToReplace)) {
    fileStr = fileStr.replace(blockToReplace, '');

    // Also remove ref={modelMenuRef} from the parent div
    fileStr = fileStr.replace('className="flex items-center justify-center p-2 pl-3 pb-[10px] gap-1 relative" ref={modelMenuRef}', 'className="flex items-center justify-center p-2 pl-3 pb-[10px] gap-1"');

    fs.writeFileSync('src/pages/Chat.tsx', fileStr);
    console.log("Successfully removed dropdown from input area.");
} else {
    console.log("Could not find the block to replace.");
}
