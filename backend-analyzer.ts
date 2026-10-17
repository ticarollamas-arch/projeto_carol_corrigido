import AdmZip from 'adm-zip';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const MAX_ENTRIES = 12000;
const MAX_TEXT_PER_FILE = 12000;
const MAX_TOTAL_TEXT = 60000;
const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.txt', '.xml',
  '.yml', '.yaml', '.toml', '.properties', '.gradle', '.kt', '.java', '.smali',
  '.html', '.css', '.scss', '.py', '.go', '.rs', '.php', '.rb', '.sh', '.sql',
  '.env.example', '.config', '.ini', '.cfg', '.proto', '.graphql', '.gql',
]);

export interface PackageAnalysis {
  manifest: string;
  codigo: string;
  erro: string | null;
}

function safeEntryName(name: string): string | null {
  const normalized = name.replace(/\\/g, '/');
  if (!normalized || normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) return null;
  const parts = normalized.split('/');
  if (parts.some((part) => part === '..' || part.includes('\0'))) return null;
  return normalized.replace(/^\.\//, '');
}

function isTextCandidate(name: string): boolean {
  const base = path.posix.basename(name).toLowerCase();
  const ext = path.posix.extname(base);
  return TEXT_EXTENSIONS.has(ext) || ['dockerfile', 'makefile', 'procfile', '.gitignore', '.env.example'].includes(base);
}

function readZipEvidence(filePath: string): PackageAnalysis {
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();
  if (!entries.length) return { manifest: '', codigo: '', erro: 'O arquivo ZIP está vazio ou não contém entradas legíveis.' };
  if (entries.length > MAX_ENTRIES) return { manifest: '', codigo: '', erro: `Pacote contém ${entries.length} entradas; limite de análise: ${MAX_ENTRIES}.` };

  const tree: string[] = [];
  const snippets: string[] = [];
  let totalText = 0;
  let manifest = '';
  let accepted = 0;

  for (const entry of entries) {
    const safeName = safeEntryName(entry.entryName);
    if (!safeName) {
      tree.push(`[IGNORADO: caminho inseguro] ${entry.entryName.slice(0, 200)}`);
      continue;
    }
    tree.push(`${entry.isDirectory ? '[DIR] ' : '[FILE] '}${safeName}`);
    if (entry.isDirectory || !isTextCandidate(safeName)) continue;
    if (totalText >= MAX_TOTAL_TEXT || accepted >= 40) break;
    try {
      const data = entry.getData();
      if (data.length > MAX_TEXT_PER_FILE * 4) continue;
      // Text candidates with binary bytes are skipped rather than misrepresented as source.
      const text = data.toString('utf8');
      if (text.includes('\u0000')) continue;
      const snippet = text.slice(0, Math.min(MAX_TEXT_PER_FILE, MAX_TOTAL_TEXT - totalText));
      if (!snippet.trim()) continue;
      if (/AndroidManifest\.xml$/i.test(safeName)) manifest = snippet;
      snippets.push(`\n===== ARQUIVO: ${safeName} =====\n${snippet}`);
      totalText += snippet.length;
      accepted++;
    } catch {
      // A single unreadable entry must not abort analysis of the whole package.
    }
  }

  return {
    manifest,
    codigo: `ESTRUTURA DO PACOTE (${tree.length} entradas):\n${tree.slice(0, MAX_ENTRIES).join('\n')}\n\nCONTEÚDO TEXTUAL SELECIONADO (${accepted} arquivos; limite aplicado):\n${snippets.join('\n')}`,
    erro: null,
  };
}

export function analisarPacoteReal(filePath: string): PackageAnalysis {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carol-analysis-'));
  const resultado: PackageAnalysis = { manifest: '', codigo: '', erro: null };
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      resultado.erro = 'O arquivo enviado não foi encontrado no armazenamento temporário.';
      return resultado;
    }
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.zip') return readZipEvidence(filePath);

    if (ext === '.apk' || ext === '.xapk') {
      // Preserve actual APK contents as evidence even when Android tooling is not installed.
      const zipEvidence = readZipEvidence(filePath);
      if (zipEvidence.erro) return zipEvidence;
      resultado.manifest = zipEvidence.manifest;
      resultado.codigo = zipEvidence.codigo;
      const jadxDir = path.join(tempDir, 'jadx');
      try {
        execFileSync('jadx', ['-Xmx512m', '-d', jadxDir, filePath], { stdio: 'pipe', timeout: 120000, maxBuffer: 4 * 1024 * 1024 });
        const collect = (dir: string, output: string[], remaining: { chars: number }) => {
          if (remaining.chars <= 0 || output.length >= 80) return;
          let children: fs.Dirent[];
          try { children = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
          for (const child of children) {
            if (remaining.chars <= 0 || output.length >= 80) break;
            const full = path.join(dir, child.name);
            if (child.isDirectory()) collect(full, output, remaining);
            else if (child.isFile() && /\.(java|kt|xml|json|smali)$/i.test(child.name)) {
              try {
                const content = fs.readFileSync(full, 'utf8').slice(0, Math.min(8000, remaining.chars));
                if (content.trim()) {
                  output.push(`\n===== DESCOMPILADO: ${path.relative(jadxDir, full)} =====\n${content}`);
                  remaining.chars -= content.length;
                }
              } catch { /* skip unreadable file */ }
            }
          }
        };
        const decompiled: string[] = [];
        collect(jadxDir, decompiled, { chars: 60000 });
        if (decompiled.length) resultado.codigo += `\n\nCÓDIGO RECUPERADO PELO JADX:\n${decompiled.join('\n')}`;
        else resultado.codigo += '\n\n[INFO] JADX foi executado, mas não encontrou código textual legível nos limites definidos.';
      } catch (err: any) {
        resultado.codigo += `\n\n[AVISO] JADX não conseguiu descompilar este APK (${err?.message || 'erro desconhecido'}). A análise abaixo se limita à estrutura e aos arquivos textuais extraídos. Instale/configure JADX no servidor para descompilação completa.`;
      }
      try {
        const apktoolDir = path.join(tempDir, 'apktool');
        execFileSync('apktool', ['d', '-f', '-s', '-o', apktoolDir, filePath], { stdio: 'pipe', timeout: 60000, maxBuffer: 2 * 1024 * 1024 });
        const manifestPath = path.join(apktoolDir, 'AndroidManifest.xml');
        if (fs.existsSync(manifestPath)) resultado.manifest = fs.readFileSync(manifestPath, 'utf8').slice(0, 15000);
      } catch {
        // JADX/ZIP evidence is still useful if apktool is not installed.
      }
      return resultado;
    }

    if (ext === '.tar' || ext === '.gz' || ext === '.tgz' || ext === '.rar' || ext === '.7z') {
      resultado.erro = `O formato ${ext || 'desconhecido'} foi reconhecido pela interface, mas o backend ainda não possui um extrator seguro configurado para ele. Envie um ZIP ou APK, ou instale e integre um extrator apropriado.`;
      return resultado;
    }

    resultado.erro = `Formato não suportado pelo analisador de backend: ${ext || 'sem extensão'}. Envie um arquivo ZIP ou APK.`;
    return resultado;
  } catch (err: any) {
    resultado.erro = err?.message || 'Falha desconhecida ao ler o pacote.';
    return resultado;
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* best effort cleanup */ }
  }
}
