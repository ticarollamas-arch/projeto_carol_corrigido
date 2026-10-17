const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Dentro de handleFileSelected, salvar o File bruto no estado
if (!code.includes('setRawFile(file);')) {
    code = code.replace(
        'async function handleFileSelected(file: File) {',
        'async function handleFileSelected(file: File) {\n    setRawFile(file);'
    );
}

// 2. Simplificar handleOpenArchitecture para apenas abrir o modal
// Remove a necessidade de receber parâmetro File
code = code.replace(
    'async function handleOpenArchitecture(file: File) {',
    'function handleOpenArchitecture() {'
);
// Remove a linha setRawFile(file) dentro dessa função (já foi salvo no handleFileSelected)
code = code.replace(
    '    setRawFile(file);\n',
    ''
);

// 3. Ajustar as chamadas que passam argumentos
// O botão do ZipDropzone e do ApkExtractor
code = code.replace(/handleOpenArchitecture\(currentZip\)/g, 'handleOpenArchitecture()');
code = code.replace(/handleOpenArchitecture\(apkMeta\)/g, 'handleOpenArchitecture()');
code = code.replace(/handleOpenArchitecture\(rawFile\)/g, 'handleOpenArchitecture()');

// 4. Ajustar as props que passam o argumento
code = code.replace(/onOpenArchitecture=\{\(\) => currentZip && handleOpenArchitecture\(\)\}/g, 'onOpenArchitecture={handleOpenArchitecture}');
code = code.replace(/onOpenArchitecture=\{\(apkMeta\) => handleOpenArchitecture\(\)\}/g, 'onOpenArchitecture={handleOpenArchitecture}');

// 5. O onRunAnalysis do modal deve apenas chamar handleOpenArchitecture()
code = code.replace(/onRunAnalysis=\{\(\) => rawFile && handleOpenArchitecture\(\)\}/g, 'onRunAnalysis={handleOpenArchitecture}');

// 6. Garantir que o botão "Desconstruir" no App.tsx (linha 378) chame sem argumentos
code = code.replace(/onClick=\{\(\) => currentZip && handleOpenArchitecture\(\)\}/g, 'onClick={handleOpenArchitecture}');

fs.writeFileSync('src/App.tsx', code);
console.log('✅ App.tsx ajustado: rawFile é salvo no upload e botão destravado.');
