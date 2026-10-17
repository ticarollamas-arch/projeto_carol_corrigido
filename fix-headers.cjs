const fs = require('fs');
let code = fs.readFileSync('src/services/architectureService.ts', 'utf8');

// Remove a palavra 'headers,' que sobrou dentro do fetch
code = code.replace(/headers,\s*body: formData,/g, 'body: formData,');
// Prevenção extra caso esteja em outra linha
code = code.replace(/headers:\s*\{\},/g, '');

fs.writeFileSync('src/services/architectureService.ts', code);
console.log('✅ Correção aplicada no fetch do architectureService.ts');
