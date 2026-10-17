import React from 'react';
import {
  FolderPlus,
  GitBranch,
  Lock,
  Globe,
  Settings2,
  Zap,
  ShieldAlert,
  GitCommit,
  CheckCircle2,
  FolderGit2,
} from 'lucide-react';
import { GitHubRepo, PushOptions } from '../types';

interface RepositoryConfigProps {
  options: PushOptions;
  onChange: (options: PushOptions) => void;
  userRepos: GitHubRepo[];
  isLoadingRepos: boolean;
  onRefreshRepos: () => void;
  onTriggerPublish: () => void;
  isPublishing: boolean;
  canPublish: boolean;
  isDemoMode: boolean;
  hasZip: boolean;
}

export function RepositoryConfig({
  options,
  onChange,
  userRepos,
  isLoadingRepos,
  onRefreshRepos,
  onTriggerPublish,
  isPublishing,
  canPublish,
  isDemoMode,
  hasZip,
}: RepositoryConfigProps) {
  function updateField<K extends keyof PushOptions>(key: K, value: PushOptions[K]) {
    onChange({
      ...options,
      [key]: value,
    });
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6 text-left w-full max-w-full">
      {/* Header and Automatic Push Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#30363d]">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span>Configurações do Repositório GitHub</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Defina o destino e comportamento do envio para o GitHub
          </p>
        </div>

        {/* Auto-Push switch for the "espontaneamente" behavior */}
        <label className="flex items-center gap-2.5 p-2 px-3 bg-[#0d1117] border border-[#30363d] rounded-lg cursor-pointer hover:border-emerald-500/50 transition-colors w-full sm:w-auto">
          <input
            type="checkbox"
            checked={options.autoPushOnDrop}
            onChange={(e) => updateField('autoPushOnDrop', e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer shrink-0"
          />
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-medium text-slate-200">Envio Espontâneo ao Anexar</span>
          </div>
        </label>
      </div>

      {/* Target Repo: New vs Existing */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-2">Destino no GitHub</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => updateField('isNewRepo', true)}
              className={`p-3 rounded-lg border text-left transition-colors flex items-start gap-3 cursor-pointer ${
                options.isNewRepo
                  ? 'border-emerald-500 bg-emerald-500/10 text-white'
                  : 'border-[#30363d] bg-[#0d1117] text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <FolderPlus className={`w-5 h-5 shrink-0 mt-0.5 ${options.isNewRepo ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-semibold">Criar Novo Repositório</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Cria um repositório no GitHub automaticamente
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateField('isNewRepo', false)}
              className={`p-3 rounded-lg border text-left transition-colors flex items-start gap-3 cursor-pointer ${
                !options.isNewRepo
                  ? 'border-emerald-500 bg-emerald-500/10 text-white'
                  : 'border-[#30363d] bg-[#0d1117] text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <FolderGit2 className={`w-5 h-5 shrink-0 mt-0.5 ${!options.isNewRepo ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-semibold">Repositório Existente</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Comitar arquivos em um repositório já criado
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Repository Name & Visibility */}
        {options.isNewRepo ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="repo-name" className="text-xs font-medium text-slate-300 block mb-1">
                Nome do Repositório
              </label>
              <input
                id="repo-name"
                type="text"
                value={options.repoName}
                onChange={(e) => updateField('repoName', e.target.value)}
                placeholder="meu-projeto"
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-hidden rounded-lg text-sm text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Visibilidade</label>
              <div className="flex rounded-lg border border-[#30363d] bg-[#0d1117] p-1">
                <button
                  type="button"
                  onClick={() => updateField('isPrivate', false)}
                  className={`flex-1 py-1 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    !options.isPrivate ? 'bg-[#21262d] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Público</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('isPrivate', true)}
                  className={`flex-1 py-1 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    options.isPrivate ? 'bg-[#21262d] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Privado</span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="repo-desc" className="text-xs font-medium text-slate-300 block mb-1">
                Descrição do Repositório (Opcional)
              </label>
              <input
                id="repo-desc"
                type="text"
                value={options.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Repositório criado e enviado via ZipToGit"
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-hidden rounded-lg text-sm text-slate-200"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="existing-repo" className="text-xs font-medium text-slate-300">
                Selecione o Repositório
              </label>
              <button
                type="button"
                onClick={onRefreshRepos}
                className="text-xs text-[#58a6ff] hover:underline cursor-pointer"
              >
                {isLoadingRepos ? 'Atualizando...' : 'Recarregar lista'}
              </button>
            </div>
            {userRepos.length > 0 ? (
              <select
                id="existing-repo"
                value={options.repoName}
                onChange={(e) => updateField('repoName', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-hidden rounded-lg text-sm text-slate-200 font-mono"
              >
                <option value="">Selecione um repositório...</option>
                {userRepos.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.private ? 'Privado' : 'Público'})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={options.repoName}
                onChange={(e) => updateField('repoName', e.target.value)}
                placeholder="Nome do repositório (ex: meu-repositorio)"
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-hidden rounded-lg text-sm text-slate-200 font-mono"
              />
            )}
          </div>
        )}

        {/* Branch & Commit Message */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label htmlFor="branch-name" className="text-xs font-medium text-slate-300 block mb-1">
              Branch Alvo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <GitBranch className="w-3.5 h-3.5" />
              </div>
              <input
                id="branch-name"
                type="text"
                value={options.branch}
                onChange={(e) => updateField('branch', e.target.value)}
                placeholder="main"
                className="w-full pl-8 pr-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-hidden rounded-lg text-sm text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="commit-msg" className="text-xs font-medium text-slate-300 block mb-1">
              Mensagem de Commit
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <GitCommit className="w-3.5 h-3.5" />
              </div>
              <input
                id="commit-msg"
                type="text"
                value={options.commitMessage}
                onChange={(e) => updateField('commitMessage', e.target.value)}
                placeholder="feat: upload inicial de arquivos via ZipToGit"
                className="w-full pl-8 pr-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-hidden rounded-lg text-sm text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Smart Ignore Filters */}
        <div className="pt-2">
          <label className="text-xs font-medium text-slate-300 block mb-2">
            Filtros Inteligentes (Smart Ignore)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={options.ignoreNodeModules}
                onChange={(e) => updateField('ignoreNodeModules', e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
              />
              <span>Ignorar pastas <code className="text-amber-400 font-mono">node_modules/</code></span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={options.ignoreGitFolders}
                onChange={(e) => updateField('ignoreGitFolders', e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
              />
              <span>Ignorar pastas <code className="text-amber-400 font-mono">.git/</code> internas</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={options.ignoreEnvFiles}
                onChange={(e) => updateField('ignoreEnvFiles', e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <span>Ignorar arquivos confidenciais <code className="text-rose-400 font-mono">.env</code></span>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 inline" />
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={options.ignoreOsFiles}
                onChange={(e) => updateField('ignoreOsFiles', e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
              />
              <span>Ignorar arquivos de sistema (<code className="text-slate-400 font-mono">.DS_Store</code>, etc.)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Action Push Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!canPublish || isPublishing}
          onClick={onTriggerPublish}
          className="w-full py-3.5 px-4 rounded-lg text-[clamp(0.8rem,2.5vw,0.875rem)] font-semibold text-white bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer text-center"
        >
          {isPublishing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Publicando arquivos no GitHub...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>
                {isDemoMode
                  ? 'Executar Publicação Simulada no GitHub'
                  : 'Publicar Agora no GitHub'}
              </span>
            </>
          )}
        </button>
        {!hasZip && (
          <p className="text-center text-xs text-slate-500 mt-2">
            Anexe um arquivo .ZIP acima para habilitar o envio.
          </p>
        )}
      </div>
    </div>
  );
}
