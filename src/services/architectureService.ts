import { ArchitectureAnalysis } from '../types';

export async function analyzeProjectArchitecture(
  projectName: string,
  file: File,
): Promise<ArchitectureAnalysis> {
  if (!(file instanceof File)) throw new Error('Selecione um arquivo ZIP ou APK antes de iniciar a análise.');

  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('projectName', projectName || file.name);

  // Prefer user-selected provider settings, while keeping all secret values out of the URL.
  const provider = localStorage.getItem('ai_provider') || 'ollama';
  const apiKey = localStorage.getItem('ai_api_key') ||
    localStorage.getItem(`${provider}_api_key`) || '';
  const baseUrl = localStorage.getItem('ai_base_url') || '';
  const model = localStorage.getItem('ai_model') || '';
  const headers: Record<string, string> = { 'x-ai-provider': provider };
  if (apiKey.trim()) headers['x-ai-api-key'] = apiKey.trim();
  if (baseUrl.trim()) headers['x-ai-base-url'] = baseUrl.trim();
  if (model.trim()) headers['x-ai-model'] = model.trim();

  const response = await fetch('/api/analyze-architecture', {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : `Erro HTTP ${response.status} ao analisar o pacote.`);
  }
  if (!data.analysis || typeof data.analysis !== 'object') {
    throw new Error('O servidor respondeu sem um relatório de análise válido.');
  }
  return data.analysis as ArchitectureAnalysis;
}
