import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  APP_UPDATES,
  CONTACTS,
  COURSES,
  DEADLINES,
  DRL_GUIDES,
  DRL_LINKS,
  EXAM_FORMS,
  EXTERNAL_STUDY_TOOLS,
  HK2_HOLIDAYS,
  HK2_SCHEDULE_EVENTS,
  LIBRARY_RESOURCES,
  ORIENTATION_DOCS,
  REGISTRATION_WINDOWS,
  SCHEDULE_CLASS_META,
  SCHOOL_NOTICES,
} from './src/data/d25bData';
import {
  buildIndex,
  normalize,
  renderHits,
  routeQuestion,
  search,
  type Hit,
} from './server/localSearch';
import { createTtlCache, createUsageLimits } from './server/usageLimits';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function envNumber(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const AI_DAILY_USER_LIMIT = Math.max(
  1,
  envNumber(process.env.AI_DAILY_USER_LIMIT || process.env.AI_DAILY_LIMIT_PER_IP, 5)
);
const AI_DAILY_GLOBAL_LIMIT = Math.max(
  5,
  envNumber(process.env.AI_DAILY_GLOBAL_LIMIT || process.env.AI_DAILY_LIMIT_GLOBAL, 50)
);
const CHAT_REQUESTS_PER_MINUTE = Math.max(
  5,
  envNumber(process.env.CHAT_REQUESTS_PER_MINUTE, 20)
);
const AI_HISTORY_MESSAGES = Math.max(2, envNumber(process.env.AI_HISTORY_MESSAGES, 4));
const AI_MAX_OUTPUT_TOKENS = Math.max(250, envNumber(process.env.AI_MAX_OUTPUT_TOKENS, 700));
const TRUST_PROXY_HOPS = envNumber(process.env.TRUST_PROXY_HOPS, 1);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CAMPUS_RULES = {
  address: '41-43 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM',
  parking:
    'Từ 01/01/2026 miễn phí 100% gửi xe cho SV khi xuất trình Thẻ SV (06h00-21h00 T2-T7, CN 06h00-17h00, nghỉ Lễ/Tết). Không để laptop/ví trong cốp. Tới cổng dắt bộ 5m. Dịp lễ gửi tại Diamond Plaza, KHXHNV, Hoa Lư hoặc Thảo Cầm Viên.',
  unionOffice:
    'VP Đoàn TN - Hội SV (T2-T6, 08h00-16h30): mượn áo Blouse, mũ BH, bơm xe miễn phí, in ấn 250đ/tờ (tối đa 20 tờ/lần).',
  blouseAndLab:
    'Không mặc Blouse ra đường. Chuẩn bị 2 áo Blouse. PTN bắt buộc giày/dép kín mũi; bộ môn Hóa yêu cầu cắt ngắn móng tay, không nails giả.',
  bhyt:
    'BHYT 9 tháng (01/04/2026-31/12/2026), hạn 16h00 20/03/2026, mức đóng 473.850đ. Form https://forms.office.com/r/KMcXuG6ytD. CK Vietcombank 0511000099999 (CN Sài Thành) hoặc Vietinbank 112000093351 (CN 5), cú pháp: BHYT MSSV HO VA TEN.',
  examRegrading:
    'Phúc khảo trong vòng 7 ngày từ ngày công bố điểm. Nộp đơn trực tiếp Phòng KH-ĐT-ĐN (sảnh tầng trệt tòa hành chính, cạnh Vườn Dược Liệu).',
  hpt1Report:
    'Báo cáo TH HPT1 viết tay 100%, ghép 1 PDF nộp OneDrive + Form trong 24h. Tên file: THHPT1_D25_Nhóm_Mã bài_STT_Họ Tên_MSSV.',
  ptn2Rules:
    'TT Hóa Lý Dược (PTN 2 - BM CNDP): Ca sáng 7h30, chiều 13h00. Trễ >15 phút tính vắng.',
};

const CORE_CAMPUS_KNOWLEDGE = {
  contacts: CONTACTS,
  registrationWindows: REGISTRATION_WINDOWS,
  scheduleClasses: SCHEDULE_CLASS_META,
  holidays: HK2_HOLIDAYS,
  campusRules: CAMPUS_RULES,
  deadlinesSummary: DEADLINES.map((d) => ({
    title: d.title,
    dueLabel: d.dueLabel,
    summary: d.summary,
    url: d.externalUrl || d.links?.[0]?.url,
  })),
  coursesSummary: COURSES.map((c) => ({
    name: c.name,
    shortCode: c.shortCode,
    semester: c.semester,
    summary: c.summary,
    highlights: c.highlights,
  })),
  examForms: EXAM_FORMS.map((e) => ({ title: e.title, note: e.note, url: e.url })),
  drlLinks: DRL_LINKS,
  noticesSummary: SCHOOL_NOTICES.map((n) => ({
    title: n.title,
    date: n.dateLabel,
    summary: n.summary,
  })),
};

// Local IDF search index across all official datasets (used both for zero-AI lookup and compact AI grounding)
const SECTION_LABELS: Record<string, string> = {
  contacts: 'Liên hệ',
  deadlines: 'Deadline',
  appUpdates: 'Cập nhật ứng dụng',
  schoolNotices: 'Thông báo trường',
  registrationWindows: 'Đăng ký học phần',
  hk2Schedule2026_2027: 'Lịch học HK2',
  courses: 'Học phần',
  examForms: 'Biểu mẫu khảo thí',
  orientationDocs: 'Tài liệu định hướng',
  drlLinks: 'Điểm rèn luyện',
  drlGuides: 'Hướng dẫn ĐRL',
  library: 'Thư viện',
  externalStudyTools: 'Công cụ học tập',
  campusRules: 'Quy định & tiện ích',
};

const CAMPUS_RULE_TITLES: Record<keyof typeof CAMPUS_RULES, string> = {
  address: 'Địa chỉ trường',
  parking: 'Gửi xe',
  unionOffice: 'Văn phòng Đoàn – Hội SV',
  blouseAndLab: 'Áo Blouse & phòng thí nghiệm',
  bhyt: 'Bảo hiểm y tế (BHYT)',
  examRegrading: 'Phúc khảo',
  hpt1Report: 'Báo cáo thực hành Hóa Phân Tích 1',
  ptn2Rules: 'Quy định PTN 2 (Hóa Lý Dược)',
};

const searchIndex = buildIndex(
  {
    contacts: CONTACTS,
    deadlines: DEADLINES,
    appUpdates: APP_UPDATES,
    schoolNotices: SCHOOL_NOTICES,
    registrationWindows: REGISTRATION_WINDOWS,
    hk2Schedule2026_2027: {
      classes: SCHEDULE_CLASS_META,
      holidays: HK2_HOLIDAYS,
      events: HK2_SCHEDULE_EVENTS,
    },
    courses: COURSES.map((c) => ({
      name: c.name,
      shortCode: c.shortCode,
      semester: c.semester,
      category: c.category,
      summary: c.summary,
      highlights: c.highlights,
      chapters: c.chapters,
      sections: c.sections,
      facultyContact: c.facultyContact,
      links: c.links,
    })),
    examForms: EXAM_FORMS,
    orientationDocs: ORIENTATION_DOCS,
    drlLinks: DRL_LINKS,
    drlGuides: DRL_GUIDES,
    library: LIBRARY_RESOURCES,
    externalStudyTools: EXTERNAL_STUDY_TOOLS,
    campusRules: (Object.keys(CAMPUS_RULES) as Array<keyof typeof CAMPUS_RULES>).map((key) => ({
      title: CAMPUS_RULE_TITLES[key],
      text: CAMPUS_RULES[key],
    })),
  },
  SECTION_LABELS
);

function buildScopedKnowledgeContext(queryText: string, hits: Hit[]): string {
  const retrievedHits = (hits.length > 0 ? hits : search(searchIndex, queryText, 6)).map((h) => ({
    nhom: h.doc.sectionLabel,
    ...h.doc.raw,
  }));

  return JSON.stringify({
    ...CORE_CAMPUS_KNOWLEDGE,
    retrievedDetails: retrievedHits,
  });
}

function buildSystemInstruction(queryText: string, hits: Hit[]): string {
  return `Bạn là Quản trang AI của cổng thông tin "The D25B Times" (Trường Dược – ĐHYD TP.HCM).
Phong cách: Xưng "tôi", gọi người dùng là "quý ngài". Trả lời tiếng Việt thật ngắn gọn, súc tích bằng gạch đầu dòng, tối đa ~180 chữ.
Chỉ dùng dữ liệu chính thức dưới đây; nếu thiếu hãy gợi ý liên hệ Minh Huy (Zalo 0888103145) hoặc Phòng KH-ĐT-ĐN (ree.sp@ump.edu.vn). Không bịa link hay thời hạn.

DỮ LIỆU LIÊN QUAN:
${buildScopedKnowledgeContext(queryText, hits)}`;
}

interface ChatMessageInput {
  role: 'user' | 'assistant';
  text: string;
}

const limits = createUsageLimits({
  aiPerIpPerDay: AI_DAILY_USER_LIMIT,
  aiGlobalPerDay: AI_DAILY_GLOBAL_LIMIT,
  requestsPerMinute: CHAT_REQUESTS_PER_MINUTE,
});

// Cache identical single-turn AI responses for 24h to conserve free-tier quota
const aiCache = createTtlCache<string>(250, 24 * 60 * 60_000);

function getClientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : req.ip || 'anonymous';
  return raw.trim() || 'anonymous';
}

function readPublicFirebaseConfig(): Record<string, string> | null {
  const envApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  const envProjectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const envAppId = process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID;
  const envAuthDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN;

  if (envApiKey && envProjectId && envAppId && envAuthDomain) {
    return {
      apiKey: envApiKey,
      projectId: envProjectId,
      appId: envAppId,
      authDomain: envAuthDomain,
      firestoreDatabaseId:
        process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
        process.env.FIREBASE_FIRESTORE_DATABASE_ID ||
        '',
      storageBucket:
        process.env.VITE_FIREBASE_STORAGE_BUCKET ||
        process.env.FIREBASE_STORAGE_BUCKET ||
        '',
      messagingSenderId:
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.FIREBASE_MESSAGING_SENDER_ID ||
        '',
    };
  }

  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Record<string, string>;
      return {
        apiKey: raw.apiKey || '',
        projectId: raw.projectId || '',
        appId: raw.appId || '',
        authDomain: raw.authDomain || '',
        firestoreDatabaseId: raw.firestoreDatabaseId || '',
        storageBucket: raw.storageBucket || '',
        messagingSenderId: raw.messagingSenderId || '',
      };
    } catch {
      return null;
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', TRUST_PROXY_HOPS);
  app.use(express.json({ limit: '64kb' }));

  const sweepTimer = setInterval(() => limits.sweep(), 10 * 60_000);
  (sweepTimer as unknown as { unref?: () => void }).unref?.();

  // Runtime public Firebase client configuration endpoint (keeps keys out of Git)
  app.get('/api/firebase-config', (_req: Request, res: Response) => {
    const config = readPublicFirebaseConfig();
    if (!config || !config.apiKey) {
      res.status(404).json({ error: 'Chưa cấu hình Firebase cho môi trường này.' });
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json(config);
  });

  app.get('/api/ai-quota', (req: Request, res: Response) => {
    const clientKey = getClientKey(req);
    res.json(limits.peek(clientKey));
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    const clientKey = getClientKey(req);

    if (!limits.allowRequest(clientKey)) {
      res.status(429).json({
        error: 'Quý ngài gửi yêu cầu quá nhanh. Vui lòng đợi khoảng một phút rồi hỏi tiếp.',
        quota: limits.peek(clientKey),
      });
      return;
    }

    const rawMessages = req.body?.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      res.status(400).json({ error: 'Yêu cầu tin nhắn không hợp lệ.' });
      return;
    }

    const sanitizedMessages: ChatMessageInput[] = rawMessages
      .slice(-AI_HISTORY_MESSAGES)
      .filter(
        (m): m is ChatMessageInput =>
          Boolean(m) &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.text === 'string' &&
          m.text.trim().length > 0
      )
      .map((m) => ({
        role: m.role,
        text: m.text.trim().slice(0, 2000),
      }));

    // Ensure Gemini history begins with a user turn
    while (sanitizedMessages.length > 0 && sanitizedMessages[0].role !== 'user') {
      sanitizedMessages.shift();
    }

    const lastUserMessage = sanitizedMessages[sanitizedMessages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
      return;
    }

    const forceAi = req.body?.forceAi === true;
    const route = routeQuestion(searchIndex, lastUserMessage.text);

    // 1) Zero-token server-side defense for greetings & local lookups (unless user explicitly requested deep AI analysis)
    if (!forceAi && route.kind !== 'ai') {
      res.json({
        reply: route.reply,
        source: 'local',
        quota: limits.peek(clientKey),
      });
      return;
    }

    const hits = route.kind === 'ai' ? route.hits : search(searchIndex, lastUserMessage.text, 5);
    const fallbackText = renderHits(hits);

    // 2) Reuse 24h TTL cache for identical single-turn prompts
    const cacheKey = normalize(lastUserMessage.text);
    const cachedReply = cacheKey ? aiCache.get(cacheKey) : undefined;
    if (cachedReply) {
      res.json({
        reply: cachedReply,
        source: 'cache',
        cached: true,
        quota: limits.peek(clientKey),
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      if (fallbackText) {
        res.json({
          reply: `Mục gần nhất tôi tìm được trong dữ liệu lớp (chưa bật GEMINI_API_KEY):\n\n${fallbackText}`,
          source: 'local-fallback',
          quota: limits.peek(clientKey),
        });
        return;
      }
      res.status(503).json({
        error:
          'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra mục Settings > Secrets.',
        quota: limits.peek(clientKey),
      });
      return;
    }

    // 3) Check & reserve daily quota before calling Gemini (refunded on API error)
    const usage = limits.tryConsumeAi(clientKey);
    if (!usage.ok) {
      const notice =
        usage.reason === 'global'
          ? 'Hệ thống đã chạm ngưỡng lượt AI miễn phí trong ngày để bảo vệ hạn mức (làm mới lúc 00:00 giờ Việt Nam).'
          : `Bạn đã dùng hết ${AI_DAILY_USER_LIMIT} lượt phân tích AI miễn phí hôm nay (làm mới lúc 00:00 giờ Việt Nam).`;
      if (fallbackText) {
        res.json({
          reply: `${notice}\n\nDưới đây là mục gần nhất hệ thống tự dò được:\n\n${fallbackText}`,
          source: 'quota',
          quota: {
            dateKey: usage.dateKey,
            used: usage.used,
            limit: usage.limit,
            remaining: usage.remaining,
            globalRemaining: usage.globalRemaining,
            globalLimit: usage.globalLimit,
          },
        });
        return;
      }
      res.status(429).json({
        error: `${notice} Bạn vẫn có thể tra cứu thông tin trực tiếp qua bộ tìm kiếm nội bộ không giới hạn.`,
        quota: {
          dateKey: usage.dateKey,
          used: usage.used,
          limit: usage.limit,
          remaining: usage.remaining,
          globalRemaining: usage.globalRemaining,
          globalLimit: usage.globalLimit,
        },
      });
      return;
    }

    const contents = sanitizedMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: buildSystemInstruction(lastUserMessage.text, hits),
          maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        limits.refundAi(clientKey);
        res.status(502).json({
          error: 'Mô hình AI không trả về nội dung. Vui lòng thử lại.',
          quota: limits.peek(clientKey),
        });
        return;
      }

      if (cacheKey) aiCache.set(cacheKey, reply);
      res.json({
        reply,
        source: 'ai',
        quota: limits.peek(clientKey),
      });
    } catch (err: unknown) {
      limits.refundAi(clientKey);
      const message = err instanceof Error ? err.message : String(err);
      console.error('[api/chat] Gemini error:', message);
      if (message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')) {
        res.status(403).json({
          error: 'Dịch vụ AI từ chối yêu cầu. Chủ trang vui lòng kiểm tra khóa API.',
          quota: limits.peek(clientKey),
        });
      } else if (message.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error: 'Dịch vụ AI đang quá tải hoặc đã hết hạn mức. Vui lòng thử lại sau.',
          quota: limits.peek(clientKey),
        });
      } else {
        res.status(500).json({
          error: 'Lỗi kết nối dịch vụ AI. Vui lòng thử lại.',
          quota: limits.peek(clientKey),
        });
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The D25B Times server running on http://0.0.0.0:${PORT}`);
    console.log(
      `[chat] ${searchIndex.docs.length} mục tra cứu cục bộ · AI: ${AI_DAILY_LIMIT_PER_IP_LABEL()}`
    );
  });
}

function AI_DAILY_LIMIT_PER_IP_LABEL() {
  return `${AI_DAILY_USER_LIMIT}/user/ngày, ${AI_DAILY_GLOBAL_LIMIT}/ngày toàn hệ thống · ${AI_MAX_OUTPUT_TOKENS} max output tokens`;
}

startServer();
