import re

# 1. Corrigir App.tsx
with open('src/App.tsx', 'r') as f:
    code = f.read()

# Adicionar estado do arquivo binário (rawFile)
if 'const [rawFile, setRawFile] = useState<File | null>(null);' not in code:
    code = code.replace(
        'const [targetAnalysisZip, setTargetAnalysisZip] = useState<ZipMetadata | null>(null);',
        'const [targetAnalysisZip, setTargetAnalysisZip] = useState<ZipMetadata | null>(null);\n  const [rawFile, setRawFile] = useState<File | null>(null);'
    )

# Salvar o arquivo binário quando o usuário soltar o APK
code = re.sub(r'setTargetAnalysisZip\(([^)]+)\);', r'setRawFile(file);\n    setTargetAnalysisZip(\1);', code)

# Passar o rawFile para o Modal
code = code.replace('file={targetAnalysisZip}', 'file={rawFile}')

# Atualizar o onRunAnalysis
code = re.sub(r'onRunAnalysis=\{\(\) => .*?\}', 'onRunAnalysis={() => rawFile && handleOpenArchitecture(rawFile)}', code)

# Atualizar a assinatura de handleOpenArchitecture para aceitar File
code = code.replace('handleOpenArchitecture(targetAnalysisZip)', 'handleOpenArchitecture(rawFile)')
code = re.sub(r'handleOpenArchitecture\s*=\s*(?:async\s*)?\([^:]+:\s*ZipMetadata', r'handleOpenArchitecture = async (file: File', code)
code = re.sub(r'function\s+handleOpenArchitecture\s*\([^:]+:\s*ZipMetadata', r'async function handleOpenArchitecture(file: File', code)

# Garantir que a chamada da API receba o file
code = code.replace('analyzeProjectArchitecture(analysisProjectName, targetAnalysisZip,', 'analyzeProjectArchitecture(analysisProjectName, file as any,')
code = code.replace('analyzeProjectArchitecture(analysisProjectName, zipMeta,', 'analyzeProjectArchitecture(analysisProjectName, file as any,')

with open('src/App.tsx', 'w') as f:
    f.write(code)

# 2. Corrigir CleanRoomArchitectModal.tsx (garantir que a prop file existe)
with open('src/components/CleanRoomArchitectModal.tsx', 'r') as f:
    modal = f.read()

if 'file: File | null;' not in modal:
    modal = modal.replace('onRunAnalysis: () => void;', 'onRunAnalysis: () => void;\n  file: File | null;')
if '  file,\n' not in modal:
    modal = modal.replace('  onRunAnalysis,\n', '  onRunAnalysis,\n  file,\n')

with open('src/components/CleanRoomArchitectModal.tsx', 'w') as f:
    f.write(modal)

print('✅ App.tsx e Modal corrigidos. O arquivo binário será enviado!')
