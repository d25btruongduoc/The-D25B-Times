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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const AI_DAILY_USER_LIMIT = Math.max(1, Number(process.env.AI_DAILY_USER_LIMIT || 5));
const AI_DAILY_GLOBAL_LIMIT = Math.max(5, Number(process.env.AI_DAILY_GLOBAL_LIMIT || 50));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CORE_CAMPUS_KNOWLEDGE = {
  contacts: CONTACTS,
  registrationWindows: REGISTRATION_WINDOWS,
  scheduleClasses: SCHEDULE_CLASS_META,
  holidays: HK2_HOLIDAYS,
  campusRules: {
    address: '41-43 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM',
    parking:
      'Từ 01/01/2026 miễn phí 100% gửi xe cho SV khi xuất trình Thẻ SV (06h00-21h00 T2-T7, CN 06h00-17h00, nghỉ Lễ/Tết). Không để laptop/ví trong cốp. Tới cổng dắt bộ 5m.',
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
  },
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

function buildScopedKnowledgeContext(queryText: string): string {
  const q = queryText.toLowerCase();
  const matchedCourses = COURSES.filter((c) =>
    `${c.name} ${c.shortCode} ${c.summary}`.toLowerCase().includes(q.slice(0, 12)) ||
    q.split(/\s+/).some((tok) => tok.length >= 3 && `${c.name} ${c.shortCode}`.toLowerCase().includes(tok))
  ).slice(0, 4);

  const matchedClass = (['d25a', 'd25b', 'd25c', 'd25d'] as const).find((cls) => q.includes(cls));
  const matchedSchedule = matchedClass
    ? HK2_SCHEDULE_EVENTS.filter((e) => e.classCode.toLowerCase() === matchedClass).slice(0, 20)
    : [];

  return JSON.stringify({
    ...CORE_CAMPUS_KNOWLEDGE,
    matchedCourseDetails: matchedCourses.map((c) => ({
      name: c.name,
      shortCode: c.shortCode,
      highlights: c.highlights,
      sections: c.sections,
      links: c.links,
    })),
    ...(matchedSchedule.length > 0 ? { matchedScheduleSample: matchedSchedule } : {}),
    orientationDocsCount: ORIENTATION_DOCS.length,
    libraryCount: LIBRARY_RESOURCES.length,
    drlGuidesCount: DRL_GUIDES.length,
    externalStudyToolsCount: EXTERNAL_STUDY_TOOLS.length,
  });
}

function buildSystemInstruction(queryText: string): string {
  return `Bạn là Quản trang AI của cổng thông tin "The D25B Times" (Trường Dược – ĐHYD TP.HCM).
Phong cách: Xưng "tôi", gọi người dùng là "quý ngài". Trả lời tiếng Việt thật ngắn gọn, súc tích bằng gạch đầu dòng, tối đa ~180 chữ.
Chỉ dùng dữ liệu chính thức dưới đây; nếu thiếu hãy gợi ý liên hệ Minh Huy (Zalo 0888103145) hoặc Phòng KH-ĐT-ĐN (ree.sp@ump.edu.vn). Không bịa link hay thời hạn.

DỮ LIỆU LIÊN QUAN:
${buildScopedKnowledgeContext(queryText)}`;
}

interface ChatMessageInput {
  role: 'user' | 'assistant';
  text: string;
}

// Daily free-tier AI quota & response cache (resets every calendar day in Asia/Ho_Chi_Minh)
let quotaDateKey = '';
let globalDailyAiCount = 0;
const userDailyAiCounts = new Map<string, number>();
const dailyResponseCache = new Map<string, string>();

function getVnDateKey(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getClientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : req.ip || 'anonymous';
  return raw.trim() || 'anonymous';
}

function ensureQuotaDateCurrent(): string {
  const today = getVnDateKey();
  if (quotaDateKey !== today) {
    quotaDateKey = today;
    globalDailyAiCount = 0;
    userDailyAiCounts.clear();
    dailyResponseCache.clear();
  }
  return today;
}

function getQuotaSnapshot(clientKey: string) {
  const dateKey = ensureQuotaDateCurrent();
  const used = userDailyAiCounts.get(clientKey) || 0;
  return {
    dateKey,
    used,
    limit: AI_DAILY_USER_LIMIT,
    remaining: Math.max(0, AI_DAILY_USER_LIMIT - used),
    globalRemaining: Math.max(0, AI_DAILY_GLOBAL_LIMIT - globalDailyAiCount),
    globalLimit: AI_DAILY_GLOBAL_LIMIT,
  };
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
  app.use(express.json({ limit: '64kb' }));

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
    res.json(getQuotaSnapshot(clientKey));
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    const clientKey = getClientKey(req);
    const snapshot = getQuotaSnapshot(clientKey);

    if (snapshot.remaining <= 0) {
      res.status(429).json({
        error: `Bạn đã dùng hết ${AI_DAILY_USER_LIMIT} lượt phân tích AI miễn phí hôm nay. Bạn vẫn có thể tra cứu thông tin trực tiếp qua bộ tìm kiếm nội bộ không giới hạn và quay lại dùng AI vào ngày mai.`,
        quota: snapshot,
      });
      return;
    }

    if (snapshot.globalRemaining <= 0) {
      res.status(429).json({
        error:
          'Hệ thống đã chạm ngưỡng lượt AI miễn phí trong ngày để bảo vệ hạn mức. Vui lòng sử dụng công cụ tự dò tìm kiếm nội bộ hoặc thử lại vào ngày mai.',
        quota: snapshot,
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error:
          'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra mục Settings > Secrets.',
        quota: snapshot,
      });
      return;
    }

    const rawMessages = req.body?.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      res.status(400).json({ error: 'Yêu cầu tin nhắn không hợp lệ.' });
      return;
    }

    const sanitizedMessages: ChatMessageInput[] = rawMessages
      .slice(-10)
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

    if (sanitizedMessages.length === 0) {
      res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
      return;
    }

    const lastUserMessage =
      [...sanitizedMessages].reverse().find((m) => m.role === 'user')?.text || '';
    const cacheKey = lastUserMessage.toLowerCase().replace(/\s+/g, ' ').trim();
    const cachedReply = dailyResponseCache.get(cacheKey);
    if (cachedReply) {
      res.json({ reply: cachedReply, quota: snapshot, cached: true });
      return;
    }

    const contents = sanitizedMessages.slice(-4).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction: buildSystemInstruction(lastUserMessage),
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({
          error: 'Mô hình AI không trả về nội dung. Vui lòng thử lại.',
        });
        return;
      }

      if (cacheKey && dailyResponseCache.size < 200) {
        dailyResponseCache.set(cacheKey, reply);
      }

      globalDailyAiCount += 1;
      userDailyAiCounts.set(clientKey, (userDailyAiCounts.get(clientKey) || 0) + 1);
      const updatedQuota = getQuotaSnapshot(clientKey);

      res.json({ reply, quota: updatedQuota });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Lỗi kết nối dịch vụ AI.';
      const status =
        message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')
          ? 403
          : message.includes('RESOURCE_EXHAUSTED')
            ? 429
            : 500;
      res.status(status).json({ error: message, quota: getQuotaSnapshot(clientKey) });
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
  });
}

startServer();
