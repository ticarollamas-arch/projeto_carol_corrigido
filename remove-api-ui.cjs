const fs = require('fs');

// 1. LIMPAR O SERVER.TS (Usar apenas .env)
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/const provider = \(req\.headers\['x-ai-provider'\] as string\) \|\| 'nvidia';/g, "const provider = 'nvidia';");
server = server.replace(/const customBaseUrl = \(\(req\.headers\['x-ai-base-url'\] as string\) \|\| ''\)\.trim\(\);/g, "const customBaseUrl = '';");
server = server.replace(/const customModel = \(\(req\.headers\['x-ai-model'\] as string\) \|\| ''\)\.trim\(\);/g, "const customModel = '';");
server = server.replace(/const userApiKey = \(\(req\.headers\['x-ai-api-key'\] as string\) \|\| ''\)\.trim\(\);/g, "const userApiKey = '';");
fs.writeFileSync('server.ts', server);

// 2. LIMPAR O SERVICE (Frontend não envia mais headers de API)
let service = fs.readFileSync('src/services/architectureService.ts', 'utf8');
service = service.replace(/provider: string,\s*apiKey: string,\s*baseUrl\?: string,\s*model\?: string/g, '');
service = service.replace(/const headers: Record<string, string> = \{\s*'x-ai-provider': provider,\s*\};/g, '');
service = service.replace(/if \(apiKey\) headers\['x-ai-api-key'\] = apiKey;/g, '');
service = service.replace(/if \(baseUrl\) headers\['x-ai-base-url'\] = baseUrl;/g, '');
service = service.replace(/if \(model\) headers\['x-ai-model'\] = model;/g, '');
service = service.replace(/headers,\n      body: formData,/g, 'body: formData,');
fs.writeFileSync('src/services/architectureService.ts', service);

// 3. LIMPAR O APP.TSX
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/const provider = localStorage\.getItem\('ai_provider'\) \|\| 'nvidia';/g, '');
app = app.replace(/const apiKey = localStorage\.getItem\('ai_api_key'\) \|\| '';/g, '');
app = app.replace(/const baseUrl = localStorage\.getItem\('ai_base_url'\) \|\| '';/g, '');
app = app.replace(/const model = localStorage\.getItem\('ai_model'\) \|\| '';/g, '');
app = app.replace(/rawFile\.name, \/\/ nome do projeto\s*rawFile,      \/\/ arquivo físico\s*provider,\s*apiKey,\s*baseUrl,\s*model/g, 'rawFile.name, rawFile');
fs.writeFileSync('src/App.tsx', app);

// 4. LIMPAR O MODAL (Ocultar o formulário de chave)
let modal = fs.readFileSync('src/components/CleanRoomArchitectModal.tsx', 'utf8');
const formStart = modal.indexOf('{/* Universal Multi-Engine AI Provider Configuration Toggle */}');
const formEnd = modal.indexOf('{/* Loading state */}');
if (formStart !== -1 && formEnd !== -1) {
    // Remove o bloco inteiro de configuração de API
    modal = modal.substring(0, formStart) + modal.substring(formEnd);
    fs.writeFileSync('src/components/CleanRoomArchitectModal.tsx', modal);
}

console.log('✅ Interface e código limpos. Chaves agora ficam ocultas no .env do servidor.');
