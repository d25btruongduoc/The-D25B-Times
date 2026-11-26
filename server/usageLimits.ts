/**
 * In-memory usage limits & TTL response cache for /api/chat.
 * Resets daily at 00:00 Asia/Ho_Chi_Minh (UTC+7).
 */

export interface UsageLimitsOptions {
  aiPerIpPerDay: number;
  aiGlobalPerDay: number;
  requestsPerMinute: number;
  now?: () => number;
}

export interface QuotaSnapshot {
  dateKey: string;
  used: number;
  limit: number;
  remaining: number;
  globalRemaining: number;
  globalLimit: number;
}

export type AiDecision =
  | ({ ok: true } & QuotaSnapshot)
  | ({ ok: false; reason: 'ip' | 'global' } & QuotaSnapshot);

const VN_OFFSET_MS = 7 * 3600_000;

export function createUsageLimits(opts: UsageLimitsOptions) {
  const now = opts.now ?? Date.now;
  const vnDay = () => new Date(now() + VN_OFFSET_MS).toISOString().slice(0, 10);

  const ipDaily = new Map<string, { day: string; count: number }>();
  const recent = new Map<string, number[]>();
  let globalDaily = { day: vnDay(), count: 0 };

  function ipEntry(ip: string) {
    const day = vnDay();
    let e = ipDaily.get(ip);
    if (!e || e.day !== day) {
      e = { day, count: 0 };
      ipDaily.set(ip, e);
    }
    return e;
  }

  function globalEntry() {
    const day = vnDay();
    if (globalDaily.day !== day) {
      globalDaily = { day, count: 0 };
    }
    return globalDaily;
  }

  const snapshot = (ipCount: number, globalCount: number, day: string): QuotaSnapshot => ({
    dateKey: day,
    used: ipCount,
    limit: opts.aiPerIpPerDay,
    remaining: Math.max(0, opts.aiPerIpPerDay - ipCount),
    globalRemaining: Math.max(0, opts.aiGlobalPerDay - globalCount),
    globalLimit: opts.aiGlobalPerDay,
  });

  return {
    /** Per-minute anti-spam check applied to all /api/chat requests */
    allowRequest(ip: string): boolean {
      const t = now();
      const list = (recent.get(ip) ?? []).filter((x) => t - x < 60_000);
      if (list.length >= opts.requestsPerMinute) {
        recent.set(ip, list);
        return false;
      }
      list.push(t);
      recent.set(ip, list);
      return true;
    },

    /** Reserve 1 AI call before invoking Gemini; call refundAi() if Gemini errors */
    tryConsumeAi(ip: string): AiDecision {
      const e = ipEntry(ip);
      const g = globalEntry();
      if (g.count >= opts.aiGlobalPerDay) {
        return { ok: false, reason: 'global', ...snapshot(e.count, g.count, g.day) };
      }
      if (e.count >= opts.aiPerIpPerDay) {
        return { ok: false, reason: 'ip', ...snapshot(e.count, g.count, g.day) };
      }
      e.count += 1;
      g.count += 1;
      return { ok: true, ...snapshot(e.count, g.count, g.day) };
    },

    refundAi(ip: string): void {
      const e = ipEntry(ip);
      const g = globalEntry();
      e.count = Math.max(0, e.count - 1);
      g.count = Math.max(0, g.count - 1);
    },

    peek(ip: string): QuotaSnapshot {
      const e = ipEntry(ip);
      const g = globalEntry();
      return snapshot(e.count, g.count, g.day);
    },

    sweep(): void {
      const day = vnDay();
      const t = now();
      for (const [ip, e] of ipDaily) {
        if (e.day !== day) ipDaily.delete(ip);
      }
      for (const [ip, list] of recent) {
        if (list.every((x) => t - x >= 60_000)) recent.delete(ip);
      }
    },
  };
}

export type UsageLimits = ReturnType<typeof createUsageLimits>;

/** Bounded TTL cache so identical single-turn AI queries do not consume quota twice */
export function createTtlCache<V>(
  maxEntries: number,
  ttlMs: number,
  now: () => number = Date.now
) {
  const store = new Map<string, { value: V; expires: number }>();
  return {
    get(key: string): V | undefined {
      const e = store.get(key);
      if (!e) return undefined;
      if (e.expires < now()) {
        store.delete(key);
        return undefined;
      }
      return e.value;
    },
    set(key: string, value: V): void {
      if (store.size >= maxEntries) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      store.set(key, { value, expires: now() + ttlMs });
    },
  };
}
