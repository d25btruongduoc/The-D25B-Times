import { useEffect, useMemo, useState } from 'react';
import { AppUpdateItem, getActiveAppUpdates } from '../data/d25bData';

declare const __BUILD_GIT_COMMITS__: BuildGitCommit[] | undefined;

export interface BuildGitCommit {
  sha: string;
  date: string;
  subject: string;
  body: string;
  author?: string;
}

export type ActiveAppUpdateItem = AppUpdateItem & {
  expiresAt: string;
  daysRemaining: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const GITHUB_CACHE_KEY = 'd25b_github_commits_cache_v1';
const GITHUB_CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_GITHUB_REPO = 'd25btruongduoc/The-D25B-Times';

interface GithubApiCommit {
  sha: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: {
      name?: string;
      date?: string;
    };
    committer?: {
      date?: string;
    };
  };
}

interface CachedGithubPayload {
  repo: string;
  fetchedAt: number;
  commits: BuildGitCommit[];
}

export function resolveGithubRepo(): string {
  const envRepo =
    typeof import.meta !== 'undefined'
      ? String(import.meta.env?.VITE_GITHUB_REPO || '').trim()
      : '';
  if (envRepo && /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(envRepo)) {
    return envRepo;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.endsWith('.github.io')) {
      const owner = host.replace(/\.github\.io$/, '');
      const firstSeg = window.location.pathname.split('/').filter(Boolean)[0];
      if (owner && firstSeg) {
        return `${owner}/${firstSeg}`;
      }
    }
  }

  return DEFAULT_GITHUB_REPO;
}

function isTrivialCommit(subject: string): boolean {
  const s = subject.trim().toLowerCase();
  if (!s) return true;
  if (s.startsWith('merge pull request') || s.startsWith('merge branch')) return true;
  return false;
}

function commitsToUpdates(
  commits: BuildGitCommit[],
  repo: string,
  now: Date
): ActiveAppUpdateItem[] {
  const nowMs = now.getTime();
  const ttlDays = 7;

  return commits
    .filter((c) => c.subject && !isTrivialCommit(c.subject))
    .map((c) => {
      const startMs = new Date(c.date).getTime();
      if (Number.isNaN(startMs)) return null;
      const expiresMs = startMs + ttlDays * MS_PER_DAY;
      if (expiresMs < nowMs) return null;

      const daysRemaining = Math.max(0, Math.ceil((expiresMs - nowMs) / MS_PER_DAY));
      const shortSha = c.sha.slice(0, 7);
      const bodyLines = c.body
        .split(/\r?\n/)
        .map((line) => line.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);

      const summary =
        bodyLines[0] ||
        `Phiên bản mới đã được cập nhật lên GitHub (${repo} · #${shortSha}).`;

      const details = [
        ...bodyLines,
        `Bản cập nhật từ nhánh main trên GitHub (mã #${shortSha}${c.author ? ` · ${c.author}` : ''}).`,
      ];

      return {
        id: `gh-${shortSha}`,
        title: c.subject,
        category: 'Tính năng mới' as const,
        updatedAt: c.date,
        ttlDays,
        summary,
        details: Array.from(new Set(details)),
        externalUrl: `https://github.com/${repo}/commit/${c.sha}`,
        expiresAt: new Date(expiresMs).toISOString(),
        daysRemaining,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null) as ActiveAppUpdateItem[];
}

function getBuildCommits(): BuildGitCommit[] {
  try {
    return Array.isArray(__BUILD_GIT_COMMITS__) ? __BUILD_GIT_COMMITS__ : [];
  } catch {
    return [];
  }
}

function readCachedCommits(repo: string): BuildGitCommit[] | null {
  try {
    const raw = localStorage.getItem(GITHUB_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedGithubPayload;
    if (
      parsed.repo !== repo ||
      !Array.isArray(parsed.commits) ||
      Date.now() - parsed.fetchedAt > GITHUB_CACHE_TTL_MS
    ) {
      return null;
    }
    return parsed.commits;
  } catch {
    return null;
  }
}

function writeCachedCommits(repo: string, commits: BuildGitCommit[]): void {
  try {
    const payload: CachedGithubPayload = {
      repo,
      fetchedAt: Date.now(),
      commits,
    };
    localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

export function getMergedAppUpdates(
  now: Date = new Date(),
  remoteCommits: BuildGitCommit[] = []
): ActiveAppUpdateItem[] {
  const repo = resolveGithubRepo();
  const curated = getActiveAppUpdates(now);
  const latestCuratedMs = curated.reduce(
    (max, item) => Math.max(max, new Date(item.updatedAt).getTime()),
    0
  );

  // Prefer live remote commits when available, fallback to build-time commits
  const combinedCommits = remoteCommits.length > 0 ? remoteCommits : getBuildCommits();
  const gitUpdates = commitsToUpdates(combinedCommits, repo, now).filter((u) => {
    // Show GitHub commits pushed after the curated release timestamp (or if curated list is empty)
    return curated.length === 0 || new Date(u.updatedAt).getTime() > latestCuratedMs;
  });

  return [...gitUpdates, ...curated].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function useAppUpdates(now: Date = new Date()): ActiveAppUpdateItem[] {
  const repo = useMemo(() => resolveGithubRepo(), []);
  const [remoteCommits, setRemoteCommits] = useState<BuildGitCommit[]>(() => {
    return readCachedCommits(repo) || [];
  });

  useEffect(() => {
    const cached = readCachedCommits(repo);
    if (cached) {
      setRemoteCommits(cached);
      return;
    }

    const controller = new AbortController();

    async function fetchCommits() {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/commits?per_page=8`,
          {
            headers: { Accept: 'application/vnd.github+json' },
            signal: controller.signal,
          }
        );
        if (!res.ok) return;
        const data = (await res.json()) as GithubApiCommit[];
        if (!Array.isArray(data)) return;

        const mapped: BuildGitCommit[] = data
          .map((item) => {
            const fullMsg = String(item.commit?.message || '').trim();
            const [subject = '', ...rest] = fullMsg.split(/\r?\n/);
            const date =
              item.commit?.committer?.date || item.commit?.author?.date || '';
            return {
              sha: item.sha,
              date,
              subject: subject.trim(),
              body: rest.join('\n').trim(),
              author: item.commit?.author?.name,
            };
          })
          .filter((c) => c.sha && c.subject && c.date);

        writeCachedCommits(repo, mapped);
        setRemoteCommits(mapped);
      } catch {
        // Silent fallback to curated & build-time updates if offline or rate-limited
      }
    }

    void fetchCommits();
    return () => controller.abort();
  }, [repo]);

  return useMemo(() => getMergedAppUpdates(now, remoteCommits), [now, remoteCommits]);
}
