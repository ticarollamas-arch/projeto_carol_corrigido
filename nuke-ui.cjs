const fs = require('fs');
let modal = fs.readFileSync('src/components/CleanRoomArchitectModal.tsx', 'utf8');

// Acha o início do painel de configuração (botão que abre as chaves)
const startIdx = modal.indexOf('Universal Multi-Engine AI Provider');
// Acha onde começa o estado de carregamento (Loading state)
const endIdx = modal.indexOf('{/* Loading state */}');

if (startIdx !== -1 && endIdx !== -1) {
    // Acha a div pai que envolve o painel e corta tudo fora
    const divStart = modal.lastIndexOf('<div', startIdx);
    modal = modal.substring(0, divStart) + modal.substring(endIdx);
    fs.writeFileSync('src/components/CleanRoomArchitectModal.tsx', modal);
    console.log('✅ Painel de API arrancado da interface com sucesso!');
} else {
    console.log('❌ Não foi possível achar os marcadores no arquivo.');
}
