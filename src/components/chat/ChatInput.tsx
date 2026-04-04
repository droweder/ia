import React from 'react';
import { Plus, Maximize2, Minimize2, Mic, ArrowUp, File as FileIcon, X } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  isRecording: boolean;
  toggleRecording: () => void;
  handleSendMessage: () => void;
  isInputExpanded: boolean;
  setIsInputExpanded: (value: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  attachments: File[];
  removeAttachment: (index: number) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  loading,
  isRecording,
  toggleRecording,
  handleSendMessage,
  isInputExpanded,
  setIsInputExpanded,
  fileInputRef,
  handleFileChange,
  attachments,
  removeAttachment,
}) => {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 bg-transparent backdrop-blur-md">
      <div className="max-w-3xl mx-auto relative">
        <div className="relative flex flex-col group bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-[26px] transition-all overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 shadow-lg">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 pb-0">
              {attachments.map((file, index) => (
                <div key={index} className="relative group/attachment flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden h-16 w-16">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-gray-300">
                      <FileIcon size={24} />
                      <span className="text-[10px] font-medium mt-1 truncate w-14 text-center px-1">{file.name.split('.').pop()?.toUpperCase()}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-1 -right-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl text-slate-600 dark:text-gray-200 rounded-full p-0.5 opacity-0 group-hover/attachment:opacity-100 transition-opacity border border-slate-200 dark:border-white/10 shadow-sm hover:bg-slate-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end">
            <div className="flex items-center justify-center p-2 pl-3 pb-[10px]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Pergunte alguma coisa"
              disabled={loading}
              rows={isInputExpanded ? 10 : 1}
              className={`flex-1 py-3.5 bg-transparent resize-none focus:outline-none text-base text-slate-800 dark:text-white placeholder-gray-400 disabled:opacity-50 transition-all ${isInputExpanded ? "min-h-[240px] max-h-[50vh]" : "min-h-[52px] max-h-[200px]"}`}
              style={{ overflowY: "auto" }}
            />
            <div className="p-2 pr-3 flex items-center gap-2 pb-[10px]">
              <button
                onClick={() => setIsInputExpanded(!isInputExpanded)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-white/10"
                title={isInputExpanded ? "Reduzir" : "Expandir"}
              >
                {isInputExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={toggleRecording}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-transparent
                  ${isRecording
                    ? 'bg-red-500 text-slate-800 dark:text-white animate-pulse'
                    : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10'
                  }
                `}
                title={isRecording ? "Parar gravação" : "Gravar áudio"}
              >
                <Mic size={20} strokeWidth={2} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && attachments.length === 0) || loading}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${(!input.trim() && attachments.length === 0)
                    ? 'bg-blue-600 text-white opacity-100 hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {(!input.trim() && attachments.length === 0) ? (
                  <div className="flex items-center justify-center gap-[2px]">
                    <div className="w-[2px] h-2.5 bg-current rounded-full"></div>
                    <div className="w-[2px] h-4 bg-current rounded-full"></div>
                    <div className="w-[2px] h-2 bg-current rounded-full"></div>
                  </div>
                ) : (
                  <ArrowUp size={18} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="text-center mt-3">
          <p className="text-xs text-slate-500 dark:text-gray-400">A AI pode cometer erros. Considere verificar informações importantes.</p>
        </div>
      </div>
    </div>
  );
};
