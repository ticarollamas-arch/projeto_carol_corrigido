import React, { useState } from 'react';
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
} from 'lucide-react';
import { ArchitectureAnalysis } from '../types';

interface CleanRoomArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  analysis: ArchitectureAnalysis | null;
  isLoading: boolean;
  onRunAnalysis: () => void;
  file: File | null;
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

  if (!isOpen) return null;

  function handleCopyPrompt() {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.masterPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  function handleCopyFullSpecification() {
    if (!analysis) return;
    const fullMarkdown = `# Especificação Limpa de Arquitetura & Prompt: ${projectName}\n\n${analysis.masterPrompt}\n`;
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
    a.download = `prompt-criacao-${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl max-w-5xl w-full flex flex-col max-h-[95vh] shadow-2xl overflow-hidden text-left my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#30363d] bg-[#161b22] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-1">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">Desconstrução de Arquitetura</h2>
                <span className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-md shrink-0">Clean-Room</span>
              </div>
              <p className="text-sm text-slate-400 mt-1.5 break-words leading-relaxed">
                Análise da lógica de <strong className="text-slate-200">{projectName}</strong> para criar uma versão 100% autoral.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-lg transition-colors cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-10 sm:p-16 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
            <h3 className="text-base sm:text-lg font-semibold text-white">Desconstruindo a lógica do projeto...</h3>
            <p className="text-sm text-slate-400 max-w-md px-4 leading-relaxed">
              Extraindo código real via JADX e gerando o relatório com o Ollama Cloud. Isso pode levar alguns minutos.
            </p>
          </div>
        )}

        {/* Content Area */}
        {!isLoading && analysis && (
          <div className="flex flex-col flex-1 min-h-0 bg-[#0d1117]">
            {/* Tabs */}
            <div className="px-4 sm:px-6 border-b border-[#30363d] bg-[#161b22] flex items-center gap-2 overflow-x-auto shrink-0 pt-2">
              {[
                { id: 'prompt', icon: Sparkles, label: 'Prompt Mestre' },
                { id: 'logic', icon: Compass, label: 'Lógica Passo a Passo' },
                { id: 'stack', icon: Cpu, label: 'O que Precisou' },
                { id: 'architecture', icon: Layers, label: 'Arquitetura' },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer rounded-t-lg ${activeTab === tab.id ? 'border-purple-400 text-purple-300 bg-[#0d1117]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#21262d]/50'}`}>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              {activeTab === 'prompt' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div className="break-words leading-relaxed">
                      <strong>Diretriz de Criação Limpa:</strong> Este prompt foi construído para instruir uma IA a recriar a mecânica com arquitetura original e identidade visual exclusiva.
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#30363d] bg-[#010409] p-4 sm:p-5 font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-all overflow-x-auto max-h-96 break-words">
                    {analysis.masterPrompt}
                  </div>

                  {analysis.visualDifferentiationTips && (
                    <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                        <Palette className="w-4 h-4 shrink-0" />
                        <span>Identidade Visual Única</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed break-words">
                        {analysis.visualDifferentiationTips}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'logic' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Ordem lógica recomendada para construção do zero:</p>
                  <div className="space-y-4">
                    {analysis.stepByStepLogic?.map((step) => (
                      <div key={step.stepNumber} className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">{step.stepNumber}</span>
                          <span className="text-sm font-bold text-white break-words">{step.title}</span>
                        </div>
                        <p className="text-sm text-slate-300 font-medium break-words">{step.objective}</p>
                        <div className="space-y-1.5 pt-1">
                          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Tarefas Principais:</span>
                          <ul className="text-sm text-slate-400 space-y-1.5 list-disc list-inside">
                            {step.keyTasks?.map((t, idx) => <li key={idx} className="break-words">{t}</li>)}
                          </ul>
                        </div>
                        {step.pitfallsToAvoid && (
                          <div className="pt-2 text-sm text-amber-300/90 flex items-start gap-2 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 break-words">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                            <span><strong>Evitar:</strong> {step.pitfallsToAvoid}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'stack' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Tecnologias e dependências fundamentais:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analysis.techStack?.map((tech, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white font-mono truncate">{tech.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/30 shrink-0">{tech.necessity}</span>
                        </div>
                        <div className="text-xs text-slate-400 truncate">{tech.category}</div>
                        <p className="text-sm text-slate-300 pt-1 leading-relaxed break-words">{tech.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="space-y-5">
                  <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Padrão Arquitetural</span>
                      <span className="text-sm font-semibold text-white break-words">{analysis.architectureBreakdown?.pattern}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Fluxo de Dados</span>
                      <p className="text-sm text-slate-300 font-mono mt-1 leading-relaxed bg-[#0d1117] p-3.5 rounded-lg border border-[#30363d] break-words">{analysis.architectureBreakdown?.dataFlow}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-sm font-semibold text-white">Módulos Essenciais:</span>
                    {analysis.architectureBreakdown?.modules?.map((m, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5 text-sm">
                        <span className="font-bold text-purple-400 font-mono block text-base">{m.name}</span>
                        <p className="text-slate-300 break-words"><strong>Propósito:</strong> {m.purpose}</p>
                        <p className="text-slate-400 break-words"><strong>Responsabilidade:</strong> {m.responsibility}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-[#30363d] bg-[#161b22] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                <button type="button" onClick={handleCopyPrompt} className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]">
                  {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPrompt ? 'Copiado!' : 'Copiar Prompt'}</span>
                </button>
                <button type="button" onClick={handleCopyFullSpecification} className="w-full sm:w-auto px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-[#30363d] flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
                  {copiedFull ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFull ? 'Copiado!' : 'Copiar Análise'}</span>
                </button>
                <button type="button" onClick={handleDownloadMarkdown} className="w-full sm:w-auto px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-[#30363d] flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
                  <Download className="w-4 h-4" />
                  <span>Baixar .md</span>
                </button>
              </div>
              <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer text-center bg-[#21262d] hover:bg-[#30363d] sm:bg-transparent sm:hover:bg-transparent rounded-lg border border-[#30363d] sm:border-transparent min-h-[44px]">
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !analysis && (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <p className="text-sm text-slate-400">Nenhuma análise de arquitetura foi gerada ainda para este projeto.</p>
            <button onClick={onRunAnalysis} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-md">
              Iniciar Análise de Arquitetura & Gerar Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
