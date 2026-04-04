import React from 'react';
import { User, Copy, Check, RefreshCcw, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'sql-formatter';
import { CodeBlock } from './CodeBlock';
import type { Message } from '../../types';

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
  isCopied: boolean;
  onCopy: (content: string, id: string) => void;
  onRegenerate: () => void;
  showSql: boolean;
  onToggleSql: (id: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLast,
  isLoading,
  isCopied,
  onCopy,
  onRegenerate,
  showSql,
  onToggleSql,
}) => {
  return (
    <div className={`flex gap-4 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300 group`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${message.role === 'user' ? 'bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300' : 'bg-white dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/10'}`}>
        {message.role === 'user' ? (
          <User size={16} />
        ) : (
          <img 
            src="https://phofwpyxbeulodrzfdjq.supabase.co/storage/v1/object/public/imagens_app/favicom_drowederAI.png" 
            alt="Rower AI" 
            className="w-full h-full object-contain p-1"
          />
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="text-sm font-semibold text-slate-800 dark:text-gray-200">
          {message.role === 'user' ? 'Você' : 'Rower AI'}
        </div>
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-gray-300 leading-relaxed break-words overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent ">
          {message.role === 'user' ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: (props) => <CodeBlock {...props} />
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Action Buttons for AI messages */}
        {message.role === 'assistant' && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCopy(message.content, message.id)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-md hover:bg-slate-100 dark:hover:bg-white/40 dark:bg-white/5 transition-colors"
                title="Copiar mensagem"
              >
                {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>

              {/* Only show regenerate button on the last assistant message */}
              {isLast && (
                <button
                  onClick={onRegenerate}
                  disabled={isLoading}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-md hover:bg-slate-100 dark:hover:bg-white/40 dark:bg-white/5 transition-colors disabled:opacity-50"
                  title="Regerar resposta"
                >
                  <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
                </button>
              )}

              {/* SQL Query Toggle Button */}
              {message.sql_query && (
                <button
                  onClick={() => onToggleSql(message.id)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/5 hover:bg-blue-500/10 text-xs font-medium text-blue-600 dark:text-blue-400 transition-colors border border-blue-500/10 ml-1"
                >
                  <Database size={12} />
                  <span>{showSql ? 'Ocultar Script SQL' : 'Ver Script SQL Gerado'}</span>
                </button>
              )}
            </div>

            {/* SQL Content Accordion */}
            {message.sql_query && showSql && (
              <div className="mt-2 p-4 bg-[#1E1E1E] rounded-xl border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">Query SQL Formatada</span>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(message.sql_query!)}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-md transition-all"
                    title="Copiar SQL"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <div className="rounded-lg overflow-hidden">
                  <SyntaxHighlighter
                    language="sql"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontSize: '13px',
                      lineHeight: '1.6',
                    }}
                    wrapLongLines={true}
                  >
                    {format(message.sql_query, {
                      language: 'postgresql',
                      keywordCase: 'upper',
                      indentStyle: 'tabularLeft',
                    })}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
