import os
import re
import shutil

modal_path = 'src/components/CleanRoomArchitectModal.tsx'
backup_path = 'src/components/CleanRoomArchitectModal.tsx.bak'

# 1. Restaurar do backup se existir (para garantir que o JSX está íntegro)
if os.path.exists(backup_path):
    shutil.copy(backup_path, modal_path)
    print("✅ Backup do modal restaurado.")

# 2. Ler o arquivo restaurado
with open(modal_path, 'r') as f:
    content = f.read()

# 3. Arrancar o bloco do botão e formulário de chave
# O bloco começa em "{/* Universal Multi-Engine AI Provider Configuration Toggle */}"
# e termina antes de "{/* Loading state */}"
start_marker = '{/* Universal Multi-Engine AI Provider Configuration Toggle */}'
end_marker = '{/* Loading state */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Remove desde a div que engloba o bloco até antes do Loading state
    # Vamos remover a div pai: pegamos o último '<div' antes do start_marker
    div_start = content.rfind('<div', 0, start_idx)
    content = content[:div_start] + content[end_idx:]
    print("✅ Painel de chaves removido do JSX.")
else:
    print("⚠️ Marcadores não encontrados, o painel pode já ter sido removido.")

# 4. Remover as declarações de estado não usadas (opcional, mas limpa o código)
# Não vamos remover para não quebrar imports, mas vamos deixar as variáveis lá. O React não quebra por variáveis não usadas.

with open(modal_path, 'w') as f:
    f.write(content)
print("✅ Arquivo CleanRoomArchitectModal.tsx atualizado.")
