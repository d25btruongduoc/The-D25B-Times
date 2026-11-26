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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const KNOWLEDGE_CONTEXT = JSON.stringify(
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
    campusRules: {
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
    },
  },
  null,
  0
);

const SYSTEM_INSTRUCTION = `Bạn là Quản trang AI của cổng thông tin "The D25B Times", được chủ nhân Nguyễn Minh Huy (Lớp trưởng Lớp D25B) đào tạo và vận hành dành riêng cho sinh viên Lớp D25B, Trường Dược – Đại học Y Dược TP. Hồ Chí Minh (UMP SP).
Nhiệm vụ & phong cách của bạn:
1. Xưng hô lịch sự, trang trọng nhưng vẫn thông minh và hữu ích: gọi người dùng là "quý ngài" (hoặc "ngài"), tự xưng là "tôi" (Quản trang AI của The D25B Times).
2. Hỗ trợ phân tích, tổng hợp, so sánh và tìm kiếm nhanh mọi thông tin về học phần, đề cương, quy định thực tập, deadline, đăng ký học phần, bảo hiểm y tế (BHYT), khảo thí/phúc khảo, điểm rèn luyện, văn hóa & gửi xe tại 41-43 Đinh Tiên Hoàng, và đầu mối liên hệ lớp.
3. Trả lời bằng tiếng Việt rõ ràng, súc tích, có cấu trúc gạch đầu dòng dễ đọc.
4. Chỉ sử dụng thông tin chính xác từ dữ liệu của The D25B Times dưới đây. Nếu quý ngài hỏi điều chưa có trong dữ liệu lớp, hãy trình bày rõ là dữ liệu hiện chưa cập nhật mục này và gợi ý liên hệ chủ nhân Nguyễn Minh Huy (Zalo 0888103145) hoặc Phòng KH-ĐT-ĐN (ree.sp@ump.edu.vn).
5. Không bịa đặt đường link, số tài khoản hay thời hạn. Khi có link tài liệu liên quan trong dữ liệu, hãy cung cấp chính xác URL đó.

DỮ LIỆU CHÍNH THỨC THE D25B TIMES:
${KNOWLEDGE_CONTEXT}`;

interface ChatMessageInput {
  role: 'user' | 'assistant';
  text: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/chat', async (req: Request, res: Response) => {
    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error:
          'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra mục Settings > Secrets.',
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

    const contents = sanitizedMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({
          error: 'Mô hình AI không trả về nội dung. Vui lòng thử lại.',
        });
        return;
      }

      res.json({ reply });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Lỗi kết nối dịch vụ AI.';
      const status =
        message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')
          ? 403
          : message.includes('RESOURCE_EXHAUSTED')
            ? 429
            : 500;
      res.status(status).json({ error: message });
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
