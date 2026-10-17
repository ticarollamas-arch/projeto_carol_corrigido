const fs = require('fs');

// 1. REESCREVER O BACKEND-ANALYZER.TS (Mais leve para Termux)
const analyzerCode = `import AdmZip from 'adm-zip';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export function analisarPacoteReal(filePath: string) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carol-'));
    let resultado = { manifest: '', codigo: '', erro: null as string | null };

    try {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.zip') {
            const zip = new AdmZip(filePath);
            zip.extractAllTo(tempDir, true);
            resultado.codigo += 'Arquivos no ZIP: ' + fs.readdirSync(tempDir).join(', ') + '\\n';
        } else if (ext === '.apk') {
            try {
                execSync(\`apktool d -f -s -o "\${tempDir}/apktool" "\${filePath}"\`, { stdio: 'pipe', timeout: 45000 });
                const manifestPath = path.join(tempDir, 'apktool', 'AndroidManifest.xml');
                if (fs.existsSync(manifestPath)) resultado.manifest = fs.readFileSync(manifestPath, 'utf8');
            } catch (e: any) { resultado.codigo += '[Apktool falhou/timeout]\\n'; }

            try {
                // JADX super leve: sem recursos, 256MB de RAM máxima, apenas 15 arquivos Java
                execSync(\`jadx --no-res -Xmx256m -d "\${tempDir}/jadx" "\${filePath}"\`, { stdio: 'pipe', timeout: 60000 });
                const files = execSync(\`find "\${tempDir}/jadx" -name "*.java" | head -15\`).toString().trim().split('\\n');
                for (const f of files) {
                    if (f && fs.existsSync(f) && fs.statSync(f).isFile()) {
                        resultado.codigo += fs.readFileSync(f, 'utf8') + '\\n';
                    }
                }
            } catch (e: any) { resultado.codigo += '[JADX falhou/timeout]\\n'; }
        }
    } catch (err: any) {
        resultado.erro = err.message;
    } finally {
        try { execSync(\`rm -rf "\${tempDir}"\`); } catch (e) {}
    }
    return resultado;
}`;
fs.writeFileSync('backend-analyzer.ts', analyzerCode);


// 2. ARRUMAR O SERVER.TS (Garantir que sempre responde JSON)
let server = fs.readFileSync('server.ts', 'utf8');
const start = server.indexOf("app.post('/api/analyze-architecture'");
const end = server.indexOf("const isProd =", start);
if (start !== -1 && end !== -1) {
    const novaRota = \`app.post('/api/analyze-architecture', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'Arquivo não chegou ao servidor.' }); return; }
    const provider = (req.headers['x-ai-provider'] as string) || 'nvidia';
    const userApiKey = ((req.headers['x-ai-api-key'] as string) || '').trim() || process.env.NVIDIA_API_KEY || '';

    const dadosReais = analisarPacoteReal(req.file.path);
    fs.unlinkSync(req.file.path); // Deleta o upload temporário

    if (dadosReais.erro) { res.status(500).json({ error: 'Falha na extração: ' + dadosReais.erro }); return; }

    const promptFinal = \`Analise os dados reais do app:\\n\\n=== MANIFESTO ===\\n\${dadosReais.manifest.slice(0, 15000)}\\n\\n=== CÓDIGO ===\\n\${dadosReais.codigo.slice(0, 60000)}\`;
    let targetBaseUrl = provider === 'openai' ? 'https://api.openai.com/v1' : provider === 'deepseek' ? 'https://api.deepseek.com/v1' : 'https://integrate.api.nvidia.com/v1';
    let targetModel = provider === 'openai' ? 'gpt-4o-mini' : provider === 'deepseek' ? 'deepseek-chat' : 'meta/llama-3.3-70b-instruct';

    if (!userApiKey && provider !== 'ollama') { res.status(401).json({ error: 'Chave de API ausente no painel.' }); return; }

    const llmRes = await fetch(\`\${targetBaseUrl.replace(/\\/+$/, '')}/chat/completions\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${userApiKey}\` },
      body: JSON.stringify({ model: targetModel, messages: [{ role: 'system', content: safePrompt }, { role: 'user', content: promptFinal }], temperature: 0.2, max_tokens: 8000 }),
    });

    if (!llmRes.ok) { const err = await llmRes.text().catch(()=> ''); res.status(llmRes.status).json({ error: \`Erro IA: \${err}\` }); return; }

    const llmData = await llmRes.json();
    let raw = llmData.choices?.[0]?.message?.content || '';
    if (raw.includes('\\\`\\\`\\\`json')) raw = raw.replace(/\\\`\\\`\\\`json/g, '').replace(/\\\`\\\`\\\`/g, '');
    
    let parsed;
    try { parsed = JSON.parse(raw.trim()); } catch(e) {
      parsed = { overview: "Relatório CAROL", techStack: [], architectureBreakdown: { pattern: "Ver relatório", dataFlow: "Ver relatório", modules: [] }, stepByStepLogic: [], masterPrompt: raw, visualDifferentiationTips: "" };
    }
    res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro no servidor: ' + error.message });
  }
});
\`;
    server = server.substring(0, start) + novaRota + server.substring(end);
    fs.writeFileSync('server.ts', server);
}

// 3. GARANTIR QUE O APP.TSX ENVIA O ARQUIVO
let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('file={targetAnalysisZip}')) {
    app = app.replace('onRunAnalysis={() => targetAnalysisZip && handleOpenArchitecture(targetAnalysisZip)}', 'file={targetAnalysisZip}\n        onRunAnalysis={() => targetAnalysisZip && handleOpenArchitecture(targetAnalysisZip)}');
    fs.writeFileSync('src/App.tsx', app);
}

console.log('✅ Sistema corrigido e otimizado para não estourar a memória.');
