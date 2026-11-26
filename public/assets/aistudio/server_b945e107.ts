import 'dotenv/config';
import express, { Request, Response } from 'express';
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
import { buildIndex, normalize, renderHits, routeQuestion, search, type Hit } from './server/localSearch';
import { createTtlCache, createUsageLimits } from './server/usageLimits';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

// ───────────────────────── Cấu hình hạn mức (đổi qua biến môi trường) ─────────────────────────
function envNumber(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Mô hình Gemini. Đặt GEMINI_MODEL để đổi mà không cần sửa code. */
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-4-hydrogen';
/** Số lượt hỏi AI tối đa mỗi IP mỗi ngày (giờ Việt Nam). Tra cứu cục bộ KHÔNG bị tính. */
const AI_DAILY_LIMIT_PER_IP = envNumber(process.env.AI_DAILY_LIMIT_PER_IP, 8);
/** Trần lượt hỏi AI của TOÀN hệ thống mỗi ngày — lớp bảo vệ chính cho hạn mức Gemini. */
const AI_DAILY_LIMIT_GLOBAL = envNumber(process.env.AI_DAILY_LIMIT_GLOBAL, 300);
/** Số request /api/chat tối đa mỗi IP mỗi phút (chống spam, áp dụng cả tra cứu cục bộ). */
const CHAT_REQUESTS_PER_MINUTE = envNumber(process.env.CHAT_REQUESTS_PER_MINUTE, 20);
/** Số tin nhắn gần nhất gửi kèm cho AI. */
const AI_HISTORY_MESSAGES = envNumber(process.env.AI_HISTORY_MESSAGES, 6);
/** Giới hạn độ dài câu trả lời AI (token). */
const AI_MAX_OUTPUT_TOKENS = envNumber(process.env.AI_MAX_OUTPUT_TOKENS, 900);
/**
 * 'full'      : gửi toàn bộ dữ liệu lớp cho AI mỗi lượt (như trước đây).
 * 'retrieved' : chỉ gửi các mục liên quan nhất tới câu hỏi → ít token hơn nhiều, nhưng AI có thể thiếu dữ liệu.
 */
const AI_CONTEXT_MODE: 'full' | 'retrieved' = process.env.AI_CONTEXT_MODE === 'retrieved' ? 'retrieved' : 'full';
/** Số lớp proxy đứng trước server (để lấy đúng IP người dùng). 0 nếu chạy trực tiếp. */
const TRUST_PROXY_HOPS = envNumber(process.env.TRUST_PROXY_HOPS, 1);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ───────────────────────── Dữ liệu tri thức ─────────────────────────
const CAMPUS_RULES = {
  address: '41-43 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM',
  parking:
    'Từ 01/01/2026 miễn phí 100% gửi xe cho sinh viên, học viên khi xuất trình Thẻ SV/HV (học viên khóa chuyên đề ngắn hạn hoặc khách tập thể thao 4.000đ/lượt). Giờ mở cửa nhà xe: T2-T7 06h00-21h00, CN 06h00-17h00 (nghỉ Lễ, Tết). Không để laptop/ví tiền trong cốp xe; mất thẻ cần CCCD + Giấy tờ xe + Thẻ SV. Tới cổng dắt bộ 5m (ngày mưa chạy thẳng). Có máy bơm lốp miễn phí trước khu tự học. Dịp lễ gửi tại Diamond Plaza, KHXHNV, Hoa Lư hoặc Thảo Cầm Viên (đóng cửa 17-19h).',
  unionOffice:
    'Văn phòng Đoàn TN - Hội SV Trường Dược mở cửa T2-T6 (08h00-16h30): cho mượn áo Blouse, mũ bảo hiểm, bơm bánh xe miễn phí, phòng họp nhóm, in ấn giá sinh viên 250đ/tờ tối đa 20 tờ/lần (từ 12/01/2026).',
  blouseAndLab:
    'Tuyệt đối cấm mặc áo Blouse ra đường, chỉ mặc trong khuôn viên trường. Chuẩn bị 2 áo Blouse (trường phát 1 áo miễn phí ngày Lễ Khoác Áo Blouse). Vào phòng thí nghiệm bắt buộc mang giày/dép kín mũi chân; các bộ môn Hóa yêu cầu cắt ngắn móng tay, không dùng nails giả.',
  bhyt:
    'BHYT đợt 9 tháng (01/04/2026 - 31/12/2026), hạn 16h00 ngày 20/03/2026. Mức đóng: 473.850đ. Bước 1: Điền form https://forms.office.com/r/KMcXuG6ytD. Bước 2: Chuyển khoản ĐHYD TP.HCM (Vietcombank 0511000099999 CN Sài Thành hoặc Vietinbank 112000093351 CN 5) với cú pháp BHYT MSSV HO VA TEN. Dùng ảnh thẻ trên VssID.',
  examRegrading:
    'Phúc khảo trong vòng 7 ngày kể từ ngày công bố điểm. Nộp đơn trực tiếp tại Phòng KH-ĐT-ĐN (sảnh tầng trệt tòa hành chính, một bên Vườn Dược Liệu, đối diện cửa chính), không cần qua lớp trưởng.',
  hpt1Report:
    'Báo cáo TH Hóa Phân Tích 1 viết tay 100%, ghép thành 1 file PDF upload OneDrive và nộp Form trong vòng 24 giờ kể từ buổi thực hành. Tên file chuẩn: THHPT1_D25_Nhóm_Mã bài_STT_Họ Tên_MSSV. Luôn bấm "Lưu câu trả lời của tôi để chỉnh sửa".',
  ptn2Rules:
    'Thực tập Hóa Lý Dược tại PTN 2 - BM CNDP: Ca sáng 7h30, Ca chiều 13h00. Đi trễ quá 15 phút xem như vắng. Chuẩn bị đủ 7 bước trước khi đến lớp.',
};

const KNOWLEDGE = {
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
  campusRules: CAMPUS_RULES,
};

const KNOWLEDGE_CONTEXT = JSON.stringify(KNOWLEDGE, null, 0);

function buildSystemInstruction(context: string, partial = false): string {
  return `Bạn là Quản trang AI của cổng thông tin "The D25B Times", được chủ nhân Nguyễn Minh Huy (Lớp trưởng Lớp D25B) đào tạo và vận hành dành riêng cho sinh viên Lớp D25B, Trường Dược – Đại học Y Dược TP. Hồ Chí Minh (UMP SP).
Nhiệm vụ & phong cách của bạn:
1. Xưng hô lịch sự, trang trọng nhưng vẫn thông minh và hữu ích: gọi người dùng là "quý ngài" (hoặc "ngài"), tự xưng là "tôi" (Quản trang AI của The D25B Times).
2. Hỗ trợ phân tích, tổng hợp, so sánh và tìm kiếm nhanh mọi thông tin về học phần, đề cương, quy định thực tập, deadline, đăng ký học phần, bảo hiểm y tế (BHYT), khảo thí/phúc khảo, điểm rèn luyện, văn hóa & gửi xe tại 41-43 Đinh Tiên Hoàng, và đầu mối liên hệ lớp.
3. Trả lời bằng tiếng Việt rõ ràng, súc tích, có cấu trúc gạch đầu dòng dễ đọc.
4. Chỉ sử dụng thông tin chính xác từ dữ liệu của The D25B Times dưới đây. Nếu quý ngài hỏi điều chưa có trong dữ liệu lớp, hãy trình bày rõ là dữ liệu hiện chưa cập nhật mục này và gợi ý liên hệ chủ nhân Nguyễn Minh Huy (Zalo 0888103145) hoặc Phòng KH-ĐT-ĐN (ree.sp@ump.edu.vn).
5. Không bịa đặt đường link, số tài khoản hay thời hạn. Khi có link tài liệu liên quan trong dữ liệu, hãy cung cấp chính xác URL đó.

${partial ? 'DỮ LIỆU THE D25B TIMES LIÊN QUAN NHẤT TỚI CÂU HỎI (chỉ là phần trích; nếu thiếu thông tin thì nói dữ liệu hiện chưa cập nhật mục này):' : 'DỮ LIỆU CHÍNH THỨC THE D25B TIMES:'}
${context}`;
}

const FULL_SYSTEM_INSTRUCTION = buildSystemInstruction(KNOWLEDGE_CONTEXT);

// ───────────────────────── Chỉ mục tra cứu cục bộ (không dùng AI) ─────────────────────────
const SECTION_LABELS: Record<string, string> = {
  contacts: 'Liên hệ',
  deadlines: 'Deadline',
  appUpdates: 'Cập nhật ứng dụng',
  schoolNotices: 'Thông báo của trường',
  registrationWindows: 'Đăng ký học phần',
  hk2Schedule2026_2027: 'Lịch học HK2',
  courses: 'Học phần',
  examForms: 'Biểu mẫu khảo thí',
  orientationDocs: 'Tài liệu định hướng',
  drlLinks: 'Điểm rèn luyện',
  drlGuides: 'Hướng dẫn điểm rèn luyện',
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
    ...KNOWLEDGE,
    // campusRules là các đoạn văn: đổi sang dạng {title, text} để tra cứu bằng tiếng Việt
    campusRules: (Object.keys(CAMPUS_RULES) as Array<keyof typeof CAMPUS_RULES>).map((key) => ({
      title: CAMPUS_RULE_TITLES[key],
      text: CAMPUS_RULES[key],
    })),
  },
  SECTION_LABELS
);

// ───────────────────────── Giới hạn & cache ─────────────────────────
const limits = createUsageLimits({
  aiPerIpPerDay: AI_DAILY_LIMIT_PER_IP,
  aiGlobalPerDay: AI_DAILY_LIMIT_GLOBAL,
  requestsPerMinute: CHAT_REQUESTS_PER_MINUTE,
});
// Cùng một câu hỏi đơn lẻ trong 1 giờ → dùng lại câu trả lời, không tốn lượt AI.
const aiCache = createTtlCache<string>(200, 60 * 60_000);

function retrievedContext(hits: Hit[]): string {
  return JSON.stringify(hits.map((h) => ({ nhom: h.doc.sectionLabel, ...h.doc.raw })));
}

interface ChatMessageInput {
  role: 'user' | 'assistant';
  text: string;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', TRUST_PROXY_HOPS);
  app.use(express.json({ limit: '64kb' }));

  const sweepTimer = setInterval(() => limits.sweep(), 10 * 60_000);
  (sweepTimer as unknown as { unref?: () => void }).unref?.();

  app.post('/api/chat', async (req: Request, res: Response) => {
    const ip = req.ip || 'unknown';

    if (!limits.allowRequest(ip)) {
      res.status(429).json({ error: 'Quý ngài gửi yêu cầu quá nhanh. Vui lòng đợi khoảng một phút rồi hỏi tiếp.' });
      return;
    }

    const rawMessages = req.body?.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      res.status(400).json({ error: 'Yêu cầu tin nhắn không hợp lệ.' });
      return;
    }

    const sanitizedMessages: ChatMessageInput[] = rawMessages
      .slice(-Math.max(1, AI_HISTORY_MESSAGES))
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

    // Hội thoại gửi cho Gemini phải bắt đầu bằng lượt của người dùng
    while (sanitizedMessages.length > 0 && sanitizedMessages[0].role !== 'user') sanitizedMessages.shift();

    const last = sanitizedMessages[sanitizedMessages.length - 1];
    if (!last || last.role !== 'user') {
      res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
      return;
    }

    // 1) Chào hỏi & tra cứu: trả lời thẳng từ dữ liệu lớp, KHÔNG tốn lượt AI
    const route = routeQuestion(searchIndex, last.text);
    if (route.kind !== 'ai') {
      res.json({ reply: route.reply, source: 'local', quota: limits.peek(ip) });
      return;
    }

    // 2) Cùng câu hỏi đơn lẻ đã được AI trả lời gần đây
    const cacheKey = sanitizedMessages.length === 1 ? normalize(last.text) : null;
    const cached = cacheKey ? aiCache.get(cacheKey) : undefined;
    if (cached) {
      res.json({ reply: cached, source: 'cache', quota: limits.peek(ip) });
      return;
    }

    const fallbackText = renderHits(route.hits);

    if (!process.env.GEMINI_API_KEY) {
      if (fallbackText) {
        res.json({
          reply: `Mục gần nhất tôi tìm được trong dữ liệu lớp:\n\n${fallbackText}`,
          source: 'local-fallback',
          quota: limits.peek(ip),
        });
        return;
      }
      res.status(503).json({
        error:
          'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra mục Settings > Secrets.',
      });
      return;
    }

    // 3) Câu hỏi cần AI: kiểm tra hạn mức trước khi gọi
    const usage = limits.tryConsumeAi(ip);
    if (!usage.ok) {
      const notice =
        usage.reason === 'global'
          ? 'Hôm nay hệ thống đã dùng hết hạn mức AI chung của lớp (làm mới lúc 00:00 giờ Việt Nam).'
          : `Quý ngài đã dùng hết ${usage.limit} lượt hỏi AI trong hôm nay (làm mới lúc 00:00 giờ Việt Nam).`;
      const reply = fallbackText
        ? `${notice} Dưới đây là mục gần nhất tôi tìm được trong dữ liệu lớp:\n\n${fallbackText}`
        : `${notice} Các câu tra cứu trực tiếp như liên hệ, deadline, quy định, link tài liệu… vẫn dùng được bình thường.`;
      res.json({ reply, source: 'quota', quota: { limit: usage.limit, remaining: usage.remaining } });
      return;
    }

    const contents = sanitizedMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    let systemInstruction = FULL_SYSTEM_INSTRUCTION;
    if (AI_CONTEXT_MODE === 'retrieved') {
      const recentUserText = sanitizedMessages
        .filter((m) => m.role === 'user')
        .slice(-2)
        .map((m) => m.text)
        .join(' ');
      systemInstruction = buildSystemInstruction(retrievedContext(search(searchIndex, recentUserText, 8)), true);
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        limits.refundAi(ip);
        res.status(502).json({
          error: 'Mô hình AI không trả về nội dung. Vui lòng thử lại.',
        });
        return;
      }

      if (cacheKey) aiCache.set(cacheKey, reply);
      res.json({ reply, source: 'ai', quota: limits.peek(ip) });
    } catch (err: unknown) {
      limits.refundAi(ip);
      const message = err instanceof Error ? err.message : String(err);
      console.error('[api/chat] Gemini error:', message);
      // Không trả nguyên văn lỗi nội bộ về cho người dùng
      if (message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')) {
        res.status(403).json({ error: 'Dịch vụ AI từ chối yêu cầu. Chủ trang vui lòng kiểm tra khóa API.' });
      } else if (message.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({ error: 'Dịch vụ AI đang quá tải hoặc đã hết hạn mức. Vui lòng thử lại sau.' });
      } else {
        res.status(500).json({ error: 'Lỗi kết nối dịch vụ AI. Vui lòng thử lại.' });
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
      `[chat] ${searchIndex.docs.length} mục tra cứu cục bộ · AI: ${AI_DAILY_LIMIT_PER_IP}/IP/ngày, ${AI_DAILY_LIMIT_GLOBAL}/ngày toàn hệ thống · ngữ cảnh: ${AI_CONTEXT_MODE}`
    );
  });
}

startServer();
