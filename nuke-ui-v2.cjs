const fs = require('fs');
let modal = fs.readFileSync('src/components/CleanRoomArchitectModal.tsx', 'utf8');

// Remove o bloco de configuração do estado (showKeyConfig, apiKey, etc.)
// Esconde o botão que abre o painel
modal = modal.replace(/<button[^>]*onClick=\{\(\) => setShowKeyConfig[^>]*>[\s\S]*?<\/button>/g, '');

// Se ainda houver um formulário aberto, vamos apagá-lo (do {showKeyConfig && ...} até o final do form)
const formStart = modal.indexOf('{showKeyConfig && (');
if (formStart !== -1) {
    const formEnd = modal.indexOf(')}', formStart);
    if (formEnd !== -1) {
        modal = modal.substring(0, formStart) + modal.substring(formEnd + 2);
    }
}

fs.writeFileSync('src/components/CleanRoomArchitectModal.tsx', modal);
console.log('✅ Painel de API destruído da interface.');
