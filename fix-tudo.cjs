const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Remover qualquer tentativa anterior de rota e imports quebrados
const routeStart = content.indexOf("app.post('/api/analyze-architecture'");
if (routeStart !== -1) {
    let routeEnd = content.indexOf("app.get('*'", routeStart);
    if (routeEnd === -1) routeEnd = content.indexOf("async function startServer", routeStart);
    if (routeEnd === -1) routeEnd = content.indexOf("startServer()", routeStart);
    if (routeEnd !== -1) {
        content = content.substring(0, routeStart) + content.substring(routeEnd);
    }
}

content = content.replace(/import multer from 'multer';/g, '');
content = content.replace(/const { analisarPacoteReal } = require\('.\/backend-analyzer.cjs'\);/g, '');
content = content.replace(/const safePrompt = fs.readFileSync\('.\/src\/prompts\/carol-master.md', 'utf8'\);/g, '');
content = content.replace(/const upload = multer\({ dest: 'tmp\/' }\);/g, '');
content = content.replace(/import fs from 'fs';/g, '');

// 2. Adicionar os imports corretos no topo
const cleanImports = `
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import { analisarPacoteReal } from './backend-analyzer.js';
const safePrompt = fs.readFileSync('./src/prompts/carol-master.md', 'utf8');
const upload = multer({ dest: 'tmp/' });
`;
content = content.replace(/import express from 'express';/, cleanImports);

// 3. Inserir a rota no lugar correto (antes do const isProd)
const cleanRoute = `
app.post('/api/analyze-architecture', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'Nenhum arquivo enviado.' }); return; }
    const projectName = req.body.projectName || 'Projeto Desconhecido';
    const provider = (req.headers['x-ai-provider'] as string) || 'nvidia';
    const customBaseUrl = ((req.headers['x-ai-base-url'] as string) || '').trim();
    const customModel = ((req.headers['x-ai-model'] as string) || '').trim();
    const userApiKey = ((req.headers['x-ai-api-key'] as string) || '').trim();

    const dadosReais = analisarPacoteReal(req.file.path);
    fs.unlinkSync(req.file.path);

    if (dadosReais.erro) { res.status(500).json({ error: 'Erro na extração: ' + dadosReais.erro }); return; }

    const promptFinal = \`Analise os dados reais extraídos do aplicativo abaixo.\\n\\n=== MANIFESTO ===\\n\${dadosReais.manifest.slice(0, 15000)}\\n\\n=== CÓDIGO DESCOMPILADO ===\\n\${dadosReais.codigo.slice(0, 60000)}\`;

    let targetBaseUrl = '', targetModel = '';
    let targetApiKey = userApiKey || process.env.NVIDIA_API_KEY || '';

    if (provider === 'openai') {
      targetBaseUrl = customBaseUrl || 'https://api.openai.com/v1';
      targetModel = customModel || 'gpt-4o-mini';
    } else if (provider === 'deepseek') {
      targetBaseUrl = customBaseUrl || 'https://api.deepseek.com/v1';
      targetModel = customModel || 'deepseek-chat';
    } else if (provider === 'ollama') {
      targetBaseUrl = customBaseUrl || 'http://localhost:11434/v1';
      targetModel = customModel || 'llama3.3';
    } else {
      targetBaseUrl = customBaseUrl || 'https://integrate.api.nvidia.com/v1';
      targetModel = customModel || 'meta/llama-3.3-70b-instruct';
    }

    if (!targetApiKey && provider !== 'ollama') { res.status(401).json({ error: 'Chave de API ausente.' }); return; }

    const completionsUrl = \`\${targetBaseUrl.replace(/\\/+$/, '')}/chat/completions\`;
    const llmRes = await fetch(completionsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${targetApiKey}\` },
      body: JSON.stringify({ model: targetModel, messages: [{ role: 'system', content: safePrompt }, { role: 'user', content: promptFinal }], temperature: 0.2, max_tokens: 8000 }),
    });

    if (!llmRes.ok) { const errText = await llmRes.text().catch(() => ''); res.status(llmRes.status).json({ error: \`Falha no provedor: \${errText}\` }); return; }

    const llmData = await llmRes.json();
    let rawContent = llmData.choices?.[0]?.message?.content || '';
    if (rawContent.includes('\`\`\`json')) rawContent = rawContent.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    
    let parsed;
    try { parsed = JSON.parse(rawContent.trim()); } catch(e) {
      parsed = { overview: "Relatório CAROL", techStack: [], architectureBreakdown: { pattern: "Ver relatório", dataFlow: "Ver relatório", modules: [] }, stepByStepLogic: [], masterPrompt: rawContent, visualDifferentiationTips: "" };
    }
    res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro interno: ' + error.message });
  }
});

`;

const insertIndex = content.indexOf("const isProd =");
if (insertIndex !== -1) {
    content = content.substring(0, insertIndex) + cleanRoute + content.substring(insertIndex);
} else {
    content = content.replace("async function startServer()", cleanRoute + "\nasync function startServer()");
}

fs.writeFileSync('server.ts', content);
console.log('✅ Rota corrigida e injetada no local correto.');
