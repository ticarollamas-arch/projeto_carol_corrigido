import { GitHubUser } from '../types';
import { GitBranch, Github, ExternalLink, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  user: GitHubUser | null;
  isDemoMode: boolean;
  onOpenTokenModal: () => void;
  onDisconnect: () => void;
  onOpenGuide: () => void;
}

export function Header({
  user,
  isDemoMode,
  onOpenTokenModal,
  onDisconnect,
  onOpenGuide,
}: HeaderProps) {
  return (
    <header className="border-b border-[#30363d] bg-[#161b22] sticky top-0 z-30 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        {/* Zone 1: Brand title wordmark */}
        <a
          href="/"
          className="flex items-center gap-2.5 text-[clamp(1rem,3.5vw,1.15rem)] font-bold tracking-tight text-white shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="truncate">ZipToGit</span>
          <span className="text-[10px] sm:text-xs font-normal text-slate-400 border border-slate-700 rounded px-1.5 py-0.5">
            Auto-Push
          </span>
        </a>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-medium text-slate-400">
          <button
            onClick={onOpenGuide}
            className="hover:text-white transition-colors shrink-0 cursor-pointer text-left"
          >
            Como Funciona
          </button>
          <a
            href="#apk-section"
            className="hover:text-emerald-400 transition-colors shrink-0"
          >
            Extrator APK & Binários
          </a>
          <a
            href="https://docs.github.com/rest/git"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors shrink-0 flex items-center gap-1"
          >
            <span>GitHub Git API</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Processamento local seguro</span>
          </div>
        </nav>

        {/* Zone 3: Primary action / Auth state */}
        <div className="flex items-center gap-2 shrink-0 max-w-full">
          {user ? (
            <div className="flex items-center gap-2 max-w-full">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0d1117] border border-[#30363d] max-w-[190px] sm:max-w-xs truncate">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] sm:text-xs font-medium text-slate-200 truncate">
                  @{user.login}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono tabular-nums shrink-0">
                  {user.public_repos} repos
                </span>
              </div>
              <button
                onClick={onDisconnect}
                className="text-[11px] sm:text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-1.5 py-1"
                title="Desconectar conta GitHub"
              >
                Sair
              </button>
            </div>
          ) : isDemoMode ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded">
                Simulação
              </span>
              <button
                onClick={onOpenTokenModal}
                className="px-2.5 sm:px-3 py-1.5 text-[clamp(0.7rem,2.5vw,0.75rem)] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors cursor-pointer truncate"
              >
                Conectar Token
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenTokenModal}
              className="px-2.5 sm:px-3.5 py-1.5 text-[clamp(0.7rem,2.5vw,0.75rem)] font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm truncate"
            >
              <Github className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Conectar Token</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
