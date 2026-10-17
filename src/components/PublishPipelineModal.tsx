import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PushStepProgress } from '../types';

interface PublishPipelineModalProps {
  isOpen: boolean;
  progress: PushStepProgress;
  onClose: () => void;
  onRetry: () => void;
  isDemoMode: boolean;
}

export function PublishPipelineModal({
  isOpen,
  progress,
  onClose,
  onRetry,
  isDemoMode,
}: PublishPipelineModalProps) {
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  if (!isOpen) return null;

  const isCompleted = progress.step === 'completed';
  const isError = progress.step === 'error';
  const isRunning = !isCompleted && !isError && progress.step !== 'idle';

  const blobPercentage =
    progress.totalBlobs && progress.totalBlobs > 0
      ? Math.round(((progress.currentBlob || 0) / progress.totalBlobs) * 100)
      : 0;

  function copyText(text: string, type: 'clone' | 'sha') {
    navigator.clipboard.writeText(text);
    if (type === 'clone') {
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 2000);
    } else {
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2000);
    }
  }

  const stepsList = [
    { key: 'checking_repo', label: '1. Verificando repositório no GitHub', icon: GitBranch },
    { key: 'creating_blobs', label: '2. Criando Git Blobs (arquivos)', icon: Database },
    { key: 'creating_tree', label: '3. Construindo Git Tree', icon: GitPullRequest },
    { key: 'creating_commit', label: '4. Gerando Git Commit assinado', icon: GitCommit },
    { key: 'updating_ref', label: '5. Atualizando referência da branch', icon: CheckCircle2 },
  ];

  function getStepStatus(stepKey: string) {
    const order = ['checking_repo', 'creating_blobs', 'creating_tree', 'creating_commit', 'updating_ref', 'completed'];
    const currentIndex = order.indexOf(progress.step);
    const stepIndex = order.indexOf(stepKey);

    if (isCompleted || currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'running';
    return 'pending';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left">
        {/* Title */}
        <div className="text-center pb-6 border-b border-[#30363d]">
          {isCompleted ? (
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : isError ? (
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-7 h-7 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          )}

          <h2 className="text-xl font-bold text-white">
            {isCompleted
              ? isDemoMode
                ? 'Publicação Simulada Concluída!'
                : 'Publicado no GitHub com Sucesso!'
              : isError
              ? 'Erro na Publicação'
              : 'Enviando Projeto para o GitHub...'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isCompleted
              ? 'Todos os arquivos foram processados e comitados na branch principal.'
              : isError
              ? 'Ocorreu uma falha durante o processo de envio.'
              : 'Executando pipeline Git Data REST API em tempo real.'}
          </p>
        </div>

        {/* Running Pipeline Progress */}
        {isRunning && (
          <div className="py-6 space-y-4">
            {/* Blob progress bar */}
            {progress.step === 'creating_blobs' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 font-mono tabular-nums">
                  <span>Enviando arquivos ({progress.currentBlob}/{progress.totalBlobs})</span>
                  <span>{blobPercentage}%</span>
                </div>
                <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden border border-[#30363d]">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-150"
                    style={{ width: `${blobPercentage}%` }}
                  />
                </div>
                {progress.currentFileName && (
                  <p className="text-[11px] text-slate-500 truncate font-mono">
                    Arquivo: {progress.currentFileName}
                  </p>
                )}
              </div>
            )}

            {/* Steps list */}
            <div className="space-y-2 pt-2">
              {stepsList.map((s) => {
                const status = getStepStatus(s.key);
                const Icon = s.icon;
                return (
                  <div
                    key={s.key}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-mono transition-colors ${
                      status === 'running'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : status === 'completed'
                        ? 'bg-[#0d1117] text-slate-300'
                        : 'opacity-40 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{s.label}</span>
                    </div>
                    {status === 'running' && (
                      <div className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin shrink-0" />
                    )}
                    {status === 'completed' && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Success Screen */}
        {isCompleted && (
          <div className="py-6 space-y-4">
            {progress.repoUrl && (
              <a
                href={progress.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors flex items-center justify-between group text-white cursor-pointer"
              >
                <div>
                  <div className="text-xs text-emerald-400 font-medium">Repositório no GitHub</div>
                  <div className="text-sm font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5 mt-0.5">
                    <span>{progress.repoUrl.replace('https://github.com/', '')}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </a>
            )}

            {/* Commit SHA */}
            {progress.commitSha && (
              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Commit SHA</span>
                  <span className="text-xs font-mono text-slate-300">
                    {progress.commitSha.slice(0, 10)}...
                  </span>
                </div>
                <button
                  onClick={() => copyText(progress.commitSha!, 'sha')}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedSha ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSha ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            )}

            {/* Quick Clone Command */}
            {progress.repoUrl && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-mono">Clone o repositório localmente:</span>
                <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between font-mono text-xs text-slate-300">
                  <code className="truncate pr-2 select-all">
                    git clone {progress.repoUrl}.git
                  </code>
                  <button
                    onClick={() => copyText(`git clone ${progress.repoUrl}.git`, 'clone')}
                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copiar comando"
                  >
                    {copiedClone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {isDemoMode && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Modo Simulação: O fluxo Git completo foi simulado com precisão. Conecte seu token pessoal do GitHub para enviar repositórios reais!
                </span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Concluir e Voltar
              </button>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {isError && (
          <div className="py-6 space-y-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
              <div className="font-semibold text-rose-200">Falha ao processar o envio:</div>
              <p className="font-mono">{progress.errorMessage || 'Erro inesperado na chamada ao GitHub.'}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Tentar Novamente
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer border border-[#30363d]"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
