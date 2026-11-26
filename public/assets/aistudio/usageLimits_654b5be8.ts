/**
 * Giới hạn sử dụng cho /api/chat — chỉ lưu trong bộ nhớ của tiến trình.
 *
 * Lưu ý: bộ đếm mất khi server khởi động lại và không chia sẻ giữa nhiều instance.
 * "Trần toàn hệ thống" (aiGlobalPerDay) là lớp bảo vệ chính cho ví tiền/hạn mức Gemini;
 * giới hạn theo IP chỉ để chia đều lượt dùng giữa mọi người.
 */

export interface UsageLimitsOptions {
  aiPerIpPerDay: number;
  aiGlobalPerDay: number;
  requestsPerMinute: number;
  /** Chỉ để test: đồng hồ giả lập (ms). */
  now?: () => number;
}

export interface QuotaInfo {
  limit: number;
  remaining: number;
}

export type AiDecision =
  | ({ ok: true } & QuotaInfo)
  | ({ ok: false; reason: 'ip' | 'global' } & QuotaInfo);

const VN_OFFSET_MS = 7 * 3600_000; // UTC+7, "ngày" đổi lúc 00:00 giờ Việt Nam

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
    if (globalDaily.day !== day) globalDaily = { day, count: 0 };
    return globalDaily;
  }

  const info = (count: number): QuotaInfo => ({
    limit: opts.aiPerIpPerDay,
    remaining: Math.max(0, opts.aiPerIpPerDay - count),
  });

  return {
    /** Giới hạn số request/phút (cả tra cứu cục bộ) để chống spam. */
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

    /** Trừ một lượt AI. Gọi TRƯỚC khi gọi Gemini; nếu Gemini lỗi thì refundAi(). */
    tryConsumeAi(ip: string): AiDecision {
      const e = ipEntry(ip);
      const g = globalEntry();
      if (g.count >= opts.aiGlobalPerDay) return { ok: false, reason: 'global', ...info(e.count) };
      if (e.count >= opts.aiPerIpPerDay) return { ok: false, reason: 'ip', ...info(e.count) };
      e.count += 1;
      g.count += 1;
      return { ok: true, ...info(e.count) };
    },

    refundAi(ip: string): void {
      const e = ipEntry(ip);
      const g = globalEntry();
      e.count = Math.max(0, e.count - 1);
      g.count = Math.max(0, g.count - 1);
    },

    peek(ip: string): QuotaInfo {
      return info(ipEntry(ip).count);
    },

    /** Dọn các mục đã cũ để Map không phình mãi. Gọi định kỳ. */
    sweep(): void {
      const day = vnDay();
      const t = now();
      for (const [ip, e] of ipDaily) if (e.day !== day) ipDaily.delete(ip);
      for (const [ip, list] of recent) {
        if (list.every((x) => t - x >= 60_000)) recent.delete(ip);
      }
    },
  };
}

export type UsageLimits = ReturnType<typeof createUsageLimits>;

/** Cache nhỏ có hạn dùng, để cùng một câu hỏi AI không bị tính lượt hai lần. */
export function createTtlCache<V>(maxEntries: number, ttlMs: number, now: () => number = Date.now) {
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
