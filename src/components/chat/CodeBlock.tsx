import React, { useState } from 'react';
import { ChevronDown, Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'sql-formatter';

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

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
      <code {...props} className={`${className || ''} bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-sm text-pink-400`}>
        {children}
      </code>
    );
  }

  const language = match[1];

  return (
    <div className="relative group/code mt-4 mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1E1E1E] border border-gray-700/50 shadow-sm">
      <div
        className={`flex items-center justify-between px-4 py-2.5 bg-gray-200 dark:bg-[#2D2D2D] text-xs font-medium text-slate-500 dark:text-gray-400 transition-colors ${language === 'sql' ? 'cursor-pointer hover:bg-gray-300 dark:hover:bg-[#3D3D3D]' : ''}`}
        onClick={() => language === 'sql' && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {language === 'sql' && (
            <ChevronDown size={14} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
          <span className="uppercase tracking-wider">{language === 'sql' ? 'SQL EXECUTADO PELA IA' : language}</span>
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-slate-800 dark:text-white transition-colors"
            title="Copiar código"
          >
            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span className={isCopied ? "text-emerald-400" : ""}>{isCopied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="w-full overflow-x-auto p-4 pb-2 text-sm scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent">
          <SyntaxHighlighter
            {...({ ...props, ref: undefined } as any)}
            PreTag="div"
            children={language === 'sql' ? format(codeString, { language: 'postgresql', keywordCase: 'upper' }) : codeString}
            language={language}
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
            wrapLongLines={false}
          />
        </div>
      )}
    </div>
  );
};
