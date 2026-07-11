import crypto from 'crypto';
import type { UploadStorage, UploadResult, UploadError } from './types';

interface GitHubRepo {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

let repoCache: GitHubRepo | null = null;

async function detectRepo(token: string): Promise<GitHubRepo | null> {
  if (repoCache) return repoCache;

  if (process.env.GH_REPO_OWNER && process.env.GH_REPO_NAME && process.env.GH_REPO_BRANCH) {
    repoCache = {
      owner: process.env.GH_REPO_OWNER,
      repo: process.env.GH_REPO_NAME,
      branch: process.env.GH_REPO_BRANCH,
      token
    };
    return repoCache;
  }

  if (process.env.VERCEL_GIT_REPO_SLUG && process.env.VERCEL_GIT_REPO_OWNER) {
    repoCache = {
      owner: process.env.VERCEL_GIT_REPO_OWNER,
      repo: process.env.VERCEL_GIT_REPO_SLUG,
      branch: process.env.VERCEL_GIT_COMMIT_REF || 'master',
      token
    };
    return repoCache;
  }

  try {
    const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (!res.ok) return null;
    const repos = (await res.json()) as Array<{ name: string; owner: { login: string }; default_branch: string }>;
    const rani = repos.find((r) => r.name.toLowerCase().includes('rani') || r.name.toLowerCase().includes('portfolio'));
    if (!rani) return null;
    repoCache = {
      owner: rani.owner.login,
      repo: rani.name,
      branch: rani.default_branch,
      token
    };
    return repoCache;
  } catch {
    return null;
  }
}

async function getFileSha(repo: GitHubRepo, path: string): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeURIComponent(path)}?ref=${repo.branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${repo.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (res.status === 404) return undefined;
  if (!res.ok) return undefined;
  const file = (await res.json()) as { sha?: string };
  return file.sha;
}

async function putFile(
  repo: GitHubRepo,
  path: string,
  contentBase64: string,
  message: string,
  sha?: string
): Promise<void> {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeURIComponent(path)}`;
  const body: { message: string; content: string; branch: string; sha?: string } = {
    message,
    content: contentBase64,
    branch: repo.branch
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${repo.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(`GitHub upload failed: ${err.message ?? res.status}`);
  }
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'file';
}

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
]);

const MAX_BYTES = 5 * 1024 * 1024;

export class GitHubUploadStorage implements UploadStorage {
  async saveUpload(file: File, section: string, hint: string): Promise<UploadResult | UploadError> {
    if (!ALLOWED_MIME.has(file.type)) {
      return { ok: false, error: `Unsupported file type: ${file.type}` };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` };
    }
    if (file.size === 0) {
      return { ok: false, error: 'Empty file' };
    }

    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
    if (!token) return { ok: false, error: 'GH_TOKEN not configured' };

    const repo = await detectRepo(token);
    if (!repo) return { ok: false, error: 'Could not detect GitHub repo (set GH_REPO_OWNER/REPO_NAME/BRANCH)' };

    const ext = extFromMime(file.type);
    const slug = sanitizeSlug(hint || file.name.replace(/\.[^.]+$/, ''));
    const hash = crypto.randomBytes(4).toString('hex');
    const filename = `${Date.now()}-${slug}-${hash}.${ext}`;
    const filePath = `public/uploads/${section}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentBase64 = buffer.toString('base64');

    try {
      await putFile(
        repo,
        filePath,
        contentBase64,
        `chore(uploads): add ${section}/${filename} via admin`,
        undefined
      );
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Upload failed' };
    }

    // Use jsdelivr CDN for fast image delivery
    const url = `https://cdn.jsdelivr.net/gh/${repo.owner}/${repo.repo}@${repo.branch}/${filePath}`;

    return { ok: true, url, filename };
  }
}