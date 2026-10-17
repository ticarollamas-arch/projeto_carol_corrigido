import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { analisarPacoteReal } from './backend-analyzer.js';

const app = express();
const port = Number(process.env.PORT) || 3000;
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
app.use(express.json({ limit: '2mb' }));

const uploadDir = path.resolve(process.cwd(), 'tmp');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

// Resolve from the project directory so execution does not depend on the caller's cwd.
const promptPath = path.resolve(process.cwd(), 'src/prompts/carol-master.md');
let safePrompt = '';
try {
  safePrompt = fs.readFileSync(promptPath, 'utf8').trim();
} catch (error) {
  console.error(`Não foi possível carregar o prompt mestre em ${promptPath}:`, error);
}

const PROVIDERS: Record<string, { baseUrl: string; model: string; envKey: string }> = {
  nvidia: { baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama-3.3-70b-instruct', envKey: 'NVIDIA_API_KEY' },
  deepseek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', envKey: 'DEEPSEEK_API_KEY' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', envKey: 'OPENAI_API_KEY' },
  groq: { baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile', envKey: 'GROQ_API_KEY' },
  ollama: { baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/v1', model: process.env.OLLAMA_MODEL || 'llama3.2:3b', envKey: 'OLLAMA_API_KEY' },
  custom: { baseUrl: '', model: '', envKey: 'CUSTOM_AI_API_KEY' },
};

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, promptLoaded: Boolean(safePrompt), service: 'CAROL Engine' });
});

app.post('/api/analyze-architecture', (req: Request, res: Response, next) => {
  upload.single('file')(req, res, (err: any) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: `Arquivo excede o limite de ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` });
      return;
    }
    res.status(400).json({ error: err?.message || 'Não foi possível receber o arquivo enviado.' });
  });
}, async (req: Request, res: Response): Promise<void> => {
  const uploadedPath = req.file?.path;
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo foi enviado. Selecione um ZIP ou APK.' });
      return;
    }
    if (!safePrompt) {
      res.status(500).json({ error: 'O prompt mestre não foi carregado no servidor. Verifique src/prompts/carol-master.md e reinicie o backend.' });
      return;
    }

    const projectName = String(req.body?.projectName || req.file.originalname || 'Projeto enviado').slice(0, 240);
    const extension = path.extname(req.file.originalname || '').toLowerCase();
    if (!['.zip', '.apk', '.xapk', '.tar', '.gz', '.tgz', '.rar', '.7z'].includes(extension)) {
      res.status(415).json({ error: `Formato ${extension || 'sem extensão'} não aceito para análise. Envie um ZIP ou APK.` });
      return;
    }

    console.log(`Análise solicitada: ${projectName} (${req.file.size} bytes)`);
    const evidence = analisarPacoteReal(req.file.path);
    if (evidence.erro) {
      res.status(422).json({ error: `Não foi possível analisar o pacote: ${evidence.erro}` });
      return;
    }
    if (!evidence.codigo.trim()) {
      res.status(422).json({ error: 'O pacote foi lido, mas não foi possível extrair evidências textuais suficientes para uma análise confiável.' });
      return;
    }

    const requestedProvider = String(req.header('x-ai-provider') || process.env.AI_PROVIDER || 'ollama').toLowerCase();
    const providerName = PROVIDERS[requestedProvider] ? requestedProvider : 'custom';
    const config = PROVIDERS[providerName];
    const customBaseUrl = String(req.header('x-ai-base-url') || process.env.AI_BASE_URL || '').trim();
    const targetBaseUrl = (customBaseUrl || config.baseUrl).replace(/\/+$/, '');
    const targetModel = String(req.header('x-ai-model') || process.env.AI_MODEL || config.model).trim();
    const targetApiKey = String(req.header('x-ai-api-key') || process.env[config.envKey] || '').trim();

    if (!targetBaseUrl) {
      res.status(400).json({ error: `A URL-base não está configurada para o provedor ${providerName}. Configure ai_base_url.` });
      return;
    }
    if (!targetModel) {
      res.status(400).json({ error: `O modelo não está configurado para o provedor ${providerName}. Configure ai_model.` });
      return;
    }
    const isLocalOllama = providerName === 'ollama' && /localhost|127\.0\.0\.1|::1/.test(targetBaseUrl);
    if (!targetApiKey && !isLocalOllama) {
      res.status(401).json({ error: `Chave de API ausente para ${providerName}. Configure a chave no painel ou no ambiente do servidor.` });
      return;
    }

    const promptFinal = [
      `Analise o pacote real chamado: ${projectName}`,
      'INSTRUÇÕES: produza conclusões baseadas nas evidências abaixo. Diferencie fatos, inferências e limitações. Não afirme que houve descompilação se o código não foi recuperado.',
      evidence.manifest ? `\n=== MANIFESTO / METADADOS ===\n${evidence.manifest.slice(0, 15000)}` : '\n=== MANIFESTO ===\nNão foi recuperado um manifesto textual.',
      `\n=== EVIDÊNCIAS EXTRAÍDAS ===\n${evidence.codigo.slice(0, 60000)}`,
      '\nRetorne JSON válido com os campos overview, techStack, architectureBreakdown, stepByStepLogic, masterPrompt e visualDifferentiationTips. Se não conseguir estruturar JSON, retorne texto Markdown claro.',
    ].join('\n');

    const endpoint = /\/chat\/completions$/i.test(targetBaseUrl) ? targetBaseUrl : `${targetBaseUrl}/chat/completions`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (targetApiKey) headers.Authorization = `Bearer ${targetApiKey}`;

    let llmRes: globalThis.Response;
    try {
      llmRes = await fetch(endpoint, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(180000),
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: safePrompt },
            { role: 'user', content: promptFinal },
          ],
          temperature: 0.2,
          max_tokens: 8000,
        }),
      });
    } catch (error: any) {
      res.status(502).json({ error: `Não foi possível conectar ao provedor ${providerName}: ${error?.message || 'falha de rede'}` });
      return;
    }

    if (!llmRes.ok) {
      const errText = (await llmRes.text().catch(() => '')).slice(0, 1500);
      res.status(502).json({ error: `O provedor ${providerName} respondeu HTTP ${llmRes.status}${errText ? `: ${errText}` : ''}` });
      return;
    }

    const llmData: any = await llmRes.json();
    let rawContent = llmData?.choices?.[0]?.message?.content;
    if (Array.isArray(rawContent)) rawContent = rawContent.map((part: any) => part?.text || '').join('\n');
    if (typeof rawContent !== 'string' || !rawContent.trim()) {
      res.status(502).json({ error: `O provedor ${providerName} respondeu sem conteúdo de análise.` });
      return;
    }

    const cleaned = rawContent.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    let analysis: any;
    try { analysis = JSON.parse(cleaned); }
    catch {
      analysis = {
        overview: 'Relatório técnico gerado a partir das evidências fornecidas pelo pacote.',
        techStack: [],
        architectureBreakdown: { pattern: 'Ver relatório completo', dataFlow: 'Ver relatório completo', modules: [] },
        stepByStepLogic: [],
        masterPrompt: cleaned,
        visualDifferentiationTips: 'Consulte as evidências e limitações descritas no relatório.',
      };
    }
    if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) {
      res.status(502).json({ error: 'A resposta do provedor não contém uma estrutura de relatório válida.' });
      return;
    }
    if (typeof analysis.masterPrompt !== 'string' || !analysis.masterPrompt.trim()) {
      analysis.masterPrompt = cleaned;
    }
    res.json({ success: true, analysis, metadata: { projectName, provider: providerName, model: targetModel, evidenceCharacters: evidence.codigo.length } });
  } catch (error: any) {
    console.error('Falha em /api/analyze-architecture:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Erro interno durante a análise.' });
  } finally {
    if (uploadedPath) {
      try { fs.unlinkSync(uploadedPath); } catch { /* best effort cleanup */ }
    }
  }
});

const isProd = process.env.NODE_ENV === 'production';
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(port, '0.0.0.0', () => console.log(`CAROL Engine rodando na porta ${port}`));
}
startServer().catch((err) => { console.error('Falha ao iniciar o servidor:', err); process.exitCode = 1; });
