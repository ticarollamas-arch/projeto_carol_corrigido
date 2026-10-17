import re

# 1. Corrigir App.tsx
with open('src/App.tsx', 'r') as f:
    code = f.read()

# Garantir que o setRawFile está no handleFileSelected (ZipDropzone)
if 'setRawFile(file);' not in code:
    code = code.replace('async function handleFileSelected(file: File) {', 'async function handleFileSelected(file: File) {\n    setRawFile(file);')

# Passar a função setRawFile para o ApkExtractorSection
if 'onRawFileSelected={setRawFile}' not in code:
    code = code.replace('<ApkExtractorSection', '<ApkExtractorSection\n            onRawFileSelected={setRawFile}')

with open('src/App.tsx', 'w') as f:
    f.write(code)

# 2. Corrigir ApkExtractorSection.tsx
with open('src/components/ApkExtractorSection.tsx', 'r') as f:
    apk_code = f.read()

# Adicionar a prop no Tipo (Interface)
if 'onRawFileSelected' not in apk_code:
    apk_code = apk_code.replace(
        'onOpenArchitecture?: (metadata: ZipMetadata) => void;',
        'onOpenArchitecture?: (metadata: ZipMetadata) => void;\n  onRawFileSelected?: (file: File) => void;'
    )

# Adicionar na desestruturação de props
if 'onRawFileSelected,' not in apk_code:
    apk_code = apk_code.replace(
        '  onOpenArchitecture,\n}',
        '  onOpenArchitecture,\n  onRawFileSelected,\n}'
    )

# Avisar o App.tsx assim que o APK for lido
if 'onRawFileSelected?.(file);' not in apk_code:
    apk_code = apk_code.replace(
        'async function handleApkFile(file: File) {',
        'async function handleApkFile(file: File) {\n    if (onRawFileSelected) onRawFileSelected(file);'
    )

with open('src/components/ApkExtractorSection.tsx', 'w') as f:
    f.write(apk_code)

print('✅ Ponte conectada: O APK agora chega ao motor do App.tsx!')
