export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  total_private_repos?: number;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  updated_at: string;
}

export interface ParsedZipFile {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
  content?: string | Uint8Array;
  isBinary: boolean;
  included: boolean;
  extension: string;
}

export interface ApkAnalysis {
  dexFiles: string[];
  nativeLibs: string[];
  hasManifest: boolean;
  hasResources: boolean;
  assetsCount: number;
}

export interface FileFormatInfo {
  format: 'zip' | 'apk' | 'gzip' | 'tar' | 'rar' | '7z' | 'elf' | 'pe_exe' | 'dex' | 'unknown';
  displayName: string;
  isArchive: boolean;
  isExecutable: boolean;
  mimeGuess: string;
  magicHex: string;
}

export interface ZipMetadata {
  fileName: string;
  totalFiles: number;
  totalSize: number;
  compressedSize: number;
  detectedType: string;
  files: ParsedZipFile[];
  apkAnalysis?: ApkAnalysis;
  formatInfo?: FileFormatInfo;
  isNestedArchive?: boolean;
}

export interface ArchitectureAnalysis {
  overview: string;
  techStack: Array<{
    name: string;
    category: string;
    role: string;
    necessity: string;
  }>;
  architectureBreakdown: {
    pattern: string;
    dataFlow: string;
    modules: Array<{
      name: string;
      purpose: string;
      responsibility: string;
    }>;
  };
  stepByStepLogic: Array<{
    stepNumber: number;
    title: string;
    objective: string;
    keyTasks: string[];
    pitfallsToAvoid: string;
  }>;
  masterPrompt: string;
  visualDifferentiationTips: string;
}

export interface PushOptions {
  repoName: string;
  isNewRepo: boolean;
  isPrivate: boolean;
  description: string;
  branch: string;
  commitMessage: string;
  ignoreNodeModules: boolean;
  ignoreGitFolders: boolean;
  ignoreEnvFiles: boolean;
  ignoreOsFiles: boolean;
  autoPushOnDrop: boolean;
}

export interface PushStepProgress {
  step: 'idle' | 'checking_repo' | 'creating_repo' | 'creating_blobs' | 'creating_tree' | 'creating_commit' | 'updating_ref' | 'completed' | 'error';
  currentBlob?: number;
  totalBlobs?: number;
  currentFileName?: string;
  commitSha?: string;
  repoUrl?: string;
  errorMessage?: string;
}

export type AIProviderId = 'nvidia' | 'openai' | 'deepseek' | 'groq' | 'ollama' | 'custom';

export interface AIProviderConfig {
  provider: AIProviderId;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}
