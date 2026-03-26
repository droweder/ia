const fs = require('fs');

let fileStr = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// The block to replace:
const blockToReplace = `<div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200">
        {/* Messages */}`;

const replaceWith = `<div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200 relative">
        {/* Top-Left Model Selector */}
        <div className="absolute top-4 left-4 z-50" ref={modelMenuRef}>
            <div className="relative">
                <button
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-gray-300 transition-all shadow-sm"
                    title="Selecionar Modelo IA"
                >
                    <Sparkles size={16} className={selectedModelId !== 'free' ? 'text-purple-500 dark:text-purple-400' : 'text-slate-500 dark:text-gray-400'} />
                    <span>{MODELS.find(m => m.id === selectedModelId)?.name || 'Modelo'}</span>
                    <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown de Modelos */}
                {showModelMenu && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                )}
            </div>
        </div>

        {/* Messages */}`;

if (fileStr.includes(blockToReplace)) {
    fileStr = fileStr.replace(blockToReplace, replaceWith);
    fs.writeFileSync('src/pages/Chat.tsx', fileStr);
    console.log("Successfully added model selector to top left.");
} else {
    console.log("Could not find the block to replace.");
}
