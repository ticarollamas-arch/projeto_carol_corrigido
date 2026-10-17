import React, { useState } from 'react';
import { Github, KeyRound, ExternalLink, Shield, Check, Eye, EyeOff, AlertCircle, X, Sparkles } from 'lucide-react';
import { validateToken } from '../services/github';
import { GitHubUser } from '../types';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: GitHubUser) => void;
  onEnableDemo: () => void;
  initialToken?: string;
}

export function TokenModal({
  isOpen,
  onClose,
  onSuccess,
  onEnableDemo,
  initialToken = '',
}: TokenModalProps) {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberToken, setRememberToken] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleConnect(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    const clean = tokenInput.trim();
    if (!clean) {
      setError('Por favor, informe seu Personal Access Token do GitHub.');
      return;
    }

    try {
      setLoading(true);
      const user = await validateToken(clean);
      if (rememberToken) {
        localStorage.setItem('ziptogit_token', clean);
      } else {
        sessionStorage.setItem('ziptogit_token', clean);
      }
      onSuccess(clean, user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao validar o token com o GitHub.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoSelect() {
    onEnableDemo();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-lg w-full p-6 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-slate-100">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Conectar ao GitHub</h2>
            <p className="text-xs text-slate-400">
              Necessário para publicar seus repositórios e commits automaticamente
            </p>
          </div>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="token" className="text-xs font-medium text-slate-300">
                Personal Access Token (Classic ou Fine-grained)
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=ZipToGit+AutoPublisher"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1"
              >
                <span>Gerar Token (1-clique com escopo repo)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="token"
                type={showPassword ? 'text' : 'password'}
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="ghp_..."
                className="w-full pl-9 pr-10 py-2.5 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-hidden rounded-lg text-sm text-slate-200 font-mono placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              O token precisa ter permissão de <code className="text-[#58a6ff] bg-[#0d1117] px-1 py-0.5 rounded">repo</code> para criar repositórios e enviar commits.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={rememberToken}
                onChange={(e) => setRememberToken(e.target.checked)}
                className="rounded border-[#30363d] bg-[#0d1117] text-emerald-600 focus:ring-0"
              />
              <span>Lembrar token neste navegador (localStorage)</span>
            </label>
          </div>

          <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg flex items-start gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>100% Seguro:</strong> Seu token é armazenado apenas no seu navegador e usado estritamente para comunicar diretamente com o GitHub.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 py-2.5 px-4 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{loading ? 'Validando token...' : 'Conectar e Salvar'}</span>
            </button>

            <button
              type="button"
              onClick={handleDemoSelect}
              className="w-full sm:w-auto py-2.5 px-3.5 bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#30363d]"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Modo Simulação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
