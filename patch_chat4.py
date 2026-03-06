import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# I will extract the CodeBlock renderer logic out to a standalone component
code_block_component = """
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\\n$/, '');
    const blockId = React.useId();
    const [isCopied, setIsCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(match && match[1] !== 'sql'); // hide SQL by default

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    if (inline || !match) {
        return (
            <code {...props} className={`${className} bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-sm text-pink-600 dark:text-pink-400`}>
                {children}
            </code>
        );
    }

    const language = match[1];

    return (
        <div className="relative group/code mt-4 mb-4 rounded-xl overflow-hidden bg-[#1E1E1E] border border-gray-700/50 shadow-sm">
            <div
                className={`flex items-center justify-between px-4 py-2.5 bg-[#2D2D2D] text-xs font-medium text-gray-400 transition-colors ${language === 'sql' ? 'cursor-pointer hover:bg-[#3D3D3D]' : ''}`}
                onClick={() => language === 'sql' && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    {language === 'sql' && (
                        <ChevronDown size={14} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                    <span className="uppercase tracking-wider">{language}</span>
                    {language === 'sql' && !isExpanded && (
                        <span className="text-gray-500 ml-2 normal-case tracking-normal">- Clique para expandir</span>
                    )}
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                        title="Copiar código"
                    >
                        {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span className={isCopied ? "text-emerald-400" : ""}>{isCopied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 overflow-x-auto text-sm scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-transparent">
                    <SyntaxHighlighter
                        {...props}
                        PreTag="div"
                        children={codeString}
                        language={language}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                    />
                </div>
            )}
        </div>
    );
};
"""

# Insert the component before Chat definition
if "const CodeBlock = " not in content:
    content = content.replace("const Chat: React.FC = () => {", code_block_component + "\nconst Chat: React.FC = () => {")

# Replace the ReactMarkdown code renderer
old_code_render = """                                        code(props) {
                                            const { children, className, ...rest } = props;
                                            const match = /language-(\w+)/.exec(className || '');
                                            const codeString = String(children).replace(/\\n$/, '');
                                            const blockId = `${msg.id}-${codeString.substring(0, 10)}`;

                                            return match ? (
                                                <div className="relative group/code mt-4 mb-4 rounded-md overflow-hidden bg-[#1E1E1E] border border-gray-700/50">
                                                    <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] text-xs text-gray-400">
                                                        <span>{match[1]}</span>
                                                        <button
                                                            onClick={() => handleCopyCode(codeString, blockId)}
                                                            className="flex items-center gap-1 hover:text-white transition-colors"
                                                            title="Copiar código"
                                                        >
                                                            {copiedBlocks[blockId] ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                            <span>{copiedBlocks[blockId] ? 'Copiado!' : 'Copiar'}</span>
                                                        </button>
                                                    </div>
                                                    <div className="p-4 overflow-x-auto text-sm">
                                                        <SyntaxHighlighter
                                                            {...({ ...rest, ref: undefined } as any)}
                                                            PreTag="div"
                                                            children={codeString}
                                                            language={match[1]}
                                                            style={vscDarkPlus}
                                                            customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <code {...rest} className={`${className} bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-sm text-pink-600 dark:text-pink-400`}>
                                                    {children}
                                                </code>
                                            );
                                        }"""

new_code_render = "                                        code: CodeBlock"
content = content.replace(old_code_render, new_code_render)

# Ensure ChevronUp is imported
if "ChevronUp" not in content:
    content = content.replace("ChevronDown, ShieldCheck", "ChevronDown, ChevronUp, ShieldCheck")

with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)

print("Patch applied.")
