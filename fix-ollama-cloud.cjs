const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// Garante que o provedor seja 'ollama'
server = server.replace(/const provider = 'nvidia';/g, "const provider = 'ollama';");

// Define a URL base e o modelo a partir das variáveis de ambiente
server = server.replace(/let targetBaseUrl = '';/g, "let targetBaseUrl = process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1';");
server = server.replace(/let targetModel = '';/g, "let targetModel = process.env.OLLAMA_MODEL || 'gemma4:31b';");
server = server.replace(/let targetApiKey = userApiKey \|\| process\.env\.NVIDIA_API_KEY \|\| process\.env\.OPENAI_API_KEY \|\| process\.env\.DEEPSEEK_API_KEY \|\| '';/g, "let targetApiKey = process.env.OLLAMA_API_KEY || '';");

// Remove os blocos condicionais de outros provedores para evitar conflito
server = server.replace(/if \(provider === 'openai'\) \{[\s\S]*?\} else if \(provider === 'deepseek'\) \{[\s\S]*?\} else if \(provider === 'ollama'\) \{[\s\S]*?\} else \{[\s\S]*?\}/g, '');

fs.writeFileSync('server.ts', server);
console.log('✅ Servidor configurado para Ollama Cloud.');
