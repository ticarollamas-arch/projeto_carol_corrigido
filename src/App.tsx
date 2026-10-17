import { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Github,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  FolderArchive,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  KeyRound,
} from 'lucide-react';
import { Header } from './components/Header';
import { TokenModal } from './components/TokenModal';
import { ZipDropzone } from './components/ZipDropzone';
import { RepositoryConfig } from './components/RepositoryConfig';
import { FileTreeViewer } from './components/FileTreeViewer';
import { FilePreviewModal } from './components/FilePreviewModal';
import { PublishPipelineModal } from './components/PublishPipelineModal';
import { GuideModal } from './components/GuideModal';
import { ApkExtractorSection } from './components/ApkExtractorSection';
import { CleanRoomArchitectModal } from './components/CleanRoomArchitectModal';
import { analyzeProjectArchitecture } from './services/architectureService';
import { parseZipFile } from './services/zipParser';
import {
  validateToken,
  fetchUserRepos,
  createRepo,
  pushFilesToGitHub,
  simulatePushToGitHub,
} from './services/github';
import {
  GitHubUser,
  GitHubRepo,
  ZipMetadata,
  PushOptions,
  PushStepProgress,
  ParsedZipFile,
  ArchitectureAnalysis,
} from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [userRepos, setUserRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);

  // Zip state
  const [currentZip, setCurrentZip] = useState<ZipMetadata | null>(null);
  const [isLoadingZip, setIsLoadingZip] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<ParsedZipFile | null>(null);

  // Push options
  const [options, setOptions] = useState<PushOptions>({
    repoName: '',
    isNewRepo: true,
    isPrivate: false,
    description: '',
    branch: 'main',
    commitMessage: 'feat: upload de arquivos via ZipToGit',
    ignoreNodeModules: true,
    ignoreGitFolders: true,
    ignoreEnvFiles: true,
    ignoreOsFiles: true,
    autoPushOnDrop: true, // "espontaneamente para github"
  });

  // Pipeline state
  const [pushProgress, setPushProgress] = useState<PushStepProgress>({ step: 'idle' });
  const [isPipelineOpen, setIsPipelineOpen] = useState<boolean>(false);

  // Modals
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isArchitectModalOpen, setIsArchitectModalOpen] = useState<boolean>(false);
  const [architectAnalysis, setArchitectAnalysis] = useState<ArchitectureAnalysis | null>(null);
  const [isLoadingArchitecture, setIsLoadingArchitecture] = useState<boolean>(false);
  const [analysisProjectName, setAnalysisProjectName] = useState<string>('');
  const [targetAnalysisZip, setTargetAnalysisZip] = useState<ZipMetadata | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  async function handleOpenArchitecture() {
    if (!rawFile) {
      alert('Por favor, anexe um arquivo APK ou ZIP primeiro.');
      return;
    }
    
    setIsArchitectModalOpen(true);
    setAnalysisProjectName(rawFile.name);
    setIsLoadingArchitecture(true);
    
    // Pega configurações salvas no navegador
    
    
    
    

    try {
      const result = await analyzeProjectArchitecture(
        rawFile.name, rawFile
      );
      setArchitectAnalysis(result);
    } catch (err: any) {
      alert(`Falha ao desconstruir arquitetura: ${err.message}`);
    } finally {
      setIsLoadingArchitecture(false);
    }
  }

  // Load saved token from storage on mount
  useEffect(() => {
    const savedToken =
      localStorage.getItem('ziptogit_token') || sessionStorage.getItem('ziptogit_token');
    if (savedToken) {
      validateToken(savedToken)
        .then((userData) => {
          setToken(savedToken);
          setUser(userData);
          loadRepos(savedToken);
        })
        .catch(() => {
          localStorage.removeItem('ziptogit_token');
          sessionStorage.removeItem('ziptogit_token');
        });
    }
  }, []);

  const loadRepos = useCallback(async (authToken: string) => {
    try {
      setIsLoadingRepos(true);
      const repos = await fetchUserRepos(authToken);
      setUserRepos(repos);
    } catch (err) {
      console.warn('Could not load user repositories', err);
    } finally {
      setIsLoadingRepos(false);
    }
  }, []);

  function handleTokenSuccess(newToken: string, newUser: GitHubUser) {
    setToken(newToken);
    setUser(newUser);
    setIsDemoMode(false);
    loadRepos(newToken);
  }

  function handleDisconnect() {
    setToken(null);
    setUser(null);
    setUserRepos([]);
    localStorage.removeItem('ziptogit_token');
    sessionStorage.removeItem('ziptogit_token');
  }

  function handleEnableDemo() {
    setIsDemoMode(true);
    setToken(null);
    setUser({
      login: 'demo-developer',
      id: 999999,
      avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
      name: 'Desenvolvedor Simulado',
      bio: 'Ambiente de teste sem necessidade de token real',
      public_repos: 12,
      html_url: 'https://github.com',
    });
  }

  // Execute the publish pipeline
  const executePublish = useCallback(
    async (zipMeta: ZipMetadata, customOptions: PushOptions) => {
      const filesToPush = zipMeta.files.filter((f) => !f.isDirectory && f.included);
      if (filesToPush.length === 0) {
        alert('Nenhum arquivo incluído para envio.');
        return;
      }

      setIsPipelineOpen(true);
      setPushProgress({ step: 'checking_repo', totalBlobs: filesToPush.length, currentBlob: 0 });

      try {
        if (isDemoMode || !token || !user) {
          // Simulation / dry-run
          const repoSlug = customOptions.repoName || 'meu-projeto-zip';
          await simulatePushToGitHub(
            user ? user.login : 'demo-developer',
            repoSlug,
            customOptions.branch || 'main',
            filesToPush,
            customOptions.commitMessage,
            (progress) => setPushProgress(progress)
          );
        } else {
          // Live GitHub API
          let targetRepoName = customOptions.repoName.trim();
          if (customOptions.isNewRepo) {
            setPushProgress({ step: 'creating_repo' });
            try {
              const created = await createRepo(
                token,
                targetRepoName,
                customOptions.isPrivate,
                customOptions.description
              );
              targetRepoName = created.name;
            } catch (createErr: any) {
              // If already exists and user wants to push into it
              if (createErr.message.includes('já existe')) {
                console.warn('Repository already exists, committing to existing repo.');
              } else {
                throw createErr;
              }
            }
          }

          await pushFilesToGitHub(
            token,
            user.login,
            targetRepoName,
            customOptions.branch || 'main',
            filesToPush,
            customOptions.commitMessage,
            (progress) => setPushProgress(progress)
          );
          // Refresh user repos after push
          loadRepos(token);
        }
      } catch (err: any) {
        setPushProgress({
          step: 'error',
          errorMessage: err.message || 'Falha ao processar envio para o GitHub.',
        });
      }
    },
    [isDemoMode, token, user, loadRepos]
  );

  // File selected/dropped
  async function handleFileSelected(file: File) {
    setRawFile(file);
    try {
      setIsLoadingZip(true);
      const meta = await parseZipFile(file, {
        ignoreNodeModules: options.ignoreNodeModules,
        ignoreGitFolders: options.ignoreGitFolders,
        ignoreEnvFiles: options.ignoreEnvFiles,
        ignoreOsFiles: options.ignoreOsFiles,
      });

      setCurrentZip(meta);

      // Sanitize repo name from zip filename
      const baseName = file.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-');

      const updatedOptions = {
        ...options,
        repoName: baseName || 'meu-projeto',
      };
      setOptions(updatedOptions);

      // SPONTANEOUS PUSH: If auto-push is ON and user/demo is ready, immediately trigger push!
      if (options.autoPushOnDrop) {
        if (token || isDemoMode) {
          // Give a short 500ms delay for smooth UI feedback before starting
          setTimeout(() => {
            executePublish(meta, updatedOptions);
          }, 500);
        } else {
          // If no token or demo mode set yet, open token modal so user can connect or click demo mode
          setIsTokenModalOpen(true);
        }
      }
    } catch (err: any) {
      alert(`Erro ao ler o arquivo ZIP: ${err.message}`);
    } finally {
      setIsLoadingZip(false);
    }
  }

  function handleClearZip() {
    setCurrentZip(null);
    setPushProgress({ step: 'idle' });
  }

  function handleToggleFile(filePath: string) {
    if (!currentZip) return;
    setCurrentZip({
      ...currentZip,
      files: currentZip.files.map((f) =>
        f.path === filePath ? { ...f, included: !f.included } : f
      ),
    });
  }

  function handleToggleAll(included: boolean) {
    if (!currentZip) return;
    setCurrentZip({
      ...currentZip,
      files: currentZip.files.map((f) => (!f.isDirectory ? { ...f, included } : f)),
    });
  }

  const canPublish = !!currentZip && (!!token || isDemoMode);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col font-sans selection:bg-emerald-500/30 w-full max-w-full overflow-x-hidden">
      {/* Top Bar Contract (3 zones) */}
      <Header
        user={user}
        isDemoMode={isDemoMode}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        onDisconnect={handleDisconnect}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
        {/* Hero Banner / Instructions */}
        <section className="text-left space-y-3 w-full max-w-full">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Automação Git</span>
            <span aria-hidden="true">·</span>
            <span>Git Data API REST</span>
            <span aria-hidden="true">·</span>
            <span>Sem dependência de terminal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white max-w-3xl leading-tight">
            Anexe o arquivo ZIP e envie espontaneamente para o GitHub
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed break-words">
            Solte qualquer projeto compactado em <code className="text-emerald-400 font-mono">.zip</code>. O ZipToGit extrai os arquivos no navegador, filtra dependências pesadas e publica os commits diretamente no seu repositório GitHub em segundos.
          </p>

          {!user && !isDemoMode && (
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsTokenModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white text-[clamp(0.75rem,2.5vw,0.8rem)] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span className="truncate">Conectar seu Token do GitHub para Iniciar</span>
              </button>
              <button
                type="button"
                onClick={handleEnableDemo}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white text-[clamp(0.75rem,2.5vw,0.8rem)] font-medium rounded-lg transition-colors border border-[#30363d] flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Testar Primeiro em Modo Simulação</span>
              </button>
            </div>
          )}
        </section>

        {/* Primary Interactive Zone: Dropzone & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Dropzone & File Inspection */}
          <div className="lg:col-span-7 space-y-6">
            <ZipDropzone
              currentZip={currentZip}
              isLoadingZip={isLoadingZip}
              onFileSelected={handleFileSelected}
              onClearZip={handleClearZip}
              onOpenArchitecture={handleOpenArchitecture}
            />

            {currentZip && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Criar um projeto similar do seu jeito?
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Desconstrua a lógica e gere o prompt mestre para uma IA programar uma versão 100% autoral.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenArchitecture}
                  className="w-full sm:w-auto px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm text-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Desconstruir & Gerar Prompt</span>
                </button>
              </div>
            )}

            {currentZip && (
              <FileTreeViewer
                files={currentZip.files}
                onToggleFile={handleToggleFile}
                onToggleAll={handleToggleAll}
                onPreviewFile={(f) => setPreviewFile(f)}
              />
            )}

            {!currentZip && (
              <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] text-left space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Como funciona o fluxo espontâneo</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
                  <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
                    <span className="font-semibold text-slate-200 block">1. Arraste o ZIP</span>
                    <p className="text-[11px] leading-relaxed">
                      Selecione ou solte o arquivo do projeto (.zip).
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
                    <span className="font-semibold text-slate-200 block">2. Filtro Automático</span>
                    <p className="text-[11px] leading-relaxed">
                      Remove node_modules, .env e arquivos de sistema.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
                    <span className="font-semibold text-slate-200 block">3. Push Espontâneo</span>
                    <p className="text-[11px] leading-relaxed">
                      Cria o repo e gera o commit diretamente no GitHub.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Repository Configuration */}
          <div className="lg:col-span-5 space-y-6">
            <RepositoryConfig
              options={options}
              onChange={setOptions}
              userRepos={userRepos}
              isLoadingRepos={isLoadingRepos}
              onRefreshRepos={() => token && loadRepos(token)}
              onTriggerPublish={() => currentZip && executePublish(currentZip, options)}
              isPublishing={pushProgress.step !== 'idle' && pushProgress.step !== 'completed' && pushProgress.step !== 'error'}
              canPublish={canPublish}
              isDemoMode={isDemoMode}
              hasZip={!!currentZip}
            />
          </div>
        </div>

        {/* APK Reverse Engineering & Package Extractor Section */}
        <div id="apk-section">
          <ApkExtractorSection
            onRawFileSelected={setRawFile}
            onTransferToGitHub={(apkMetadata) => {
              setCurrentZip(apkMetadata);
              const baseName = apkMetadata.fileName
                .replace(/\.[^/.]+$/, '')
                .toLowerCase()
                .replace(/[^a-z0-9-_]/g, '-');
              setOptions({
                ...options,
                repoName: `${baseName}-extraido`,
                description: `Arquivos e recursos extraídos do pacote ${apkMetadata.fileName} para análise e engenharia reversa`,
              });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPreviewFile={(f) => setPreviewFile(f)}
            onOpenArchitecture={handleOpenArchitecture}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] bg-[#161b22] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ZipToGit · Publicador Automático de Arquivos ZIP para GitHub</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Guia de Uso
            </button>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Tokens GitHub
            </a>
            <a
              href="https://docs.github.com/en/rest"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub REST Docs
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSuccess={handleTokenSuccess}
        onEnableDemo={handleEnableDemo}
        initialToken={token || ''}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenToken={() => setIsTokenModalOpen(true)}
      />

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

      <PublishPipelineModal
        isOpen={isPipelineOpen}
        progress={pushProgress}
        onClose={() => setIsPipelineOpen(false)}
        onRetry={() => currentZip && executePublish(currentZip, options)}
        isDemoMode={isDemoMode}
      />

      <CleanRoomArchitectModal
        isOpen={isArchitectModalOpen}
        onClose={() => setIsArchitectModalOpen(false)}
        projectName={analysisProjectName}
        analysis={architectAnalysis}
        isLoading={isLoadingArchitecture}
        file={rawFile}
        onRunAnalysis={handleOpenArchitecture}
      />
    </div>
  );
}
