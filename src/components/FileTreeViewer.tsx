import { useState, useMemo } from 'react';
import {
  FileCode,
  FileText,
  FileJson,
  FileImage,
  File,
  Search,
  Eye,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react';
import { ParsedZipFile } from '../types';

interface FileTreeViewerProps {
  files: ParsedZipFile[];
  onToggleFile: (path: string) => void;
  onToggleAll: (included: boolean) => void;
  onPreviewFile: (file: ParsedZipFile) => void;
}

function getFileIcon(ext: string) {
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'rs':
    case 'go':
    case 'java':
    case 'c':
    case 'cpp':
    case 'html':
    case 'css':
      return <FileCode className="w-4 h-4 text-[#58a6ff]" />;
    case 'json':
    case 'yaml':
    case 'yml':
    case 'toml':
      return <FileJson className="w-4 h-4 text-amber-400" />;
    case 'md':
    case 'txt':
    case 'rst':
      return <FileText className="w-4 h-4 text-emerald-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FileImage className="w-4 h-4 text-purple-400" />;
    default:
      return <File className="w-4 h-4 text-slate-400" />;
  }
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function FileTreeViewer({
  files,
  onToggleFile,
  onToggleAll,
  onPreviewFile,
}: FileTreeViewerProps) {
  const [search, setSearch] = useState('');

  const nonDirFiles = useMemo(() => files.filter((f) => !f.isDirectory), [files]);

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return nonDirFiles;
    const q = search.toLowerCase();
    return nonDirFiles.filter((f) => f.path.toLowerCase().includes(q));
  }, [nonDirFiles, search]);

  const includedCount = useMemo(() => nonDirFiles.filter((f) => f.included).length, [nonDirFiles]);

  const allSelected = includedCount === nonDirFiles.length && nonDirFiles.length > 0;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden text-left">
      {/* Header bar */}
      <div className="p-4 border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Arquivos Extraídos do ZIP</span>
          </h3>
          <div className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
            {includedCount} de {nonDirFiles.length} arquivos selecionados para envio
          </div>
        </div>

        {/* Search & Selection Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar arquivos..."
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-hidden rounded-md text-xs text-slate-200 placeholder:text-slate-600 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => onToggleAll(!allSelected)}
            className="w-full sm:w-auto px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {allSelected ? (
              <>
                <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Desmarcar Todos</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Marcar Todos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#21262d]">
        {filteredFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Nenhum arquivo encontrado com o termo "{search}".
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.path}
              className={`flex items-center justify-between px-4 py-2 hover:bg-[#21262d]/50 transition-colors text-xs ${
                !file.included ? 'opacity-40 bg-[#0d1117]/50' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                <input
                  type="checkbox"
                  checked={file.included}
                  onChange={() => onToggleFile(file.path)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span className="shrink-0">{getFileIcon(file.extension)}</span>
                <span className="font-mono text-slate-200 truncate">{file.path}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-slate-400 font-mono tabular-nums">
                  {formatBytes(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => onPreviewFile(file)}
                  className="p-1 text-slate-400 hover:text-[#58a6ff] hover:bg-[#30363d] rounded transition-colors cursor-pointer"
                  title="Visualizar conteúdo"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
