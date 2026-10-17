import os
import subprocess
import re

def check_file(path):
    print(f"🔍 Analisando {path}...")
    if not os.path.exists(path):
        print(f"❌ ERRO: Arquivo {path} NÃO EXISTE!")
        return False
    return True

def run_cmd(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, text=True).strip()
    except subprocess.CalledProcessError as e:
        return e.output.strip()

print("="*50)
print("🤖 AGENTE DE DIAGNÓSTICO CAROL")
print("="*50)

# 1. Checar Backend
if check_file("server.ts"):
    with open("server.ts", "r") as f:
        server_code = f.read()
        if "upload.single('file')" in server_code:
            print("✅ server.ts: Rota com Multer (upload) encontrada.")
        else:
            print("❌ server.ts: Rota NÃO tem upload.single('file').")
        
        if "analisarPacoteReal" in server_code:
            print("✅ server.ts: Importação do analisador encontrada.")
        else:
            print("❌ server.ts: Não importa analisarPacoteReal.")
            
        if "safePrompt" in server_code:
            print("✅ server.ts: Variável safePrompt encontrada.")
        else:
            print("❌ server.ts: Variável safePrompt NÃO encontrada.")

# 2. Checar Frontend (Service)
if check_file("src/services/architectureService.ts"):
    with open("src/services/architectureService.ts", "r") as f:
        service_code = f.read()
        if "FormData" in service_code:
            print("✅ architectureService.ts: Usa FormData.")
        else:
            print("❌ architectureService.ts: Ainda envia JSON (NÃO usa FormData).")

# 3. Checar App.tsx (Envio do File)
if check_file("src/App.tsx"):
    with open("src/App.tsx", "r") as f:
        app_code = f.read()
        if "file={targetAnalysisZip}" in app_code:
            print("✅ App.tsx: Propriedade 'file' enviada para o modal.")
        else:
            print("❌ App.tsx: Propriedade 'file' NÃO está sendo enviada.")

# 4. Checar Log de Erro do Backend
print("\n" + "="*50)
print("📋 ÚLTIMO ERRO NO BACKEND.LOG")
print("="*50)
log_output = run_cmd("tail -n 15 ~/backend.log")
print(log_output)

print("\n" + "="*50)
print("🛠️ TESTE DIRETO NA API (CURL)")
print("="*50)
# Cria um arquivo fake de teste
with open("teste.txt", "w") as f: f.write("teste de arquivo")
cmd = "curl -s -X POST http://127.0.0.1:3000/api/analyze-architecture -F 'file=@teste.txt' -F 'projectName=Teste' -H 'x-ai-provider: nvidia'"
response = run_cmd(cmd)
print("Resposta do servidor:")
print(response)
os.remove("teste.txt")
