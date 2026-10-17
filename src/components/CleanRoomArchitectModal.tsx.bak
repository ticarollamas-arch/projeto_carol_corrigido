import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  X,
  Layers,
  Cpu,
  BrainCircuit,
  Compass,
  Palette,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ArchitectureAnalysis } from '../types';

interface CleanRoomArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  analysis: ArchitectureAnalysis | null;
  isLoading: boolean;
  onRunAnalysis: () => void;
}

export function CleanRoomArchitectModal({
  isOpen,
  onClose,
  projectName,
  analysis,
  isLoading,
  onRunAnalysis,
}: CleanRoomArchitectModalProps) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'logic' | 'stack' | 'architecture'>('prompt');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  // Multi-Provider AI Engine state (stored in localStorage)
  const [provider, setProvider] = useState<string>('nvidia');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  useEffect(() => {
    const savedProvider = localStorage.getItem('ai_provider') || 'nvidia';
    const savedKey = localStorage.getItem('ai_api_key') || localStorage.getItem('nvidia_api_key') || '';
    const savedBaseUrl = localStorage.getItem('ai_base_url') || '';
    const savedModel = localStorage.getItem('ai_model') || '';

    setProvider(savedProvider);
    setApiKey(savedKey);
    setBaseUrl(savedBaseUrl);
    setModel(savedModel);
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSaveAiConfig(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem('ai_provider', provider);
    if (apiKey.trim()) {
      localStorage.setItem('ai_api_key', apiKey.trim());
      localStorage.setItem('nvidia_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('ai_api_key');
      localStorage.removeItem('nvidia_api_key');
    }
    if (baseUrl.trim()) {
      localStorage.setItem('ai_base_url', baseUrl.trim());
    } else {
      localStorage.removeItem('ai_base_url');
    }
    if (model.trim()) {
      localStorage.setItem('ai_model', model.trim());
    } else {
      localStorage.removeItem('ai_model');
    }

    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 2000);
    onRunAnalysis();
  }

  function handleCopyPrompt() {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.masterPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  function handleCopyFullSpecification() {
    if (!analysis) return;
    const fullMarkdown = `# Especificação Limpa de Arquitetura & Prompt: ${projectName}

## 1. Visão Geral
${analysis.overview}

## 2. Tecnologias & O que foi necessário para funcionar
${analysis.techStack.map((t) => `- **${t.name}** (${t.category}) [${t.necessity}]: ${t.role}`).join('\n')}

## 3. Padrão Arquitetural & Fluxo de Dados
- **Padrão:** ${analysis.architectureBreakdown.pattern}
- **Fluxo de Dados:** ${analysis.architectureBreakdown.dataFlow}

### Módulos Principais:
${analysis.architectureBreakdown.modules.map((m) => `### ${m.name}\n- **Propósito:** ${m.purpose}\n- **Responsabilidade:** ${m.responsibility}`).join('\n\n')}

## 4. Lógica Passo a Passo para Criar do Zero
${analysis.stepByStepLogic.map((s) => `### Passo ${s.stepNumber}: ${s.title}\n**Objetivo:** ${s.objective}\n**Tarefas:**\n${s.keyTasks.map((k) => `  - ${k}`).join('\n')}\n**O que evitar:** ${s.pitfallsToAvoid}`).join('\n\n')}

## 5. Dicas de Diferenciação Visual & UX
${analysis.visualDifferentiationTips}

---

## 6. Prompt Mestre para IA
\`\`\`markdown
${analysis.masterPrompt}
\`\`\`
`;
    navigator.clipboard.writeText(fullMarkdown);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  }

  function handleDownloadMarkdown() {
    if (!analysis) return;
    const fullMarkdown = `# Especificação Limpa de Arquitetura & Prompt: ${projectName}\n\n${analysis.masterPrompt}\n`;
    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-criacao-do-zero-${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-4xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden text-left my-auto">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#30363d] bg-[#0d1117] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-white truncate max-w-full">
                  Desconstrução de Arquitetura & Prompt do Zero
                </h2>
                <span className="text-[10px] sm:text-[11px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded shrink-0">
                  Clean-Room
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 break-words">
                Análise da lógica e arquitetura de <strong className="text-slate-200">{projectName}</strong> para você criar uma versão 100% autoral.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Universal Multi-Engine AI Provider Configuration Toggle */}
        <div className="border-b border-[#30363d] bg-[#161b22] px-3 sm:px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="text-[11px] sm:text-xs text-slate-300 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Motor de IA: <strong className="text-purple-300 capitalize">{provider}</strong> (NVIDIA, DeepSeek, OpenAI, Llama, Ollama)</span>
              {showKeyConfig ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
            </button>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px]">
              {provider === 'nvidia' && (
                <a
                  href="https://build.nvidia.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#58a6ff] hover:underline flex items-center gap-1"
                >
                  <span>Chave Free Tier (build.nvidia.com)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {provider === 'deepseek' && (
                <a
                  href="https://platform.deepseek.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#58a6ff] hover:underline flex items-center gap-1"
                >
                  <span>Chave DeepSeek</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {provider === 'openai' && (
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#58a6ff] hover:underline flex items-center gap-1"
                >
                  <span>Chave OpenAI</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {provider === 'groq' && (
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#58a6ff] hover:underline flex items-center gap-1"
                >
                  <span>Chave Groq (Meta Llama)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {provider === 'ollama' && (
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Ollama Local (Sem chave)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          {showKeyConfig && (
            <form onSubmit={handleSaveAiConfig} className="mt-2.5 pt-2 border-t border-[#30363d]/60 space-y-3">
              {/* Provider Selection Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'nvidia', label: 'NVIDIA NIM (Free Tier)' },
                  { id: 'deepseek', label: 'DeepSeek (V3 / R1)' },
                  { id: 'openai', label: 'OpenAI (GPT-4o)' },
                  { id: 'groq', label: 'Meta Llama (Groq)' },
                  { id: 'ollama', label: 'Ollama (Local)' },
                  { id: 'custom', label: 'Personalizado' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setProvider(item.id);
                      if (item.id === 'ollama' && !baseUrl) setBaseUrl('http://localhost:11434/v1');
                      if (item.id === 'ollama' && !model) setModel('llama3.3');
                      if (item.id === 'nvidia' && !model) setModel('meta/llama-3.3-70b-instruct');
                      if (item.id === 'deepseek' && !model) setModel('deepseek-chat');
                      if (item.id === 'openai' && !model) setModel('gpt-4o-mini');
                      if (item.id === 'groq' && !model) setModel('llama-3.3-70b-versatile');
                    }}
                    className={`px-2.5 py-1 text-[11px] rounded-md transition-colors cursor-pointer border ${
                      provider === item.id
                        ? 'bg-purple-600/30 border-purple-400 text-purple-200 font-semibold'
                        : 'bg-[#0d1117] border-[#30363d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Dynamic input fields depending on provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {provider !== 'ollama' ? (
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Chave de API ({provider === 'nvidia' ? 'nvapi-...' : provider === 'deepseek' ? 'sk-...' : 'Chave do Provedor'}):
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={provider === 'nvidia' ? 'nvapi-... (Opcional)' : 'sk-...'}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-purple-400 focus:outline-hidden rounded-md text-xs text-slate-200 font-mono placeholder:text-slate-600"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-emerald-400 mb-1">
                      Endpoint Local do Ollama:
                    </label>
                    <input
                      type="text"
                      value={baseUrl || 'http://localhost:11434/v1'}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="http://localhost:11434/v1"
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-emerald-400 focus:outline-hidden rounded-md text-xs text-slate-200 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    Modelo de Linguagem (LLM):
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={
                      provider === 'nvidia'
                        ? 'meta/llama-3.3-70b-instruct'
                        : provider === 'deepseek'
                        ? 'deepseek-chat'
                        : provider === 'ollama'
                        ? 'llama3.3 ou deepseek-r1'
                        : provider === 'groq'
                        ? 'llama-3.3-70b-versatile'
                        : 'gpt-4o-mini'
                    }
                    className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-purple-400 focus:outline-hidden rounded-md text-xs text-slate-200 font-mono placeholder:text-slate-600"
                  />
                </div>
              </div>

              {provider === 'custom' && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    URL Base OpenAI-Compatible (com /v1):
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://sua-api.com/v1 ou http://localhost:8000/v1"
                    className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-purple-400 focus:outline-hidden rounded-md text-xs text-slate-200 font-mono placeholder:text-slate-600"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                <p className="text-[10px] text-slate-500">
                  {provider === 'ollama'
                    ? 'Ollama executa localmente no seu computador sem enviar dados para a nuvem e sem precisar de chave.'
                    : 'A chave é salva apenas no seu navegador (localStorage) com fallback seguro para as variáveis de ambiente.'}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {savedKeySuccess ? 'Salvo no navegador!' : 'Salvar e Reanalisar'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 border-3 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">Desconstruindo a lógica e arquitetura do projeto...</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-md px-4">
              Examinando estrutura de pastas, dependências essenciais, fluxo de dados e gerando o prompt mestre para criação autoral do zero.
            </p>
          </div>
        )}

        {/* Analysis Content */}
        {!isLoading && analysis && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Tabs Bar - Wrapping on small screens */}
            <div className="px-3 sm:px-6 border-b border-[#30363d] bg-[#161b22] flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab('prompt')}
                className={`py-2.5 sm:py-3 px-2 sm:px-3 text-[11px] sm:text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === 'prompt'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Prompt Mestre</span>
              </button>

              <button
                onClick={() => setActiveTab('logic')}
                className={`py-2.5 sm:py-3 px-2 sm:px-3 text-[11px] sm:text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === 'logic'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Lógica Passo a Passo</span>
              </button>

              <button
                onClick={() => setActiveTab('stack')}
                className={`py-2.5 sm:py-3 px-2 sm:px-3 text-[11px] sm:text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === 'stack'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>O que Precisou</span>
              </button>

              <button
                onClick={() => setActiveTab('architecture')}
                className={`py-2.5 sm:py-3 px-2 sm:px-3 text-[11px] sm:text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === 'architecture'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Arquitetura</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#0d1117] max-w-full">
              {/* Tab 1: Master Prompt */}
              {activeTab === 'prompt' && (
                <div className="space-y-4 max-w-full">
                  <div className="p-3 sm:p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div className="break-words">
                      <strong>Diretriz de Criação Limpa:</strong> Este prompt foi construído para instruir uma IA a recriar a mecânica do projeto com arquitetura original, incentivando uma identidade visual exclusiva sem reaproveitar marcas ou arquivos de terceiros.
                    </div>
                  </div>

                  <div className="relative rounded-xl border border-[#30363d] bg-[#161b22] p-3 sm:p-4 font-mono text-[11px] sm:text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-all overflow-x-auto max-h-80 break-words max-w-full">
                    {analysis.masterPrompt}
                  </div>

                  {analysis.visualDifferentiationTips && (
                    <div className="p-3 sm:p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5 max-w-full">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                        <Palette className="w-4 h-4 shrink-0" />
                        <span>Como Criar uma Identidade Visual Única</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed break-words">
                        {analysis.visualDifferentiationTips}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Step-by-Step Logic */}
              {activeTab === 'logic' && (
                <div className="space-y-3.5 max-w-full">
                  <p className="text-xs text-slate-400">
                    Abaixo está a ordem lógica recomendada para você construir o seu projeto do zero:
                  </p>
                  <div className="space-y-3">
                    {analysis.stepByStepLogic.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-3.5 sm:p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2 max-w-full"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] sm:text-[11px] font-mono shrink-0">
                              {step.stepNumber}
                            </span>
                            <span className="break-words">{step.title}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium break-words">{step.objective}</p>
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] text-slate-500 block">Tarefas Principais:</span>
                          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                            {step.keyTasks.map((t, idx) => (
                              <li key={idx} className="break-words">{t}</li>
                            ))}
                          </ul>
                        </div>
                        {step.pitfallsToAvoid && (
                          <div className="pt-1 text-[11px] text-amber-300/90 flex items-start gap-1.5 break-words">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                            <span><strong>O que evitar:</strong> {step.pitfallsToAvoid}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Tech Stack */}
              {activeTab === 'stack' && (
                <div className="space-y-3.5 max-w-full">
                  <p className="text-xs text-slate-400">
                    Tecnologias e dependências fundamentais identificadas no projeto:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {analysis.techStack.map((tech, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1 max-w-full"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white font-mono truncate">{tech.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 shrink-0">
                            {tech.necessity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{tech.category}</div>
                        <p className="text-xs text-slate-300 pt-1 leading-relaxed break-words">{tech.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Architecture */}
              {activeTab === 'architecture' && (
                <div className="space-y-3.5 max-w-full">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2.5 max-w-full">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Padrão Arquitetural</span>
                      <span className="text-xs font-semibold text-white break-words">
                        {analysis.architectureBreakdown.pattern}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Fluxo de Dados</span>
                      <p className="text-xs text-slate-300 font-mono mt-0.5 leading-relaxed bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d] break-words">
                        {analysis.architectureBreakdown.dataFlow}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1 max-w-full">
                    <span className="text-xs font-semibold text-white">Módulos Essenciais:</span>
                    {analysis.architectureBreakdown.modules.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-0.5 text-xs max-w-full"
                      >
                        <span className="font-bold text-purple-400 font-mono block">{m.name}</span>
                        <p className="text-slate-300 break-words"><strong>Propósito:</strong> {m.purpose}</p>
                        <p className="text-slate-400 break-words"><strong>Responsabilidade:</strong> {m.responsibility}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Actions with Responsive Wrap */}
            <div className="p-3 sm:p-4 border-t border-[#30363d] bg-[#161b22] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="w-full sm:w-auto px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[36px]"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copiado!' : 'Copiar Prompt Mestre'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyFullSpecification}
                  className="w-full sm:w-auto px-3 py-2 bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors border border-[#30363d] flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px]"
                >
                  {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFull ? 'Copiado!' : 'Copiar Análise'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="w-full sm:w-auto px-3 py-2 bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors border border-[#30363d] flex items-center justify-center gap-1 cursor-pointer min-h-[36px]"
                  title="Baixar em arquivo Markdown (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .md</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Empty state if analysis is null and not loading */}
        {!isLoading && !analysis && (
          <div className="p-6 sm:p-8 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Nenhuma análise de arquitetura foi gerada ainda para este projeto.
            </p>
            <button
              onClick={onRunAnalysis}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Iniciar Análise de Arquitetura & Gerar Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
