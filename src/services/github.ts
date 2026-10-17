import { GitHubUser, GitHubRepo, ParsedZipFile, PushStepProgress } from '../types';

const GITHUB_API = 'https://api.github.com';

function getHeaders(token: string) {
  return {
    Authorization: `Bearer ${token.trim()}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

export async function validateToken(token: string): Promise<GitHubUser> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('O token do GitHub não foi fornecido.');
  }

  const res = await fetch(`${GITHUB_API}/user`, {
    headers: getHeaders(cleanToken),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Token do GitHub inválido ou expirado. Verifique o token e tente novamente.');
    }
    if (res.status === 403) {
      throw new Error('Limite de taxa da API do GitHub atingido ou escopo insuficiente (requer escopo "repo").');
    }
    throw new Error(`Erro ao conectar com GitHub: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    login: data.login,
    id: data.id,
    avatar_url: data.avatar_url,
    name: data.name,
    bio: data.bio,
    public_repos: data.public_repos,
    total_private_repos: data.total_private_repos,
    html_url: data.html_url,
  };
}

export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const cleanToken = token.trim();
  const res = await fetch(`${GITHUB_API}/user/repos?sort=updated&per_page=100&affiliation=owner`, {
    headers: getHeaders(cleanToken),
  });

  if (!res.ok) {
    throw new Error('Não foi possível carregar seus repositórios do GitHub.');
  }

  const data = await res.json();
  return data.map((r: any) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    html_url: r.html_url,
    description: r.description,
    default_branch: r.default_branch || 'main',
    updated_at: r.updated_at,
  }));
}

export async function createRepo(
  token: string,
  name: string,
  isPrivate: boolean,
  description: string
): Promise<GitHubRepo> {
  const cleanToken = token.trim();
  const cleanName = name.trim().replace(/[^a-zA-Z0-9-_.]/g, '-');

  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: 'POST',
    headers: getHeaders(cleanToken),
    body: JSON.stringify({
      name: cleanName,
      private: isPrivate,
      description: description || 'Repositório criado automaticamente via ZipToGit',
      auto_init: true,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 422) {
      throw new Error(`O repositório "${cleanName}" já existe na sua conta do GitHub ou o nome é inválido.`);
    }
    throw new Error(errorData.message || `Falha ao criar repositório (${res.status})`);
  }

  const r = await res.json();
  return {
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    html_url: r.html_url,
    description: r.description,
    default_branch: r.default_branch || 'main',
    updated_at: r.updated_at,
  };
}

export async function checkRepoExists(token: string, owner: string, repo: string): Promise<boolean> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: getHeaders(token),
  });
  return res.ok;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

async function initializeEmptyRepo(
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<string | null> {
  const headers = getHeaders(token);
  try {
    const initRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/README.md`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'chore: inicializar repositório via ZipToGit',
        content: btoa(`# ${repo}\n\nRepositório inicializado para recebimento de arquivos via ZipToGit.`),
        branch,
      }),
    });

    if (initRes.ok) {
      const initData = await initRes.json();
      await new Promise((r) => setTimeout(r, 1200));
      return initData.commit?.sha || null;
    }
  } catch (err) {
    console.warn('Falha na inicialização do repositório vazio', err);
  }
  return null;
}

export async function pushFilesToGitHub(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  files: ParsedZipFile[],
  commitMessage: string,
  onProgress: (progress: PushStepProgress) => void
): Promise<{ commitSha: string; repoUrl: string }> {
  const headers = getHeaders(token);
  const repoUrl = `https://github.com/${owner}/${repo}`;

  const filesToUpload = files.filter((f) => !f.isDirectory && f.included);
  if (filesToUpload.length === 0) {
    throw new Error('Nenhum arquivo selecionado para envio.');
  }

  // Step 1: Check existing branch ref or initialize if empty
  onProgress({
    step: 'checking_repo',
    totalBlobs: filesToUpload.length,
    currentBlob: 0,
  });

  let baseCommitSha: string | null = null;
  let baseTreeSha: string | null = null;

  try {
    const refRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
      headers,
    });

    if (refRes.ok) {
      const refData = await refRes.json();
      baseCommitSha = refData.object.sha;

      const commitRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits/${baseCommitSha}`, {
        headers,
      });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    } else {
      // Branch doesn't exist or repo is empty: initialize repository!
      baseCommitSha = await initializeEmptyRepo(token, owner, repo, branch);
    }
  } catch (err) {
    console.warn('Ref check failed, initializing repo', err);
    baseCommitSha = await initializeEmptyRepo(token, owner, repo, branch);
  }

  // Step 2: Upload blobs
  onProgress({
    step: 'creating_blobs',
    totalBlobs: filesToUpload.length,
    currentBlob: 0,
    currentFileName: filesToUpload[0].path,
  });

  const treeItems: Array<{ path: string; mode: string; type: 'blob'; sha: string }> = [];

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    onProgress({
      step: 'creating_blobs',
      totalBlobs: filesToUpload.length,
      currentBlob: i + 1,
      currentFileName: file.path,
    });

    let blobContent: string;
    let encoding: 'utf-8' | 'base64' = 'utf-8';

    if (file.isBinary && file.content instanceof Uint8Array) {
      blobContent = uint8ArrayToBase64(file.content);
      encoding = 'base64';
    } else if (typeof file.content === 'string') {
      blobContent = file.content;
      encoding = 'utf-8';
    } else if (file.content instanceof Uint8Array) {
      blobContent = uint8ArrayToBase64(file.content);
      encoding = 'base64';
    } else {
      blobContent = '';
    }

    let blobRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: blobContent,
        encoding,
      }),
    });

    // If repository is empty (409 Conflict), auto-initialize and retry!
    if (!blobRes.ok) {
      const errorJson = await blobRes.json().catch(() => ({}));
      if (
        blobRes.status === 409 ||
        errorJson.message?.includes('Git Repository is empty')
      ) {
        const initSha = await initializeEmptyRepo(token, owner, repo, branch);
        if (initSha) {
          baseCommitSha = initSha;
        }

        // Retry creating blob
        blobRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: blobContent,
            encoding,
          }),
        });
      }

      if (!blobRes.ok) {
        const finalError = await blobRes.json().catch(() => ({}));
        throw new Error(
          `Falha ao enviar arquivo "${file.path}": ${finalError.message || errorJson.message || blobRes.statusText}`
        );
      }
    }

    const blobData = await blobRes.json();
    treeItems.push({
      path: file.path.replace(/^\/+/, ''), // remove leading slash
      mode: '100644', // standard file
      type: 'blob',
      sha: blobData.sha,
    });
  }

  // Step 3: Create Tree
  onProgress({
    step: 'creating_tree',
    totalBlobs: filesToUpload.length,
    currentBlob: filesToUpload.length,
  });

  const treePayload: any = {
    tree: treeItems,
  };
  if (baseTreeSha) {
    treePayload.base_tree = baseTreeSha;
  }

  const treeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify(treePayload),
  });

  if (!treeRes.ok) {
    const errorJson = await treeRes.json().catch(() => ({}));
    throw new Error(`Falha ao criar Git Tree: ${errorJson.message || treeRes.statusText}`);
  }

  const treeData = await treeRes.json();
  const newTreeSha = treeData.sha;

  // Step 4: Create Commit
  onProgress({
    step: 'creating_commit',
    totalBlobs: filesToUpload.length,
    currentBlob: filesToUpload.length,
  });

  const commitPayload: any = {
    message: commitMessage || 'feat: upload inicial de arquivos via ZipToGit',
    tree: newTreeSha,
  };
  if (baseCommitSha) {
    commitPayload.parents = [baseCommitSha];
  }

  const commitRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify(commitPayload),
  });

  if (!commitRes.ok) {
    const errorJson = await commitRes.json().catch(() => ({}));
    throw new Error(`Falha ao criar commit: ${errorJson.message || commitRes.statusText}`);
  }

  const commitData = await commitRes.json();
  const commitSha = commitData.sha;

  // Step 5: Update or Create Ref
  onProgress({
    step: 'updating_ref',
    commitSha,
  });

  if (baseCommitSha) {
    // Update existing branch ref
    const updateRefRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: commitSha,
        force: true,
      }),
    });

    if (!updateRefRes.ok) {
      // If branch ref does not exist, create it!
      const createRefRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha: commitSha,
        }),
      });

      if (!createRefRes.ok) {
        const errorJson = await createRefRes.json().catch(() => ({}));
        throw new Error(`Falha ao atualizar ou criar branch "${branch}": ${errorJson.message || updateRefRes.statusText}`);
      }
    }
  } else {
    // Create new branch ref
    const createRefRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: commitSha,
      }),
    });

    if (!createRefRes.ok) {
      const errorJson = await createRefRes.json().catch(() => ({}));
      throw new Error(`Falha ao criar branch "${branch}": ${errorJson.message || createRefRes.statusText}`);
    }
  }

  onProgress({
    step: 'completed',
    commitSha,
    repoUrl,
  });

  return { commitSha, repoUrl };
}

/**
 * High-fidelity dry-run / simulation for demo mode or testing without token
 */
export async function simulatePushToGitHub(
  owner: string,
  repo: string,
  branch: string,
  files: ParsedZipFile[],
  commitMessage: string,
  onProgress: (progress: PushStepProgress) => void
): Promise<{ commitSha: string; repoUrl: string }> {
  const filesToUpload = files.filter((f) => !f.isDirectory && f.included);
  const total = filesToUpload.length;

  onProgress({ step: 'checking_repo', totalBlobs: total, currentBlob: 0 });
  await new Promise((r) => setTimeout(r, 600));

  for (let i = 0; i < total; i++) {
    onProgress({
      step: 'creating_blobs',
      totalBlobs: total,
      currentBlob: i + 1,
      currentFileName: filesToUpload[i].path,
    });
    await new Promise((r) => setTimeout(r, Math.max(30, Math.floor(1000 / total))));
  }

  onProgress({ step: 'creating_tree', totalBlobs: total, currentBlob: total });
  await new Promise((r) => setTimeout(r, 700));

  onProgress({ step: 'creating_commit', totalBlobs: total, currentBlob: total });
  await new Promise((r) => setTimeout(r, 600));

  const fakeSha = Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  onProgress({ step: 'updating_ref', commitSha: fakeSha });
  await new Promise((r) => setTimeout(r, 500));

  const repoUrl = `https://github.com/${owner}/${repo}`;
  onProgress({ step: 'completed', commitSha: fakeSha, repoUrl });

  return { commitSha: fakeSha, repoUrl };
}
