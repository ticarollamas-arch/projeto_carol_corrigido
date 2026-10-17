import React, { useRef, useState } from 'react';
import {
  Smartphone,
  Download,
  FolderArchive,
  RefreshCw,
  Sparkles,
  FileCode,
  Binary,
  Layers,
  Search,
  Eye,
  FileCheck,
  Cpu,
  Send,
} from 'lucide-react';
import { ZipMetadata, ParsedZipFile } from '../types';
import { parseApkFile, downloadZip, createSampleApk, detectFileFormatByMagicBytes } from '../services/zipParser';

interface ApkExtractorSectionProps {
  onTransferToGitHub: (metadata: ZipMetadata) => void;
  onPreviewFile: (file: ParsedZipFile) => void;
  onOpenArchitecture?: (metadata: ZipMetadata) => void;
  onRawFileSelected?: (file: File) => void;
}

export function ApkExtractorSection({
  onTransferToGitHub,
  onPreviewFile,
  onOpenArchitecture,
  onRawFileSelected,
}: ApkExtractorSectionProps) {
  const [apkMeta, setApkMeta] = useState<ZipMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [search, setSearch] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleApkFile(file: File) {
    if (onRawFileSelected) onRawFileSelected(file);
    try {
      setIsProcessing(true);
      const meta = await parseApkFile(file);
      setApkMeta(meta);
    } catch (err: any) {
      alert(`Falha ao processar arquivo: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSampleApk() {
    try {
      setIsProcessing(true);
      const sample = await createSampleApk();
      await handleApkFile(sample);
    } catch (err: any) {
      console.error('Failed to create sample apk', err);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDownloadZip() {
    if (!apkMeta) return;
    try {
      setIsDownloading(true);
      const targetName = apkMeta.fileName.replace(/\.(apk|xapk|exe|bin|rar|7z)$/i, '-descompactado.zip');
      await downloadZip(apkMeta.files, targetName);
    } catch (err: any) {
      alert(`Erro ao gerar ZIP dos arquivos: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  const nonDirFiles = apkMeta ? apkMeta.files.filter((f) => !f.isDirectory) : [];
  const filteredFiles = search.trim()
    ? nonDirFiles.filter((f) => f.path.toLowerCase().includes(search.toLowerCase()))
    : nonDirFiles;

  return (
    <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-7 space-y-5 text-left shadow-lg w-full max-w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".apk,.xapk,.zip,.tar,.gz,.tar.gz,.tgz,.rar,.7z,.exe,.dll,.so,.bin,application/zip,application/x-zip-compressed,application/vnd.android.package-archive"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleApkFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#30363d] w-full">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-full">
              Extrator de APK & Análise para Engenharia Reversa
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 break-words">
              Anexe pacotes <code className="text-emerald-400 font-mono">.apk</code>, <code className="text-slate-300 font-mono">.zip</code> ou executáveis para extrair todos os arquivos e baixá-los em formato <code className="text-slate-300 font-mono">.zip</code>.
            </p>
          </div>
        </div>

        {apkMeta && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 sm:px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors cursor-pointer"
            >
              Trocar Arquivo
            </button>
            <button
              onClick={() => setApkMeta(null)}
              className="px-2.5 sm:px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-md transition-colors cursor-pointer"
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      {/* Dropzone / Upload area */}
      {!apkMeta ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleApkFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 w-full max-w-full ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.005]'
              : 'border-[#30363d] hover:border-slate-500 bg-[#0d1117] hover:bg-[#0d1117]/80'
          }`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#21262d] border border-[#30363d] flex items-center justify-center text-slate-300">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 animate-spin" />
            ) : (
              <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
            )}
          </div>

          <div className="max-w-full px-2">
            <h3 className="text-sm sm:text-base font-semibold text-white break-words">
              {isProcessing
                ? 'Desempacotando e extraindo arquivos do pacote...'
                : 'Arraste e solte o arquivo .APK, .ZIP ou binário aqui'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 break-words">
              Suporta <code className="text-slate-300">.apk</code>, <code className="text-slate-300">.zip</code>, <code className="text-slate-300">.tar.gz</code>, <code className="text-slate-300">.rar</code>, <code className="text-slate-300">.7z</code> ou executáveis <code className="text-slate-300">.exe/.so</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-[11px] text-slate-500">ou experimente:</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSampleApk();
              }}
              className="px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Usar APK de Demonstração</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 w-full max-w-full">
          {/* APK Overview Metrics Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-4 w-full max-w-full">
            <div className="flex flex-col gap-4">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-white truncate max-w-full">
                      {apkMeta.fileName}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded truncate max-w-full">
                      {apkMeta.detectedType}
                    </span>
                    {apkMeta.formatInfo && (
                      <span className="text-[10px] font-mono text-slate-400 bg-[#21262d] border border-[#30363d] px-1.5 py-0.5 rounded">
                        Magic: {apkMeta.formatInfo.magicHex}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-slate-400 mt-1 font-mono tabular-nums">
                    <span>{apkMeta.totalFiles} arquivos</span>
                    <span>·</span>
                    <span>{formatBytes(apkMeta.compressedSize)} compactado</span>
                    <span>·</span>
                    <span>{formatBytes(apkMeta.totalSize)} descompactado</span>
                  </div>
                </div>
              </div>

              {/* Main Actions: Mobile full width & wrap */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#30363d]/60 w-full">
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={handleDownloadZip}
                  className="w-full sm:w-auto px-3.5 py-2.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[38px] text-center"
                >
                  {isDownloading ? (
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Download className="w-4 h-4 shrink-0" />
                  )}
                  <span>{isDownloading ? 'Gerando .ZIP...' : 'Baixar Todos em .ZIP'}</span>
                </button>

                {onOpenArchitecture && (
                  <button
                    type="button"
                    onClick={() => onOpenArchitecture(apkMeta)}
                    className="w-full sm:w-auto px-3.5 py-2.5 bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 rounded-lg text-xs font-semibold transition-colors border border-purple-500/50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[38px] text-center"
                    title="Desconstruir arquitetura e gerar prompt para criar aplicativo do seu jeito"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                    <span>Desconstruir & Prompt</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onTransferToGitHub(apkMeta)}
                  className="w-full sm:w-auto px-3.5 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-colors border border-[#30363d] flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] text-center"
                  title="Carregar estes arquivos na seção de envio para o GitHub"
                >
                  <Send className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
                  <span>Enviar para o GitHub</span>
                </button>
              </div>
            </div>

            {/* Component Discovery Grid */}
            {apkMeta.apkAnalysis && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-2.5 sm:p-3 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400">
                    <Binary className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Bytecode Dalvik</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold font-mono text-white tabular-nums truncate">
                    {apkMeta.apkAnalysis.dexFiles.length} arq .dex
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400">
                    <Cpu className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
                    <span className="truncate">Bibliotecas .so</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold font-mono text-white tabular-nums truncate">
                    {apkMeta.apkAnalysis.nativeLibs.length} binários .so
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Manifesto</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold font-mono text-white truncate">
                    {apkMeta.apkAnalysis.hasManifest ? 'Detectado' : 'Ausente'}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">Assets</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold font-mono text-white tabular-nums truncate">
                    {apkMeta.apkAnalysis.assetsCount} arq
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Files Explorer inside APK */}
          <div className="border border-[#30363d] rounded-xl overflow-hidden bg-[#0d1117] w-full max-w-full">
            <div className="p-3 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-xs font-semibold text-slate-200">
                Arquivos Extraídos ({filteredFiles.length})
              </span>
              <div className="relative w-full sm:w-auto">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar arquivo..."
                  className="pl-7 pr-3 py-1 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-hidden rounded-md text-xs text-slate-200 placeholder:text-slate-600 font-mono w-full sm:w-60"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-[#21262d]">
              {filteredFiles.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Nenhum arquivo encontrado com o termo "{search}".
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file.path}
                    className="flex items-center justify-between px-3 sm:px-4 py-2 hover:bg-[#161b22] transition-colors text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      {file.path.endsWith('.dex') ? (
                        <Binary className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : file.path.endsWith('.so') ? (
                        <Cpu className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
                      ) : file.path.endsWith('.xml') ? (
                        <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <FileCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="font-mono text-slate-200 truncate">{file.path}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-slate-400 font-mono tabular-nums text-[11px]">
                        {formatBytes(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onPreviewFile(file)}
                        className="p-1 text-slate-400 hover:text-[#58a6ff] hover:bg-[#30363d] rounded transition-colors cursor-pointer"
                        title="Inspecionar conteúdo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
