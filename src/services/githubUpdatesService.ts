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
const GITHUB_CACHE_KEY = 'd25b_github_commits_cache_v2';
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
  if (
    s.startsWith('build:') ||
    s.startsWith('chore:') ||
    s.startsWith('ci:') ||
    s.startsWith('test:') ||
    s.includes('peer deps') ||
    s.includes('node.js') ||
    s.includes('esbuild')
  ) {
    return true;
  }
  return false;
}

interface LocalizedCommitContent {
  title: string;
  summary: string;
  details: string[];
  category: 'Cẩm nang & Thông báo' | 'Cập nhật học tập' | 'Tính năng mới';
}

function localizeCommit(subject: string, bodyLines: string[], sha: string): LocalizedCommitContent {
  const lowerSub = subject.toLowerCase();

  // Known commits on GitHub repository
  if (lowerSub.includes('site icons') || lowerSub.includes('introduction video')) {
    return {
      title: 'Cập nhật biểu tượng (Favicon) & Video hướng dẫn',
      summary: 'Thiết lập logo D25B làm biểu tượng trang web và nhúng video YouTube giới thiệu vào Góc tuyển dụng.',
      details: [
        'Cài đặt logo chính thức của lớp D25B làm biểu tượng hiển thị trên tab trình duyệt (Favicon).',
        'Nhúng khung phát video YouTube giới thiệu trực tiếp ngay tại Góc tuyển dụng trên trang chủ.',
      ],
      category: 'Tính năng mới',
    };
  }

  if (
    lowerSub.includes('enhance error handling') ||
    lowerSub.includes('notice tools') ||
    lowerSub.includes('terms of service')
  ) {
    return {
      title: 'Bổ sung Điều khoản dịch vụ & Tối ưu tài khoản',
      summary: 'Tích hợp các trang Điều khoản dịch vụ, Chính sách quyền riêng tư và cải thiện đăng nhập an toàn.',
      details: [
        'Thêm trang Điều khoản dịch vụ và Chính sách quyền riêng tư công khai phục vụ xác thực Google.',
        'Nâng cấp cơ chế đăng nhập và kiểm tra kết nối tài khoản thành viên ổn định hơn.',
      ],
      category: 'Cẩm nang & Thông báo',
    };
  }

  if (lowerSub.includes('hóa phân tích 2') || lowerSub.includes('hpt2') || lowerSub.includes('git metadata')) {
    return {
      title: 'Bổ sung học phần Hóa Phân Tích 2 & Mã QR nộp bài',
      summary: 'Thêm tài liệu môn Hóa Phân Tích 2 (Năm 2 – HK2) và bổ sung mã QR quét nhanh nộp bài THHPT1.',
      details: [
        'Bổ sung môn Hóa Phân Tích 2 vào Kho học phần kèm thư mục tài liệu Drive.',
        'Hỗ trợ mã QR quét nhanh link nộp báo cáo Thực hành Hóa Phân Tích 1 theo từng bàn.',
      ],
      category: 'Cập nhật học tập',
    };
  }

  if (lowerSub.includes('forum') || lowerSub.includes('profile views')) {
    return {
      title: 'Mở Diễn đàn trao đổi & Trang cá nhân',
      summary: 'Bổ sung Diễn đàn hỏi đáp sinh viên D25B và trang hồ sơ học tập cá nhân.',
      details: [
        'Ra mắt phân khu Diễn đàn chia sẻ tài liệu và thảo luận học tập.',
        'Cho phép tùy biến thông tin cá nhân và quản lý tiến độ hoàn thành deadline.',
      ],
      category: 'Tính năng mới',
    };
  }

  // Automatic translation for other commits
  const translateLine = (line: string): string => {
    let t = line.trim().replace(/^[-*•]\s*/, '');
    t = t.replace(/^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(\([^)]*\))?:\s*/i, '');
    t = t
      .replace(/\badd\b/gi, 'Thêm')
      .replace(/\bupdate\b/gi, 'Cập nhật')
      .replace(/\benhance\b/gi, 'Cải tiến')
      .replace(/\bimprove\b/gi, 'Tối ưu')
      .replace(/\bimplement\b/gi, 'Triển khai')
      .replace(/\bfix\b/gi, 'Sửa lỗi')
      .replace(/\bremove\b/gi, 'Gỡ bỏ')
      .replace(/\bsupport\b/gi, 'Hỗ trợ')
      .replace(/\bfavicon and app icons/gi, 'biểu tượng trang web (Favicon)')
      .replace(/\bintroduction video\b/gi, 'video hướng dẫn')
      .replace(/\bhomeview\b/gi, 'trang chủ')
      .replace(/\bterms of service\b/gi, 'Điều khoản dịch vụ')
      .replace(/\bprivacy policy\b/gi, 'Chính sách quyền riêng tư')
      .replace(/\berror handling\b/gi, 'xử lý kết nối')
      .replace(/\bto assist new users\b/gi, 'hỗ trợ sinh viên')
      .replace(/\bfor sending notices\b/gi, 'gửi thông báo')
      .replace(/\bvia api\b/gi, '')
      .replace(/\bdeadline\b/gi, 'hạn nộp')
      .replace(/\bcourse\b/gi, 'học phần');

    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  const translatedTitle = translateLine(subject);
  const translatedDetails = bodyLines.map(translateLine).filter(Boolean);
  const translatedSummary =
    translatedDetails[0] || 'Cập nhật tính năng và học liệu mới trên cổng thông tin lớp.';

  return {
    title: translatedTitle,
    summary: translatedSummary,
    details:
      translatedDetails.length > 0
        ? translatedDetails
        : ['Cập nhật giao diện và tối ưu trải nghiệm học tập cho sinh viên D25B.'],
    category:
      lowerSub.includes('hóa') || lowerSub.includes('học') || lowerSub.includes('course')
        ? 'Cập nhật học tập'
        : lowerSub.includes('thông báo') || lowerSub.includes('notice') || lowerSub.includes('auth')
        ? 'Cẩm nang & Thông báo'
        : 'Tính năng mới',
  };
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

      const { title, summary, details, category } = localizeCommit(c.subject, bodyLines, c.sha);

      return {
        id: `gh-${shortSha}`,
        title,
        category,
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
