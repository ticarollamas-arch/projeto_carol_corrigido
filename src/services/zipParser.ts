import JSZip from 'jszip';
import { ParsedZipFile, ZipMetadata, FileFormatInfo, ApkAnalysis } from '../types';

export const MAX_UNCOMPRESSED_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB limit (Zip Bomb protection)
export const MAX_NESTED_DEPTH = 3; // Nested zip recursion depth limit

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'pdf',
  'zip', 'tar', 'gz', 'tgz', 'rar', '7z', 'mp3', 'mp4', 'mov', 'wav', 'woff',
  'woff2', 'ttf', 'eot', 'bin', 'exe', 'dll', 'so', 'dylib',
  'dex', 'arsc', 'apk', 'xapk', 'jar', 'aar', 'class', 'o', 'a',
]);

export function isBinaryFile(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return BINARY_EXTENSIONS.has(ext);
}

/**
 * Validates and sanitizes file paths to prevent Zip Slip (Path Traversal vulnerabilities).
 * Rejects absolute paths, null bytes, and traversal segments ("..").
 */
export function sanitizeArchivePath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') {
    throw new Error('Caminho de arquivo inválido no arquivo compactado.');
  }

  // Reject null bytes
  if (rawPath.includes('\0')) {
    throw new Error('Arquivo corrompido ou malicioso: caractere nulo detectado no caminho.');
  }

  // Normalize slashes
  const normalized = rawPath.replace(/\\/g, '/');

  // Reject absolute paths
  if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    throw new Error(`Violação de segurança (Zip Slip): caminho absoluto proibido: "${rawPath}"`);
  }

  // Check path segments for traversal
  const segments = normalized.split('/');
  for (const seg of segments) {
    if (seg === '..') {
      throw new Error(`Violação de segurança (Zip Slip): tentativa de path traversal detectada ("..") em: "${rawPath}"`);
    }
  }

  // Clean leading ./ and redundant slashes
  const cleaned = normalized.replace(/^\.\//, '').replace(/\/+/g, '/');
  return cleaned;
}

/**
 * Validates the true format of a file using magic bytes rather than just extension.
 */
export async function detectFileFormatByMagicBytes(file: File): Promise<FileFormatInfo> {
  const slice = file.slice(0, 512);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const matches = (offset: number, expected: number[]): boolean => {
    if (bytes.length < offset + expected.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (bytes[offset + i] !== expected[i]) return false;
    }
    return true;
  };

  const toHex = (len = 4) => {
    return Array.from(bytes.slice(0, Math.min(len, bytes.length)))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  };

  const lowerName = file.name.toLowerCase();

  // 1. PKZip magic: 50 4B 03 04 or 50 4B 05 06 (empty) or 50 4B 07 08 (spanned)
  if (matches(0, [0x50, 0x4b, 0x03, 0x04]) || matches(0, [0x50, 0x4b, 0x05, 0x06])) {
    const isApk = lowerName.endsWith('.apk') || lowerName.endsWith('.xapk');
    return {
      format: isApk ? 'apk' : 'zip',
      displayName: isApk ? 'Pacote Android (.apk / PKZip)' : 'Arquivo Compactado (.zip / PKZip)',
      isArchive: true,
      isExecutable: isApk,
      mimeGuess: isApk ? 'application/vnd.android.package-archive' : 'application/zip',
      magicHex: toHex(4),
    };
  }

  // 2. GZIP magic: 1F 8B
  if (matches(0, [0x1f, 0x8b])) {
    return {
      format: 'gzip',
      displayName: 'Arquivo Compactado GZIP (.tar.gz / .tgz)',
      isArchive: true,
      isExecutable: false,
      mimeGuess: 'application/gzip',
      magicHex: toHex(2),
    };
  }

  // 3. 7-Zip magic: 37 7A BC AF 27 1C
  if (matches(0, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])) {
    return {
      format: '7z',
      displayName: 'Arquivo Compactado 7-Zip (.7z)',
      isArchive: true,
      isExecutable: false,
      mimeGuess: 'application/x-7z-compressed',
      magicHex: toHex(6),
    };
  }

  // 4. RAR magic: 52 61 72 21 (Rar!)
  if (matches(0, [0x52, 0x61, 0x72, 0x21])) {
    return {
      format: 'rar',
      displayName: 'Arquivo Compactado WinRAR (.rar)',
      isArchive: true,
      isExecutable: false,
      mimeGuess: 'application/x-rar-compressed',
      magicHex: toHex(4),
    };
  }

  // 5. Windows Portable Executable: 4D 5A ('MZ')
  if (matches(0, [0x4d, 0x5a])) {
    return {
      format: 'pe_exe',
      displayName: 'Executável Windows Portable Executable (PE / .exe / .dll)',
      isArchive: false,
      isExecutable: true,
      mimeGuess: 'application/x-msdownload',
      magicHex: toHex(2),
    };
  }

  // 6. Linux/Android ELF: 7F 45 4C 46 ('\x7fELF')
  if (matches(0, [0x7f, 0x45, 0x4c, 0x46])) {
    return {
      format: 'elf',
      displayName: 'Binário Executável / Biblioteca Compartilhada ELF (Linux/Android .so)',
      isArchive: false,
      isExecutable: true,
      mimeGuess: 'application/x-executable',
      magicHex: toHex(4),
    };
  }

  // 7. Dalvik DEX: 64 65 78 0A ('dex\n')
  if (matches(0, [0x64, 0x65, 0x78, 0x0a])) {
    return {
      format: 'dex',
      displayName: 'Bytecode Dalvik Executable Android (.dex)',
      isArchive: false,
      isExecutable: true,
      mimeGuess: 'application/octet-stream',
      magicHex: toHex(4),
    };
  }

  // 8. TAR: 'ustar' at offset 257
  if (matches(257, [0x75, 0x73, 0x74, 0x61, 0x72])) {
    return {
      format: 'tar',
      displayName: 'Arquivo Tarball Unix (.tar)',
      isArchive: true,
      isExecutable: false,
      mimeGuess: 'application/x-tar',
      magicHex: 'ustar @ 257',
    };
  }

  // Fallback by file extension
  if (lowerName.endsWith('.zip') || lowerName.endsWith('.apk') || lowerName.endsWith('.jar')) {
    return {
      format: 'zip',
      displayName: 'Arquivo Compactado (.zip / arquivo)',
      isArchive: true,
      isExecutable: false,
      mimeGuess: 'application/zip',
      magicHex: toHex(4),
    };
  }

  if (lowerName.endsWith('.exe') || lowerName.endsWith('.dll')) {
    return {
      format: 'pe_exe',
      displayName: 'Executável Windows (.exe)',
      isArchive: false,
      isExecutable: true,
      mimeGuess: 'application/x-msdownload',
      magicHex: toHex(4),
    };
  }

  return {
    format: 'unknown',
    displayName: 'Arquivo / Binário Genérico',
    isArchive: false,
    isExecutable: false,
    mimeGuess: 'application/octet-stream',
    magicHex: toHex(4),
  };
}

export function shouldIgnoreFile(
  path: string,
  options: {
    ignoreNodeModules?: boolean;
    ignoreGitFolders?: boolean;
    ignoreEnvFiles?: boolean;
    ignoreOsFiles?: boolean;
  }
): boolean {
  const normalized = path.replace(/\\/g, '/');
  const filename = normalized.split('/').pop() || '';

  // OS files
  if (options.ignoreOsFiles !== false) {
    if (
      normalized.includes('__MACOSX/') ||
      filename === '.DS_Store' ||
      filename === 'Thumbs.db' ||
      filename.startsWith('._')
    ) {
      return true;
    }
  }

  // Git internals
  if (options.ignoreGitFolders !== false) {
    if (normalized.includes('.git/') || normalized === '.git') {
      return true;
    }
  }

  // Node modules
  if (options.ignoreNodeModules !== false) {
    if (normalized.includes('node_modules/') || normalized === 'node_modules') {
      return true;
    }
  }

  // Env files
  if (options.ignoreEnvFiles !== false) {
    if (
      filename === '.env' ||
      filename === '.env.local' ||
      filename === '.env.production' ||
      filename === '.env.development'
    ) {
      return true;
    }
  }

  return false;
}

export function detectProjectType(files: ParsedZipFile[]): string {
  const paths = files.map((f) => f.path.toLowerCase());

  if (
    paths.some(
      (p) =>
        p.includes('androidmanifest.xml') ||
        p.endsWith('.dex') ||
        p.includes('classes.dex')
    )
  ) {
    return 'Android APK Package';
  }
  if (paths.some((p) => p.endsWith('.exe') || p.endsWith('.dll'))) {
    return 'Windows Executable / Binary';
  }
  if (paths.some((p) => p.endsWith('.so') || p.includes('/lib/arm'))) {
    return 'Linux/Android Native Library (ELF)';
  }
  if (paths.some((p) => p.endsWith('package.json'))) {
    if (
      paths.some(
        (p) =>
          p.includes('vite.config') ||
          p.includes('next.config') ||
          p.includes('tailwind.config')
      )
    ) {
      return 'React / Modern Web';
    }
    return 'Node.js / JavaScript';
  }
  if (
    paths.some(
      (p) =>
        p.endsWith('requirements.txt') ||
        p.endsWith('pyproject.toml') ||
        p.endsWith('setup.py')
    )
  ) {
    return 'Python';
  }
  if (paths.some((p) => p.endsWith('cargo.toml'))) {
    return 'Rust';
  }
  if (paths.some((p) => p.endsWith('go.mod'))) {
    return 'Go';
  }
  if (paths.some((p) => p.endsWith('pom.xml') || p.endsWith('build.gradle'))) {
    return 'Java / Kotlin';
  }
  if (paths.some((p) => p.endsWith('index.html'))) {
    return 'HTML / CSS / JS';
  }
  return 'Código / Repositório Geral';
}

/**
 * Universal archive and binary processor.
 * Supports ZIP, APK, nested archives (up to depth 3), single binaries (EXE, ELF),
 * and validates against Zip Slip (Path Traversal) and Zip Bombs (500MB limit).
 */
export async function parseZipFile(
  file: File,
  ignoreOptions: {
    ignoreNodeModules?: boolean;
    ignoreGitFolders?: boolean;
    ignoreEnvFiles?: boolean;
    ignoreOsFiles?: boolean;
  } = {}
): Promise<ZipMetadata> {
  // 1. Detect magic bytes
  const formatInfo = await detectFileFormatByMagicBytes(file);

  // If file is a raw binary executable or non-zip format that cannot be unpacked with PKZip
  if (
    !formatInfo.isArchive &&
    (formatInfo.format === 'pe_exe' ||
      formatInfo.format === 'elf' ||
      formatInfo.format === 'dex' ||
      formatInfo.format === 'unknown')
  ) {
    return processSingleBinaryFile(file, formatInfo);
  }

  if (formatInfo.format === 'rar' || formatInfo.format === '7z') {
    // Return structured metadata for RAR / 7z
    return processRawArchiveFile(file, formatInfo);
  }

  // 2. PKZip / APK extraction with Zip Slip and Zip Bomb protections
  const parsedFiles: ParsedZipFile[] = [];
  let totalUncompressedSize = 0;
  let hasNestedArchives = false;

  const zip = new JSZip();
  let loadedZip: JSZip;

  try {
    loadedZip = await zip.loadAsync(file);
  } catch (err: any) {
    // If JSZip fails on a file with .zip extension that was actually a raw binary
    if (formatInfo.format === 'pe_exe' || formatInfo.format === 'elf') {
      return processSingleBinaryFile(file, formatInfo);
    }
    throw new Error(
      `Falha ao descompactar arquivo: O arquivo parece estar corrompido ou em formato não suportado. (${err.message})`
    );
  }

  // Recursive extraction helper for nested archives (depth <= 3)
  async function extractZipEntries(
    zipInstance: JSZip,
    prefix = '',
    currentDepth = 1
  ): Promise<void> {
    const entries = Object.keys(zipInstance.files);

    for (const rawEntryName of entries) {
      // 1. Sanitize path against Zip Slip
      const cleanPath = sanitizeArchivePath(rawEntryName);
      const fullPath = prefix ? `${prefix}/${cleanPath}` : cleanPath;

      const entry = zipInstance.files[rawEntryName];
      const isDir = entry.dir;
      const isBinary = isBinaryFile(fullPath);
      const ignored = shouldIgnoreFile(fullPath, ignoreOptions);
      const ext = fullPath.split('.').pop()?.toLowerCase() || '';

      let content: string | Uint8Array | undefined = undefined;

      if (!isDir && !ignored) {
        if (isBinary) {
          content = await entry.async('uint8array');
          totalUncompressedSize += content.byteLength;
        } else {
          try {
            content = await entry.async('text');
            totalUncompressedSize += new Blob([content]).size;
          } catch {
            content = await entry.async('uint8array');
            totalUncompressedSize += content.byteLength;
          }
        }

        // 2. Zip Bomb protection: verify total uncompressed size limit
        if (totalUncompressedSize > MAX_UNCOMPRESSED_SIZE_BYTES) {
          throw new Error(
            `Arquivo rejeitado: tamanho total descompactado excede o limite seguro de 500 MB (Proteção contra Zip Bomb).`
          );
        }

        // 3. Nested Archive check (up to MAX_NESTED_DEPTH = 3)
        if (
          currentDepth < MAX_NESTED_DEPTH &&
          (ext === 'zip' || ext === 'jar' || ext === 'apk') &&
          content instanceof Uint8Array
        ) {
          try {
            const innerZip = new JSZip();
            const loadedInner = await innerZip.loadAsync(content);
            hasNestedArchives = true;
            const innerPrefix = fullPath.replace(/\.[^/.]+$/, '');
            await extractZipEntries(loadedInner, innerPrefix, currentDepth + 1);
          } catch {
            // If inner file is not a valid zip, keep as regular binary entry
          }
        }
      }

      parsedFiles.push({
        path: fullPath,
        name: fullPath.split('/').filter(Boolean).pop() || fullPath,
        size: isDir
          ? 0
          : content instanceof Uint8Array
          ? content.byteLength
          : content
          ? new Blob([content]).size
          : 0,
        isDirectory: isDir,
        content,
        isBinary,
        included: !ignored && !isDir,
        extension: ext,
      });
    }
  }

  await extractZipEntries(loadedZip, '', 1);

  // Normalize root paths if entire zip was enclosed in single folder
  normalizeRootPaths(parsedFiles);

  const detected = detectProjectType(parsedFiles);

  return {
    fileName: file.name,
    totalFiles: parsedFiles.filter((f) => !f.isDirectory).length,
    totalSize: totalUncompressedSize,
    compressedSize: file.size,
    detectedType: detected,
    files: parsedFiles,
    formatInfo,
    isNestedArchive: hasNestedArchives,
  };
}

/**
 * Handles standalone binary executables (Windows PE .exe, Linux/Android ELF .so, DEX)
 * without failing decompression, enabling analysis and GitHub versioning.
 */
async function processSingleBinaryFile(
  file: File,
  formatInfo: FileFormatInfo
): Promise<ZipMetadata> {
  const buffer = await file.arrayBuffer();
  const content = new Uint8Array(buffer);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const parsedFile: ParsedZipFile = {
    path: file.name,
    name: file.name,
    size: file.size,
    isDirectory: false,
    content,
    isBinary: true,
    included: true,
    extension: ext,
  };

  return {
    fileName: file.name,
    totalFiles: 1,
    totalSize: file.size,
    compressedSize: file.size,
    detectedType: formatInfo.displayName,
    files: [parsedFile],
    formatInfo,
    isNestedArchive: false,
  };
}

async function processRawArchiveFile(
  file: File,
  formatInfo: FileFormatInfo
): Promise<ZipMetadata> {
  const buffer = await file.arrayBuffer();
  const content = new Uint8Array(buffer);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const parsedFile: ParsedZipFile = {
    path: file.name,
    name: file.name,
    size: file.size,
    isDirectory: false,
    content,
    isBinary: true,
    included: true,
    extension: ext,
  };

  return {
    fileName: file.name,
    totalFiles: 1,
    totalSize: file.size,
    compressedSize: file.size,
    detectedType: formatInfo.displayName,
    files: [parsedFile],
    formatInfo,
    isNestedArchive: false,
  };
}

/**
 * Parses an Android APK file with complete analysis of Dalvik bytecode,
 * native .so libraries, manifests and assets.
 */
export async function parseApkFile(file: File): Promise<ZipMetadata> {
  const meta = await parseZipFile(file, {
    ignoreNodeModules: false,
    ignoreGitFolders: false,
    ignoreEnvFiles: false,
    ignoreOsFiles: false,
  });

  const dexFiles: string[] = [];
  const nativeLibs: string[] = [];
  let hasManifest = false;
  let hasResources = false;
  let assetsCount = 0;

  for (const f of meta.files) {
    if (!f.isDirectory) {
      const lower = f.path.toLowerCase();
      if (lower.endsWith('.dex')) {
        dexFiles.push(f.path);
      }
      if (lower.includes('lib/') && lower.endsWith('.so')) {
        nativeLibs.push(f.path);
      }
      if (lower.includes('androidmanifest.xml')) {
        hasManifest = true;
      }
      if (lower.includes('resources.arsc') || lower.startsWith('res/')) {
        hasResources = true;
      }
      if (lower.startsWith('assets/')) {
        assetsCount++;
      }
    }
  }

  meta.detectedType = 'Android APK Package';
  meta.apkAnalysis = {
    dexFiles,
    nativeLibs,
    hasManifest,
    hasResources,
    assetsCount,
  };

  return meta;
}

/**
 * If the user zipped an outer enclosing directory (e.g. `my-project/src/index.js`),
 * strip the redundant top-level directory so files are pushed neatly to repo root.
 */
function normalizeRootPaths(files: ParsedZipFile[]) {
  const nonDirs = files.filter((f) => !f.isDirectory);
  if (nonDirs.length === 0) return;

  const firstSegments = nonDirs.map((f) => f.path.split('/')[0]);
  const allShareRoot = firstSegments.every(
    (seg) => seg === firstSegments[0] && seg.length > 0
  );

  if (allShareRoot && firstSegments[0]) {
    const rootPrefix = firstSegments[0] + '/';
    for (const f of files) {
      if (f.path.startsWith(rootPrefix)) {
        f.path = f.path.slice(rootPrefix.length);
      }
    }
  }
}

/**
 * Bundles extracted files into a new ZIP archive and triggers automatic browser download.
 */
export async function downloadZip(
  files: ParsedZipFile[],
  filename: string
): Promise<void> {
  const zip = new JSZip();

  const filesToAdd = files.filter(
    (f) => !f.isDirectory && f.included && f.content !== undefined
  );
  if (filesToAdd.length === 0) {
    throw new Error('Nenhum arquivo selecionado para download.');
  }

  for (const f of filesToAdd) {
    if (f.content !== undefined) {
      zip.file(f.path, f.content);
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const cleanName = filename.toLowerCase().endsWith('.zip')
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}-extraido.zip`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Creates a sample repository zip in-memory so user can try the app instantly.
 */
export async function createSampleZip(): Promise<File> {
  const zip = new JSZip();

  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'sample-project',
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'vite',
          build: 'vite build',
        },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'README.md',
    `# Meu Projeto Publicado via ZipToGit\n\nEste projeto foi compactado em .ZIP e publicado **espontaneamente** diretamente para o GitHub através do **ZipToGit**.\n\n## Recursos\n- Publicação instantânea usando GitHub Git Data API\n- Suporte a blobs binários e texto\n- Filtros inteligentes para ignorar node_modules e arquivos confidenciais\n`
  );

  zip.file(
    'src/index.js',
    `console.log("Olá do projeto publicado espontaneamente no GitHub!");\n\nexport function add(a, b) {\n  return a + b;\n}\n`
  );

  zip.file(
    'src/styles.css',
    `body {\n  font-family: sans-serif;\n  background: #0d1117;\n  color: #fff;\n  margin: 0;\n  padding: 2rem;\n}\n`
  );

  zip.file('.gitignore', `node_modules/\n.DS_Store\n.env\ndist/\nbuild/\n`);

  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], 'meu-projeto-exemplo.zip', {
    type: 'application/zip',
  });
}

/**
 * Creates a sample Android APK in memory with Dalvik DEX bytecode header,
 * manifest, assets and native library structures so user can test immediately.
 */
export async function createSampleApk(): Promise<File> {
  const zip = new JSZip();

  zip.file(
    'AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.exemplo.aplicativo"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:allowBackup="true"
        android:label="Aplicativo Exemplo"
        android:supportsRtl="true">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  );

  const dexHeader = new Uint8Array([
    0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00,
    0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef,
    0x00, 0x01, 0x00, 0x00, 0x70, 0x00, 0x00, 0x00,
  ]);
  zip.file('classes.dex', dexHeader);
  zip.file('classes2.dex', dexHeader);

  zip.file(
    'assets/app_config.json',
    JSON.stringify(
      {
        appName: 'DemoApp',
        environment: 'production',
        apiEndpoint: 'https://api.exemplo.com/v1',
        modules: ['auth', 'telemetry', 'analytics'],
      },
      null,
      2
    )
  );

  const elfHeader = new Uint8Array([
    0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x03, 0x00, 0xb7, 0x00, 0x01, 0x00, 0x00, 0x00,
  ]);
  zip.file('lib/arm64-v8a/libnative-core.so', elfHeader);
  zip.file('lib/x86_64/libnative-core.so', elfHeader);

  zip.file(
    'res/values/strings.xml',
    `<resources>\n  <string name="app_name">App Exemplo</string>\n</resources>`
  );
  zip.file(
    'resources.arsc',
    new Uint8Array([0x02, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00])
  );

  zip.file(
    'META-INF/MANIFEST.MF',
    `Manifest-Version: 1.0\nCreated-By: 1.0 (Android Signer)\n\nName: AndroidManifest.xml\nSHA-256-Digest: abc123def456\n`
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], 'exemplo-aplicativo.apk', {
    type: 'application/vnd.android.package-archive',
  });
}
