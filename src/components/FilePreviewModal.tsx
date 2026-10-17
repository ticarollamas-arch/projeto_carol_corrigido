import { useState } from 'react';
import { X, Copy, Check, FileText } from 'lucide-react';
import { ParsedZipFile } from '../types';

interface FilePreviewModalProps {
  file: ParsedZipFile | null;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const isText = typeof file.content === 'string';
  const textContent = isText ? (file.content as string) : '';
  const lines = textContent.split('\n');

  function handleCopy() {
    if (isText) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-3xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden text-left">
        {/* Top bar */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between gap-4 bg-[#0d1117]">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-[#58a6ff] shrink-0" />
            <span className="font-mono text-sm text-slate-200 truncate">{file.path}</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {formatBytes(file.size)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isText && (
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-auto p-4 bg-[#0d1117] font-mono text-xs text-slate-300">
          {isText ? (
            <div className="table w-full">
              {lines.map((line, idx) => (
                <div key={idx} className="table-row hover:bg-[#161b22]/70">
                  <span className="table-cell select-none text-right pr-4 text-slate-600 font-mono w-10 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre-wrap break-all text-slate-300">
                    {line || ' '}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p>Arquivo binário ({file.extension.toUpperCase()}) — {formatBytes(file.size)}</p>
              <p className="text-slate-500 text-[11px] mt-1">
                Arquivos binários são codificados em Base64 e enviados como Git Blobs nativos para o GitHub.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
