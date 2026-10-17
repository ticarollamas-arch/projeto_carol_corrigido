const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Remover importações duplicadas e garantir as certas
content = content.replace(/import fs from 'fs';/g, '');
content = content.replace(/const safePrompt = .*;/g, '');
const topImports = `import fs from 'fs';\nimport multer from 'multer';\nconst { analisarPacoteReal } = require('./backend-analyzer.cjs');\nconst safePrompt = fs.readFileSync('./src/prompts/carol-master.md', 'utf8');\n`;
content = content.replace("import express from 'express';", `import express from 'express';\n${topImports}`);

// 2. Injetar o multer para upload
content = content.replace("const app = express();", "const app = express();\nconst upload = multer({ dest: 'tmp/' });");

// 3. Achar a rota atual e substituir inteira
const routeStart = content.indexOf("app.post('/api/analyze-architecture'");
const nextApp = content.indexOf("app.get('*'", routeStart); 
const routeEnd = nextApp !== -1 ? nextApp : content.length;

const newRoute = `app.post('/api/analyze-architecture', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado para análise real.' });
      return;
    }

    const projectName = req.body.projectName || 'Projeto Desconhecido';
    const provider = (req.headers['x-ai-provider'] as string) || 'nvidia';
    const customBaseUrl = ((req.headers['x-ai-base-url'] as string) || '').trim();
    const customModel = ((req.headers['x-ai-model'] as string) || '').trim();
    const userApiKey = ((req.headers['x-ai-api-key'] as string) || '').trim();

    // 1. Extração e Descompilação Real (JADX e Apktool)
    const dadosReais = analisarPacoteReal(req.file.path);
    fs.unlinkSync(req.file.path); // Limpar temp

    if (dadosReais.erro) {
        res.status(500).json({ error: 'Erro na extração do arquivo: ' + dadosReais.erro });
        return;
    }

    // 2. Montar Prompt com DADOS REAIS
    const promptFinal = \`Analise os dados reais extraídos do aplicativo abaixo.\n\n=== MANIFESTO ===\n\${dadosReais.manifest.slice(0, 15000)}\n\n=== CÓDIGO DESCOMPILADO ===\n\${dadosReais.codigo.slice(0, 60000)}\`;

    // 3. Configurar Provedor de IA
    let targetBaseUrl = '';
    let targetModel = '';
    let targetApiKey = userApiKey || process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY || '';

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

    if (!targetApiKey && provider !== 'ollama') {
      res.status(401).json({ error: 'Chave de API ausente no painel para o provedor ' + provider });
      return;
    }

    // 4. Chamar a IA de verdade
    const completionsUrl = \`\${targetBaseUrl.replace(/\\/+$/, '')}/chat/completions\`;
    const llmRes = await fetch(completionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${targetApiKey}\`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: safePrompt },
          { role: 'user', content: promptFinal }
        ],
        temperature: 0.2,
        max_tokens: 8000,
      }),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text().catch(() => '');
      res.status(llmRes.status).json({ error: \`Falha no provedor \${provider}: \${errText}\` });
      return;
    }

    const llmData = await llmRes.json();
    let rawContent = llmData.choices?.[0]?.message?.content || '';
    
    // Limpeza do Markdown
    if (rawContent.includes('\`\`\`json')) rawContent = rawContent.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    
    // Como o CAROL exige um relatório gigante em Markdown, o modelo pode não retornar JSON estrito. 
    // Vamos tentar parsear. Se falhar, jogamos o Markdown inteiro no masterPrompt.
    let parsed;
    try {
      parsed = JSON.parse(rawContent.trim());
    } catch(e) {
      parsed = {
        overview: "Relatório real gerado pela CAROL baseado no código descompilado.",
        techStack: [],
        architectureBreakdown: { pattern: "Ver relatório", dataFlow: "Ver relatório", modules: [] },
        stepByStepLogic: [],
        masterPrompt: rawContent,
        visualDifferentiationTips: "Ver relatório"
      };
    }

    res.json({ success: true, analysis: parsed, source: provider });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno: ' + error.message });
  }
});

`;

content = content.substring(0, routeStart) + newRoute + content.substring(routeEnd);
fs.writeFileSync('server.ts', content);
console.log('✅ server.ts reescrito com sucesso. Rota real integrada.');
