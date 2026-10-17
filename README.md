# ⚡ ZipToGit & Clean-Room Reverse Engineering Architect

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Security Hardened](https://img.shields.io/badge/Security-ZipSlip%20%26%20ZipBomb%20Defended-22C55E?logo=security)](https://owasp.org/)
[![Mobile Responsive](https://img.shields.io/badge/Mobile-320px--4K%20Compliant-purple)](https://developer.mozilla.org/)

Plataforma full-stack de alto desempenho para **publicação instantânea no GitHub** e **desconstrução limpa de arquitetura (Clean-Room Reverse Engineering)**. Analisa pacotes compilados (`.apk`), arquivos compactados (`.zip`, `.tar.gz`, `.tgz`, `.rar`, `.7z`), executáveis (`.exe`, `.elf`, `.so`, `.dex`) e sintetiza o **Prompt Mestre** e a especificação técnica para reconstrução do zero com 100% de originalidade, sem plagiar código, design ou marcas de terceiros.

---

## 🏛️ Visão Geral da Arquitetura

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                           CLIENTE (Vite + React SPA)                        │
 │  ┌───────────────────┐  ┌───────────────────────┐  ┌─────────────────────┐  │
 │  │ Universal Uploader│  │ Magic Byte Inspector  │  │ Local Tree Shaking  │  │
 │  │ (Drag & Drop)     │  │ (PKZip, GZ, RAR, PE)  │  │ (node_modules, etc) │  │
 │  └─────────┬─────────┘  └───────────┬───────────┘  └──────────┬──────────┘  │
 └────────────┼────────────────────────┼─────────────────────────┼─────────────┘
              ▼                        ▼                         ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         BACKEND SERVICE (Express Node.js)                   │
 │                                                                             │
 │  ┌───────────────────────────────────────────────────────────────────────┐  │
 │  │  🛡️ Camada de Segurança                                                │  │
 │  │  • Zip Slip Defesa: Sanitização estrita de path traversal (../ e abs) │  │
 │  │  • Zip Bomb Defesa: Cota rígida de 500 MB descompactados              │  │
 │  │  • Isolamento: Sandbox em fs.mkdtempSync(os.tmpdir())                 │  │
 │  │  • Recursão Aninhada: Descompactação controlada até nível 3           │  │
 │  └───────────────────────────────────┬───────────────────────────────────┘  │
 │                                      ▼                                      │
 │  ┌───────────────────────────────────────────────────────────────────────┐  │
 │  │  🧠 Universal AI Provider Hub (OpenAI-Compatible Dispatcher)          │  │
 │  │                                                                       │  │
 │  │  [NVIDIA NIM Free Tier] ──► integrate.api.nvidia.com (Llama 3.3 70B)   │  │
 │  │  [DeepSeek Official]   ──► api.deepseek.com (deepseek-chat / R1)      │  │
 │  │  [OpenAI API]          ──► api.openai.com (gpt-4o / gpt-4o-mini)      │  │
 │  │  [Meta Llama / Groq]   ──► api.groq.com (llama-3.3-70b-versatile)     │  │
 │  │  [Ollama Local / Free] ──► localhost:11434/v1 (100% Offline, sem key) │  │
 │  │  [Custom Endpoint]     ──► Base URL personalizada + modelo custom     │  │
 │  └───────────────────────────────────┬───────────────────────────────────┘  │
 └──────────────────────────────────────┼──────────────────────────────────────┘
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                       SAÍDAS E INTEGRAÇÕES EXTERNAS                         │
 │  ┌───────────────────────────────────┐  ┌────────────────────────────────┐  │
 │  │  GitHub REST & Git Database API   │  │  Clean-Room Specification &    │  │
 │  │  (Blobs, Trees, Commits, Refs)    │  │  Master Prompt Copiável (.md)  │  │
 │  └───────────────────────────────────┘  └────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Hub Universal de Motores de IA (Multi-Provider)

A plataforma integra nativamente qualquer provedor compatível com a especificação **OpenAI Chat Completions API**, suportando tanto computação em nuvem gratuita quanto inferência local offline:

| Provedor | Endpoint Base | Modelo Recomendado | Custo / Obtenção |
| :--- | :--- | :--- | :--- |
| **NVIDIA NIM** | `https://integrate.api.nvidia.com/v1` | `meta/llama-3.3-70b-instruct` | **Free Tier Oficial** via [build.nvidia.com](https://build.nvidia.com) |
| **DeepSeek** | `https://api.deepseek.com/v1` | `deepseek-chat` / `deepseek-reasoner` | [platform.deepseek.com](https://platform.deepseek.com) |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o-mini` / `gpt-4o` | [platform.openai.com](https://platform.openai.com) |
| **Meta Llama (Groq)** | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | [console.groq.com](https://console.groq.com) |
| **Ollama (Local)** | `http://localhost:11434/v1` | `llama3.3`, `deepseek-r1`, `mistral` | **100% Grátis & Offline**, não requer chave |
| **Personalizado** | `http://...` ou `https://...` | Qualquer modelo instruído | vLLM, LM Studio, TGI, OpenRouter |

### 🔑 Como Obter a Chave Gratuita da NVIDIA (Free Tier):
1. Acesse o catálogo da NVIDIA: [https://build.nvidia.com](https://build.nvidia.com).
2. Entre com sua conta gratuita de desenvolvedor.
3. Selecione o modelo `meta/llama-3.3-70b-instruct` ou `deepseek-ai/deepseek-r1`.
4. Clique em **"Get API Key"** e copie sua chave `nvapi-...`.
5. Cole na interface do app (fica salva no seu `localStorage`) ou defina no arquivo `.env`.

### 🦙 Como Usar com Ollama Local (Sem Chave):
1. Instale o Ollama via [ollama.com](https://ollama.com).
2. Baixe o modelo: `ollama run llama3.3` ou `ollama run deepseek-r1`.
3. No painel de IA do app, selecione **Ollama (Local)**.
4. O sistema se comunica diretamente com `http://localhost:11434/v1` com zero custo de tokens e total privacidade.

---

## 📦 Formatos Suportados & Inspeção Real por Magic Bytes

O sistema não confia em extensões declaradas pelo usuário; cada arquivo é validado pelos seus bytes mágicos iniciais:

| Formato | Extensões | Assinatura (Magic Bytes) | Tipo de Processamento |
| :--- | :--- | :--- | :--- |
| **ZIP / APK** | `.zip`, `.apk` | `50 4B 03 04` | Descompactação, parser de árvore e extração de DEX/Manifest |
| **GZIP / Tarball** | `.tar.gz`, `.tgz` | `1F 8B` | Descompressão GZIP e leitura tarball |
| **RAR Archive** | `.rar` | `52 61 72 21` | Detecção de contêiner RAR e extração de metadados |
| **7-Zip** | `.7z` | `37 7A BC AF 27 1C` | Contêiner LZMA de alta compressão |
| **Binário ELF** | `.so`, `.bin` | `7F 45 4C 46` | Bibliotecas nativas C/C++, análise de arquitetura x86/ARM |
| **Executável Windows** | `.exe`, `.dll` | `4D 5A` (MZ header) | Identificação de binário PE32/PE64 e strings operacionais |
| **Android DEX** | `.dex` | `64 65 78 0A` | Dalvik Executable (classes compiladas Android) |

---

## 🛡️ Protocolo de Segurança e Defesa em Profundidade

1. **Defesa contra Zip Slip (Path Traversal - CWE-22):**
   - Rejeição imediata de arquivos com componentes `..`.
   - Rejeição de caminhos absolutos (`/`, `\`, `C:\`).
   - Normalização e validação de que o caminho de destino resolvido esteja estritamente dentro da sandbox temporária (`resolvedPath.startsWith(tempDir)`).
2. **Defesa contra Zip Bomb (DoS de Descompressão - CWE-409):**
   - Contabilizador acumulativo de bytes descompactados.
   - Interrupção do pipeline caso o tamanho total exceda **500 MB** (limite configurável).
3. **Recursão de ZIPs Aninhados:**
   - Suporte a contêineres aninhados com profundidade máxima fixada em **3 níveis** para contenção de recursão infinita.
4. **Isolamento de Diretório Temporário:**
   - Cada operação cria uma sandbox randômica via `fs.mkdtempSync(path.join(os.tmpdir(), 'ziptogit-'))`, destruída com `fs.rmSync(tempDir, { recursive: true, force: true })` no bloco `finally`.
5. **Isolamento de Chaves:**
   - Chaves de API inseridas na UI nunca são gravadas no servidor e nunca são expostas em logs de erro ou respostas HTTP.

---

## 📱 Contrato de Responsividade Mobile

A aplicação foi rigorosamente testada e auditada nas larguras mais comuns do mercado:
- **320px** (iPhone SE 1st Gen, telas ultra-compactas)
- **375px** (iPhone SE 2nd/3rd Gen, iPhone X/11/12 mini)
- **414px** (iPhone Plus / Pro Max, Android médio)
- **768px** (iPads, Tablets portrait)
- **1024px+** (Desktops, Telas Ultrawide e 4K)

### Critérios de Conformidade Atendidos:
- `*, *::before, *::after { box-sizing: border-box; }` global.
- `html, body { max-width: 100%; overflow-x: hidden; }`
- Substituição total de larguras fixas por `max-w-full`, `w-full` e `clamp()`.
- Botões e barras de ações empilham responsivamente (`flex-col sm:flex-row`).
- Verificação técnica: `document.documentElement.scrollWidth === document.documentElement.clientWidth` retorna **true** em todos os breakpoints.

---

## 🛠️ Endpoints da API REST

### 1. `POST /api/analyze-architecture`
Desconstrói a arquitetura técnica e sintetiza o Prompt Mestre de recriação do zero.
- **Headers Opcionais:**
  - `x-ai-provider`: `nvidia` | `deepseek` | `openai` | `groq` | `ollama` | `custom`
  - `x-ai-api-key`: Chave da API do provedor escolhido
  - `x-ai-base-url`: URL base customizada (ex: `http://localhost:11434/v1`)
  - `x-ai-model`: Nome do modelo (ex: `llama3.3`, `gpt-4o-mini`, `deepseek-chat`)
- **Body:**
  ```json
  {
    "projectName": "meu-app.apk",
    "projectType": "Android APK",
    "fileTree": ["AndroidManifest.xml", "classes.dex", "..."],
    "keyFiles": { "AndroidManifest.xml": "..." },
    "apkAnalysis": { "dexFiles": ["classes.dex"], "nativeLibs": [] }
  }
  ```
- **Retorno:** JSON com `overview`, `techStack`, `architectureBreakdown`, `stepByStepLogic`, `masterPrompt` e `visualDifferentiationTips`.

### 2. `POST /api/validate-package`
Validação de pacotes de arquivo com proteção Zip Slip e Zip Bomb em ambiente temporário isolado.

---

## 🚀 Como Executar

### Pré-requisitos:
- Node.js 18+ ou 20+
- npm ou pnpm

### Instalação & Execução:
```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/ziptogit.git
cd ziptogit

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente (opcional, todas têm suporte via UI)
cp .env.example .env

# 4. Iniciar em desenvolvimento full-stack
npm run dev

# 5. Build de produção
npm run build
npm start
```

Acesse em: `http://localhost:3000`

---

## 📄 Metodologia Clean-Room Reverse Engineering

A engenharia reversa em "sala limpa" separa a especificação funcional da implementação do código:
1. **Fase de Análise:** O aplicativo decompõe o binário ou arquivo compactado para mapear dependências, rotas, contratos de dados e arquitetura necessária.
2. **Fase de Purificação:** Nenhum trecho de código legado, imagem proprietária, logotipo ou marca registrada é copiado ou reutilizado.
3. **Fase de Geração:** Um **Prompt Mestre** é sintetizado para que o desenvolvedor instrua sua IA favorita a reescrever o sistema com design autoral, boas práticas modernas e código 100% autêntico.

---

## 📜 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais informações.
