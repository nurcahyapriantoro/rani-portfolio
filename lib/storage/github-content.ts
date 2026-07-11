import type { ContentStorage, ContentShape, Locale } from './types';

interface GitHubRepo {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

interface GitHubContentFile {
  sha: string;
  content: string;
  encoding: string;
  name: string;
  path: string;
}

interface GitHubError {
  message: string;
  documentation_url?: string;
}

let repoCache: GitHubRepo | null = null;

async function detectRepo(token: string): Promise<GitHubRepo | null> {
  if (repoCache) return repoCache;

  // Strategy 1: explicit env vars
  if (process.env.GH_REPO_OWNER && process.env.GH_REPO_NAME && process.env.GH_REPO_BRANCH) {
    repoCache = {
      owner: process.env.GH_REPO_OWNER,
      repo: process.env.GH_REPO_NAME,
      branch: process.env.GH_REPO_BRANCH,
      token
    };
    return repoCache;
  }

  // Strategy 2: VERCEL_GIT_REPO_SLUG (set by Vercel on deployments)
  if (process.env.VERCEL_GIT_REPO_SLUG && process.env.VERCEL_GIT_REPO_OWNER) {
    repoCache = {
      owner: process.env.VERCEL_GIT_REPO_OWNER,
      repo: process.env.VERCEL_GIT_REPO_SLUG,
      branch: process.env.VERCEL_GIT_COMMIT_REF || 'master',
      token
    };
    return repoCache;
  }

  // Strategy 3: GitHub API - get authenticated user's repo list, find rani-portfolio
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

async function getFile(repo: GitHubRepo, path: string): Promise<GitHubContentFile | null> {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeURIComponent(path)}?ref=${repo.branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${repo.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as GitHubError;
    throw new Error(`GitHub GET failed: ${err.message ?? res.status}`);
  }
  return (await res.json()) as GitHubContentFile;
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
    const err = (await res.json().catch(() => ({}))) as GitHubError;
    throw new Error(`GitHub PUT failed: ${err.message ?? res.status}`);
  }
}

function toBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

const cache: Record<string, { data: ContentShape; ts: number }> = {};
const CACHE_TTL_MS = 1000;

export class GitHubContentStorage implements ContentStorage {
  private getRepo(): Promise<GitHubRepo | null> {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
    if (!token) return Promise.resolve(null);
    return detectRepo(token);
  }

  async readContent(locale: Locale): Promise<ContentShape> {
    const repo = await this.getRepo();
    if (!repo) throw new Error('GitHub storage not configured (missing GH_TOKEN)');

    const cached = cache[locale];
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.data;
    }

    const file = await getFile(repo, `content/${locale}.json`);
    if (!file) {
      // First-time read: return empty shape (will be populated on first write)
      return {};
    }
    const decoded = Buffer.from(file.content, 'base64').toString('utf-8');
    const data = JSON.parse(decoded) as ContentShape;
    cache[locale] = { data, ts: Date.now() };
    return data;
  }

  async writeContent(locale: Locale, data: ContentShape): Promise<void> {
    const repo = await this.getRepo();
    if (!repo) throw new Error('GitHub storage not configured');

    const path = `content/${locale}.json`;
    const existing = await getFile(repo, path);
    const content = JSON.stringify(data, null, 2);
    const b64 = toBase64(content);

    await putFile(
      repo,
      path,
      b64,
      `chore(content): update ${locale}.json via admin`,
      existing?.sha
    );

    cache[locale] = { data, ts: Date.now() };
  }

  async updateSection(locale: Locale, key: string, data: unknown): Promise<{ success: true }> {
    const content = await this.readContent(locale);
    content[key] = data;
    await this.writeContent(locale, content);
    return { success: true };
  }

  async updateBilingualSection(
    enData: unknown,
    idData: unknown,
    key: string
  ): Promise<{ success: true }> {
    const enContent = await this.readContent('en');
    const idContent = await this.readContent('id');
    const enBackup = JSON.parse(JSON.stringify(enContent));
    const idBackup = JSON.parse(JSON.stringify(idContent));

    enContent[key] = enData;
    await this.writeContent('en', enContent);

    try {
      idContent[key] = idData;
      await this.writeContent('id', idContent);
    } catch (err) {
      // Rollback EN
      try {
        await this.writeContent('en', enBackup);
      } catch {
        // Swallow rollback failure — original error is more important
      }
      throw err;
    }
    return { success: true };
  }
}