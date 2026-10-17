const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const start = code.indexOf('function handleOpenArchitecture() {');
const end = code.indexOf('  // Load saved token', start);

if (start !== -1 && end !== -1) {
    const newFunc = `async function handleOpenArchitecture() {
    if (!rawFile) {
      alert('Por favor, anexe um arquivo APK ou ZIP primeiro.');
      return;
    }
    
    setIsArchitectModalOpen(true);
    setIsLoadingArchitecture(true);
    
    // Pega configurações salvas no navegador
    const provider = localStorage.getItem('ai_provider') || 'nvidia';
    const apiKey = localStorage.getItem('ai_api_key') || '';
    const baseUrl = localStorage.getItem('ai_base_url') || '';
    const model = localStorage.getItem('ai_model') || '';

    try {
      const result = await analyzeProjectArchitecture(
        rawFile.name, // nome do projeto
        rawFile,      // arquivo físico
        provider,
        apiKey,
        baseUrl,
        model
      );
      setArchitectAnalysis(result);
    } catch (err: any) {
      alert(\`Falha ao desconstruir arquitetura: \${err.message}\`);
    } finally {
      setIsLoadingArchitecture(false);
    }
  }

`;
    code = code.substring(0, start) + newFunc + code.substring(end);
    fs.writeFileSync('src/App.tsx', code);
    console.log('✅ Função handleOpenArchitecture corrigida.');
} else {
    console.log('❌ Não foi possível localizar os limites da função.');
}
