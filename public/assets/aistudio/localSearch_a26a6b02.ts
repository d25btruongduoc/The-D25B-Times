/**
 * Tra cứu cục bộ (KHÔNG dùng AI) trên dữ liệu The D25B Times.
 *
 * - buildIndex(): biến mọi nhóm dữ liệu (mảng/đối tượng lồng nhau) thành các "tài liệu" tìm kiếm,
 *   không cần biết trước cấu trúc từng nhóm.
 * - search(): chấm điểm theo từ khóa (không phân biệt dấu tiếng Việt, có trọng số IDF).
 * - routeQuestion(): quyết định câu hỏi nào trả lời thẳng từ dữ liệu, câu nào cần AI.
 * - renderHits(): dựng câu trả lời văn bản từ kết quả tra cứu.
 */

// ───────────────────────── Kiểu dữ liệu ─────────────────────────
export interface DocLink {
  label: string;
  url: string;
}

export interface IndexedDoc {
  section: string;
  sectionLabel: string;
  title: string;
  titleNorm: string;
  titleTokens: Set<string>;
  bodyTokens: Set<string>;
  raw: Record<string, unknown>;
  links: DocLink[];
}

export interface SearchIndex {
  docs: IndexedDoc[];
  df: Map<string, number>;
}

export interface Hit {
  doc: IndexedDoc;
  score: number;
  /** Tỉ lệ (theo trọng số IDF) các từ khóa của câu hỏi tìm thấy trong tài liệu, 0..1 */
  coverage: number;
}

export type Route =
  | { kind: 'greeting'; reply: string }
  | { kind: 'local'; reply: string; hits: Hit[] }
  | { kind: 'ai'; reason: 'reasoning' | 'long' | 'no-match'; hits: Hit[] };

export interface RouteOptions {
  /** Ngưỡng phủ từ khóa để trả lời cục bộ (mặc định 0.6). Tăng lên → nhiều câu chuyển sang AI hơn. */
  minCoverage?: number;
  /** Điểm tối thiểu của kết quả đầu tiên (mặc định 1.5). */
  minScore?: number;
  /** Câu hỏi dài hơn số từ này luôn chuyển cho AI (mặc định 30). */
  maxLocalTokens?: number;
}

// ───────────────────────── Hằng số ─────────────────────────
const TITLE_KEYS = ['title', 'name', 'fullName', 'label', 'heading', 'subject', 'course', 'event', 'shortCode', 'role'];
const HIDDEN_KEYS = new Set(['id', 'key', 'slug', 'icon', 'color', 'order', 'sortOrder']);
const URL_RE = /^https?:\/\/\S+$/i;
const LINK_KEYS = /^(links?|urls?|href|uri|externalLinks?)$/i;
const GENERIC_URL_KEY = /^(url|link|href|uri)$/i;

/** Nhãn tiếng Việt cho các khóa thường gặp; khóa lạ sẽ được "người hóa" từ camelCase. */
const FIELD_LABELS: Record<string, string> = {
  name: 'Tên',
  shortCode: 'Mã',
  semester: 'Học kỳ',
  category: 'Nhóm',
  summary: 'Tóm tắt',
  highlights: 'Điểm nhấn',
  chapters: 'Chương',
  sections: 'Nội dung',
  facultyContact: 'Liên hệ giảng viên',
  title: 'Tiêu đề',
  description: 'Mô tả',
  date: 'Ngày',
  deadline: 'Hạn',
  dueDate: 'Hạn',
  time: 'Giờ',
  phone: 'SĐT',
  email: 'Email',
  zalo: 'Zalo',
  role: 'Vai trò',
  note: 'Ghi chú',
  notes: 'Ghi chú',
  location: 'Địa điểm',
  links: 'Liên kết',
  url: 'Liên kết',
};

/** Từ đệm (đã bỏ dấu) — không dùng để chấm điểm. */
const STOPWORDS = new Set(
  (
    'la cua cho toi ban va co khong the nao gi o dau nhu de trong ve voi cac nhung mot hay xin vui long ' +
    'minh em anh chi ngai quy giup hoi can muon biet lam sao nhe nha a oi ma bi se da dang nay kia do nhi ' +
    'vay roi cung nua tu den tren duoi khi hoac ai xem tim tra cuu link duong dan'
  ).split(' ')
);

/** Cụm hỏi chung chung, bỏ khỏi câu hỏi trước khi tách từ khóa. */
const NOISE_PHRASES = [
  'bao gio', 'khi nao', 'may gio', 'bao nhieu', 'o dau', 'cho nao', 'la gi',
  'thi sao', 'thi phai lam sao', 'thi lam sao', 'ra sao', 'nhu the nao', 'the nao',
].map((p) => new RegExp(`\\b${p}\\b`, 'g'));

const GREETING_WORDS = new Set(
  'xin chao hello hi hey alo cam on thanks thank you ok oke tam biet bye quan trang ai quy ngai ban'.split(' ')
);
const THANKS_WORDS = new Set(['cam', 'thanks', 'thank', 'tam', 'bye']);

/** Cụm từ báo hiệu câu hỏi cần suy luận/tổng hợp → chuyển cho AI. */
const REASONING_PHRASES = [
  'so sanh', 'khac nhau', 'giong nhau', 'uu diem', 'nhuoc diem', 'tai sao', 'vi sao', 'giai thich',
  'phan tich', 'tom tat', 'tong hop', 'co nen', 'nen chon', 'nen lam', 'goi y', 'tu van', 'lap ke hoach',
  'len ke hoach', 'sap xep', 'danh gia', 'uu tien', 'du doan', 'viet giup', 'soan giup', 'dich sang',
  'tinh diem', 'nhan xet', 'on tap the nao', 'lam sao de', 'lam the nao de',
];

// ───────────────────────── Tiện ích văn bản ─────────────────────────
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s: string): string[] {
  const n = normalize(s);
  return n ? n.split(' ') : [];
}

export function contentTokens(s: string): string[] {
  let n = ` ${normalize(s)} `;
  for (const re of NOISE_PHRASES) n = n.replace(re, ' ');
  const out = n.split(' ').filter((t) => t && !STOPWORDS.has(t));
  return [...new Set(out)];
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function humanize(key: string): string {
  const s = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const labelFor = (key: string) => FIELD_LABELS[key] ?? humanize(key);

function pickTitle(obj: Record<string, unknown>): string | undefined {
  for (const k of TITLE_KEYS) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

function flattenText(value: unknown, out: string[], depth = 0): void {
  if (depth > 6 || value == null) return;
  if (typeof value === 'string' || typeof value === 'number') out.push(String(value));
  else if (Array.isArray(value)) for (const v of value) flattenText(v, out, depth + 1);
  else if (isPlainObject(value)) for (const v of Object.values(value)) flattenText(v, out, depth + 1);
}

/** Đưa cả tên trường (vd "zalo", "email", "Hạn") vào chỉ mục để hỏi "zalo của…" vẫn khớp. */
function collectKeyWords(value: unknown, out: string[], depth = 0): void {
  if (depth > 3 || value == null) return;
  if (Array.isArray(value)) {
    for (const v of value) collectKeyWords(v, out, depth + 1);
  } else if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      if (!HIDDEN_KEYS.has(k) && k !== 'text') {
        out.push(humanize(k));
        if (FIELD_LABELS[k]) out.push(FIELD_LABELS[k]);
      }
      collectKeyWords(v, out, depth + 1);
    }
  }
}

function collectLinks(value: unknown, out: DocLink[], objLabel: string | undefined, key = '', depth = 0): void {
  if (depth > 6 || value == null) return;
  if (typeof value === 'string') {
    const url = value.trim();
    if (URL_RE.test(url)) {
      const label = GENERIC_URL_KEY.test(key) || !key ? objLabel ?? 'Liên kết' : labelFor(key);
      out.push({ label, url });
    }
  } else if (Array.isArray(value)) {
    for (const v of value) collectLinks(v, out, objLabel, key, depth + 1);
  } else if (isPlainObject(value)) {
    const label = pickTitle(value) ?? objLabel;
    for (const [k, v] of Object.entries(value)) collectLinks(v, out, label, k, depth + 1);
  }
}

// ───────────────────────── Xây chỉ mục ─────────────────────────
function makeDoc(
  section: string,
  sectionLabel: string,
  raw: Record<string, unknown>,
  fallbackTitle?: string
): IndexedDoc {
  const firstShort = Object.values(raw).find(
    (v): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 120 && !URL_RE.test(v)
  );
  const title = pickTitle(raw) ?? fallbackTitle ?? firstShort ?? sectionLabel;

  const titleText = [...TITLE_KEYS.map((k) => (typeof raw[k] === 'string' ? (raw[k] as string) : '')), fallbackTitle ?? '']
    .join(' ')
    .trim();
  const bodyParts: string[] = [sectionLabel, section];
  flattenText(raw, bodyParts);
  collectKeyWords(raw, bodyParts);

  const links: DocLink[] = [];
  collectLinks(raw, links, title);
  const seen = new Set<string>();
  const uniqueLinks = links.filter((l) => (seen.has(l.url) ? false : (seen.add(l.url), true))).slice(0, 6);

  return {
    section,
    sectionLabel,
    title,
    titleNorm: normalize(title),
    titleTokens: new Set(tokenize(titleText)),
    bodyTokens: new Set(tokenize(bodyParts.join(' '))),
    raw,
    links: uniqueLinks,
  };
}

function hasNested(v: Record<string, unknown>): boolean {
  return Object.values(v).some((x) => isPlainObject(x) || (Array.isArray(x) && x.some(isPlainObject)));
}

function collectDocs(section: string, label: string, value: unknown, out: IndexedDoc[], depth: number): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      if (isPlainObject(item)) out.push(makeDoc(section, label, item));
      else if (typeof item === 'string' && item.trim()) {
        out.push(makeDoc(section, label, { title: item.trim().slice(0, 80), text: item.trim() }));
      }
    }
  } else if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === 'string' || typeof v === 'number') {
        out.push(makeDoc(section, label, { title: humanize(k), text: String(v) }));
      } else if (Array.isArray(v)) {
        collectDocs(section, label, v, out, depth + 1);
      } else if (isPlainObject(v)) {
        if (hasNested(v) && depth < 2) collectDocs(section, label, v, out, depth + 1);
        else out.push(makeDoc(section, label, v, humanize(k)));
      }
    }
  }
}

export function buildIndex(sources: Record<string, unknown>, sectionLabels: Record<string, string> = {}): SearchIndex {
  const docs: IndexedDoc[] = [];
  for (const [section, value] of Object.entries(sources)) {
    collectDocs(section, sectionLabels[section] ?? humanize(section), value, docs, 0);
  }
  const df = new Map<string, number>();
  for (const d of docs) {
    for (const t of new Set([...d.titleTokens, ...d.bodyTokens])) df.set(t, (df.get(t) ?? 0) + 1);
  }
  return { docs, df };
}

// ───────────────────────── Tìm kiếm ─────────────────────────
export function search(index: SearchIndex, query: string, limit = 3): Hit[] {
  const qTokens = contentTokens(query);
  if (qTokens.length === 0) return [];

  const N = index.docs.length;
  const idf = (t: string) => Math.log(1 + N / (1 + (index.df.get(t) ?? 0)));
  const weights = qTokens.map(idf);
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  const paddedQuery = ` ${normalize(query)} `;

  const hits: Hit[] = [];
  for (const doc of index.docs) {
    let score = 0;
    let matched = 0;
    qTokens.forEach((t, i) => {
      if (doc.titleTokens.has(t)) {
        score += 3 * weights[i];
        matched += weights[i];
      } else if (doc.bodyTokens.has(t)) {
        score += weights[i];
        matched += weights[i];
      }
    });
    if (doc.titleNorm.length >= 4 && paddedQuery.includes(` ${doc.titleNorm} `)) score += 6;
    if (score > 0) hits.push({ doc, score, coverage: matched / totalWeight });
  }
  hits.sort((a, b) => b.score - a.score || b.coverage - a.coverage);
  return hits.slice(0, limit);
}

// ───────────────────────── Dựng câu trả lời ─────────────────────────
function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

function inline(v: unknown, depth = 0): string {
  if (v == null) return '';
  if (typeof v === 'string') return URL_RE.test(v.trim()) ? '' : v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    const items = v.map((x) => inline(x, depth + 1)).filter(Boolean);
    if (items.length === 0) return '';
    const shown = items.slice(0, 8).join('; ');
    return items.length > 8 ? `${shown}; … (+${items.length - 8})` : shown;
  }
  if (isPlainObject(v)) {
    if (depth >= 2) return pickTitle(v) ?? '';
    const titleKey = TITLE_KEYS.find((k) => typeof v[k] === 'string' && (v[k] as string).trim());
    const parts: string[] = [];
    for (const [k, x] of Object.entries(v)) {
      if (HIDDEN_KEYS.has(k) || LINK_KEYS.test(k)) continue;
      if (typeof x !== 'string' && typeof x !== 'number' && typeof x !== 'boolean') continue;
      const s = String(x).trim();
      if (!s || URL_RE.test(s)) continue;
      parts.push(k === titleKey ? s : `${labelFor(k)}: ${s}`);
    }
    return parts.join(', ');
  }
  return '';
}

function renderDoc(doc: IndexedDoc): string {
  const lines = [`**${doc.title}** — ${doc.sectionLabel}`];
  let shown = 0;
  for (const [k, v] of Object.entries(doc.raw)) {
    if (HIDDEN_KEYS.has(k) || LINK_KEYS.test(k)) continue;
    if (typeof v === 'string' && v.trim() === doc.title) continue;
    const text = inline(v);
    if (!text) continue;
    if (k === 'text') lines.push(truncate(text, 1200));
    else lines.push(`- ${labelFor(k)}: ${truncate(text, 400)}`);
    if (++shown >= 8) break;
  }
  for (const l of doc.links) lines.push(`- ${l.label}: ${l.url}`);
  return lines.join('\n');
}

export function renderHits(hits: Hit[], maxChars = 2200): string {
  if (hits.length === 0) return '';
  const top = hits[0].score;
  const full = hits.filter((h, i) => i === 0 || h.score >= top * 0.75).slice(0, 3);
  const related = hits.filter((h) => !full.includes(h) && h.score >= top * 0.4).slice(0, 3);

  const parts = full.map((h) => renderDoc(h.doc));
  if (related.length > 0) {
    parts.push(`Mục liên quan: ${related.map((h) => `${h.doc.title} (${h.doc.sectionLabel})`).join('; ')}`);
  }
  let out = parts.join('\n\n');
  if (out.length > maxChars) {
    const cut = out.lastIndexOf('\n', maxChars);
    out = `${out.slice(0, cut > 0 ? cut : maxChars).trimEnd()}\n…`;
  }
  return out;
}

// ───────────────────────── Định tuyến câu hỏi ─────────────────────────
const GREETING_REPLY =
  'Kính chào quý ngài! Tôi là Quản trang AI của The D25B Times. Quý ngài cứ hỏi về học phần, đề cương, deadline, ' +
  'BHYT, phúc khảo, gửi xe, điểm rèn luyện, đầu mối liên hệ… — các câu tra cứu tôi trả lời ngay từ dữ liệu của lớp.';
const THANKS_REPLY = 'Rất hân hạnh được hỗ trợ quý ngài. Cần tra cứu thêm điều gì, quý ngài cứ hỏi nhé!';

export function routeQuestion(index: SearchIndex, text: string, opts: RouteOptions = {}): Route {
  const { minCoverage = 0.6, minScore = 1.5, maxLocalTokens = 30 } = opts;
  const tokens = tokenize(text);

  // 1. Chào hỏi / cảm ơn → trả lời ngay, không tốn AI
  if (tokens.length > 0 && tokens.length <= 8) {
    const rest = tokens.filter((t) => !STOPWORDS.has(t) && !GREETING_WORDS.has(t));
    if (rest.length === 0 && tokens.some((t) => GREETING_WORDS.has(t))) {
      return { kind: 'greeting', reply: tokens.some((t) => THANKS_WORDS.has(t)) ? THANKS_REPLY : GREETING_REPLY };
    }
  }

  const hits = search(index, text, 5);

  // 2. Câu hỏi dài hoặc cần suy luận/tổng hợp → AI
  if (tokens.length > maxLocalTokens) return { kind: 'ai', reason: 'long', hits };
  const padded = ` ${normalize(text)} `;
  if (REASONING_PHRASES.some((p) => padded.includes(` ${p} `))) return { kind: 'ai', reason: 'reasoning', hits };

  // 3. Tra cứu: kết quả đầu đủ tốt → trả lời từ dữ liệu
  const top = hits[0];
  if (top && top.coverage >= minCoverage && top.score >= minScore) {
    return { kind: 'local', reply: renderHits(hits), hits };
  }

  // 4. Không khớp rõ → AI
  return { kind: 'ai', reason: 'no-match', hits };
}
