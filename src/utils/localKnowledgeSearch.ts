import {
  CONTACTS,
  COURSES,
  DEADLINES,
  DRL_GUIDES,
  DRL_LINKS,
  EXAM_FORMS,
  HandbookTab,
  HK2_SCHEDULE_EVENTS,
  LIBRARY_RESOURCES,
  NavSection,
  ORIENTATION_DOCS,
  REGISTRATION_WINDOWS,
  SCHOOL_NOTICES,
  SEARCH_INDEX,
  SearchIndexItem,
} from '../data/d25bData';

export interface LocalSearchResolution {
  handledLocally: boolean;
  answerText: string;
  relatedItems: SearchIndexItem[];
}

const REASONING_TRIGGERS = [
  'so sánh',
  'phân tích',
  'giải thích',
  'tại sao',
  'vì sao',
  'lập kế hoạch',
  'lộ trình',
  'tổng hợp',
  'tóm tắt',
  'tư vấn',
  'gợi ý cách',
  'phân biệt',
  'đánh giá',
  'nên chọn',
  'kinh nghiệm',
  'chiến lược',
  'viết giúp',
  'tính toán',
];

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export function isReasoningQuery(queryText: string): boolean {
  const lower = queryText.toLowerCase();
  return REASONING_TRIGGERS.some((kw) => lower.includes(kw));
}

export function findRelatedLinks(queryText: string): SearchIndexItem[] {
  const rawTokens = queryText
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  if (rawTokens.length === 0) return [];

  const normTokens = normalizeText(queryText)
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  return SEARCH_INDEX.map((item) => {
    const haystack = `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase();
    const normHaystack = normalizeText(haystack);

    let score = 0;
    for (const t of rawTokens) {
      if (haystack.includes(t)) score += 2;
    }
    for (const nt of normTokens) {
      if (normHaystack.includes(nt)) score += 1;
    }
    return { item, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.item);
}

const TOPIC_RULES: {
  id: string;
  keywords: string[];
  answer: string;
  target: { section: NavSection; handbookTab?: HandbookTab; courseId?: string };
  title: string;
}[] = [
  {
    id: 'phuc-khao',
    title: 'Đơn & Quy chế phúc khảo điểm thi',
    keywords: ['phuc khao', 'cham lai', 'kh-dt-dn', 'khao thi', 'xin xem bai'],
    target: { section: 'handbook', handbookTab: 'exam' },
    answer:
      '• Thời hạn phúc khảo: Trong vòng **7 ngày** kể từ ngày công bố điểm.\n• Nơi nộp đơn trực tiếp: Phòng KH-ĐT-ĐN (sảnh tầng trệt tòa hành chính, một bên Vườn Dược Liệu, đối diện cửa chính — không cần qua lớp trưởng).\n• Email Phòng KH-ĐT-ĐN: ree.sp@ump.edu.vn\n• Biểu mẫu & chi tiết đã có sẵn trong mục Cẩm nang → Khảo thí.',
  },
  {
    id: 'bhyt',
    title: 'Hướng dẫn BHYT 9 tháng (473.850đ)',
    keywords: ['bhyt', 'bao hiem y te', '473850', '473.850', 'vssid', 'chuyen khoan'],
    target: { section: 'handbook', handbookTab: 'bhyt' },
    answer:
      '• BHYT đợt 9 tháng (01/04/2026 – 31/12/2026): mức đóng **473.850đ** (hạn 16h00 ngày 20/03/2026).\n• Bước 1: Điền form: https://forms.office.com/r/KMcXuG6ytD\n• Bước 2: Chuyển khoản ĐHYD TP.HCM — Vietcombank `0511000099999` (CN Sài Thành) hoặc Vietinbank `112000093351` (CN 5), cú pháp: `BHYT MSSV HO VA TEN`.\n• Ảnh thẻ BHYT xem trực tiếp trên ứng dụng VssID.',
  },
  {
    id: 'gui-xe',
    title: 'Nhà xe & Bãi đỗ tại 41–43 Đinh Tiên Hoàng',
    keywords: ['gui xe', 'nha xe', 'bai do', 'bom lop', 'thao cam vien', 'diamond plaza', 'the sinh vien'],
    target: { section: 'handbook', handbookTab: 'campus' },
    answer:
      '• Từ 01/01/2026: **Miễn phí 100%** gửi xe cho sinh viên khi xuất trình Thẻ SV (không để laptop/ví tiền trong cốp xe).\n• Giờ mở cửa: T2–T7 `06h00–21h00`, CN `06h00–17h00` (nghỉ Lễ, Tết). Qua cổng dắt bộ 5m.\n• Có máy bơm lốp miễn phí trước khu tự học. Dịp lễ có thể gửi tại Diamond Plaza, ĐH KHXH&NV, SVĐ Hoa Lư hoặc Thảo Cầm Viên (đóng 17–19h).',
  },
  {
    id: 'blouse',
    title: 'Quy định áo Blouse & Văn hóa phòng thí nghiệm',
    keywords: ['blouse', 'ao blouse', 'phong thi nghiem', 'giay kin mui', 'nails', 'mong tay'],
    target: { section: 'handbook', handbookTab: 'campus' },
    answer:
      '• Tuyệt đối không mặc áo Blouse ra đường; chỉ mặc trong khuôn viên trường.\n• Chuẩn bị ít nhất 2 áo Blouse (trường phát miễn phí 1 áo dịp Lễ Khoác Áo Blouse); có thể mượn tại VP Đoàn TN – Hội SV (T2–T6, 08h00–16h30).\n• Phòng thí nghiệm bắt buộc mang giày/dép kín mũi chân; các bộ môn Hóa yêu cầu cắt ngắn móng tay, không dùng nails giả.',
  },
  {
    id: 'drl',
    title: 'Điểm rèn luyện & Sinh viên 5 Tốt',
    keywords: ['drl', 'diem ren luyen', '5 tot', 'minh chung', '5158', '1706'],
    target: { section: 'handbook', handbookTab: 'drl' },
    answer:
      '• Hệ thống đã tổng hợp đầy đủ bảng hướng dẫn chấm ĐRL, quy chế 5158, phiếu 1706 và biểu mẫu đóng góp hoạt động trong mục **Cẩm nang → ĐRL & SV5T**.\n• Bạn bấm vào thẻ liên quan bên dưới để mở trực tiếp các link biểu mẫu.',
  },
  {
    id: 'lien-he',
    title: 'Đầu mối liên hệ Lớp trưởng & Phòng Đào tạo',
    keywords: ['lien he', 'lop truong', 'zalo', 'minh huy', 'dia chi truong', 'email phong', 'ree.sp'],
    target: { section: 'handbook', handbookTab: 'admin' },
    answer:
      `• Lớp trưởng: **${CONTACTS.classPresident.name}** · Zalo \`${CONTACTS.classPresident.zalo}\`\n• ${CONTACTS.academicOffice.name} (${CONTACTS.academicOffice.school})\n• Địa chỉ: ${CONTACTS.academicOffice.address}\n• Email: ${CONTACTS.academicOffice.email}\n• Website: ${CONTACTS.academicOffice.website}`,
  },
  {
    id: 'hpt1-filename',
    title: 'Chuẩn đặt tên & nộp bài Thực hành Hóa Phân Tích 1',
    keywords: ['thhpt1', 'hoa phan tich 1', 'ten file', 'onedrive', 'bao cao hpt1'],
    target: { section: 'study', courseId: 'hpt1' },
    answer:
      '• Báo cáo TH Hóa Phân Tích 1 viết tay 100%, ghép thành 1 file PDF upload OneDrive và nộp Form trong vòng **24 giờ** kể từ buổi thực hành.\n• Cú pháp tên file chuẩn: `THHPT1_D25_Nhóm_Mã bài_STT_Họ Tên_MSSV`.\n• Trong Kho học phần môn HPT1 có sẵn công cụ tạo nhanh tên file đúng chuẩn.',
  },
  {
    id: 'ptn2-rules',
    title: 'Nội quy Thực tập Hóa Lý Dược (PTN 2)',
    keywords: ['ptn 2', 'ptn2', 'hoa ly duoc', 'cndp', 'di tre'],
    target: { section: 'study', courseId: 'ptn2' },
    answer:
      '• Thực tập Hóa Lý Dược tại PTN 2 – BM CNDP: Ca sáng **7h30**, Ca chiều **13h00**.\n• Đi trễ quá **15 phút** được tính là vắng buổi thực tập.\n• Cần chuẩn bị đủ 7 bước trước khi đến lớp theo danh sách kiểm tra trong Kho học phần.',
  },
  {
    id: 'dkhp-windows',
    title: 'Khung giờ Đăng ký học phần (ĐKHP)',
    keywords: ['dkhp', 'dang ky hoc phan', 'khung gio', 'tin chi', 'sv.ump.edu.vn'],
    target: { section: 'deadline' },
    answer:
      REGISTRATION_WINDOWS.map(
        (w) => `• **${w.cohort}**: ${w.start} → ${w.end} (${w.note})`
      ).join('\n') + `\n• Cổng thực hiện: ${CONTACTS.studentPortal}`,
  },
];

export function tryResolveQueryLocally(queryText: string): LocalSearchResolution {
  const trimmed = queryText.trim();
  if (!trimmed) {
    return { handledLocally: false, answerText: '', relatedItems: [] };
  }

  // If user clearly asks for reasoning / comparison / planning / synthesis, defer to Gemini AI
  if (isReasoningQuery(trimmed)) {
    return {
      handledLocally: false,
      answerText: '',
      relatedItems: findRelatedLinks(trimmed),
    };
  }

  const norm = normalizeText(trimmed);

  // 1. Check dedicated campus/procedure rules
  for (const rule of TOPIC_RULES) {
    if (rule.keywords.some((kw) => norm.includes(kw))) {
      return {
        handledLocally: true,
        answerText: `Kết quả tra cứu nhanh — **${rule.title}**:\n${rule.answer}`,
        relatedItems: findRelatedLinks(trimmed),
      };
    }
  }

  // 2. Check HK2 Schedule queries by class (D25A/D25B/D25C/D25D) or "lịch học / lịch thi"
  const matchedClass = (['D25A', 'D25B', 'D25C', 'D25D'] as const).find((c) =>
    norm.includes(c.toLowerCase())
  );
  if (
    matchedClass &&
    (norm.includes('lich') || norm.includes('thi') || norm.includes('phong') || norm.includes('hoc'))
  ) {
    const upcoming = HK2_SCHEDULE_EVENTS.filter((e) => e.classCode === matchedClass).slice(0, 6);
    const lines = upcoming.map(
      (e) =>
        `• ${e.date} (${e.session} · Tuần ${e.week}): ${e.subject}${
          e.detail ? ` — ${e.detail}` : ''
        }`
    );
    return {
      handledLocally: true,
      answerText: `Đã tìm thấy lịch HK2 cho lớp **${matchedClass}** (mẫu các buổi gần đây):\n${lines.join(
        '\n'
      )}\n• Mở mục **Deadline** → **Bộ đếm lịch theo ngày** và chọn lớp ${matchedClass} để xem đầy đủ từng ngày.`,
      relatedItems: [
        {
          id: 'dl-schedule-jump',
          title: `Mở Lịch HK2 lớp ${matchedClass}`,
          category: 'Deadline',
          subtitle: 'Xem chi tiết theo ngày và bộ đếm lịch',
          keywords: matchedClass,
          target: { section: 'deadline' },
        },
      ],
    };
  }

  // 3. Check exact Course match
  const tokens = norm.split(/\s+/).filter((t) => t.length >= 2);
  const scoredCourses = COURSES.map((c) => {
    const hay = normalizeText(
      `${c.name} ${c.shortCode} ${c.semester} ${c.summary} ${c.highlights.join(' ')}`
    );
    let score = 0;
    if (hay.includes(norm)) score += 6;
    for (const t of tokens) {
      if (hay.includes(t)) score += 2;
    }
    if (normalizeText(c.shortCode) === norm) score += 8;
    return { c, score };
  })
    .filter((x) => x.score >= 4)
    .sort((a, b) => b.score - a.score);

  if (scoredCourses.length > 0) {
    const top = scoredCourses.slice(0, 2);
    const body = top
      .map(({ c }) => {
        const linksText = c.links
          .slice(0, 3)
          .map((l) => `  - ${l.label}: ${l.url}`)
          .join('\n');
        return `• **${c.name} (${c.shortCode})** — ${c.semester}\n  ${c.summary}${
          linksText ? `\n${linksText}` : ''
        }`;
      })
      .join('\n\n');

    return {
      handledLocally: true,
      answerText: `Đã tự dò thấy học phần khớp trên hệ thống:\n${body}`,
      relatedItems: top.map(({ c }) => ({
        id: `course-${c.id}`,
        title: `${c.name} (${c.shortCode})`,
        category: 'Học phần' as const,
        subtitle: `${c.semester} · ${c.category}`,
        keywords: c.shortCode,
        target: { section: 'study', courseId: c.id },
      })),
    };
  }

  // 4. General lookup across Exam Forms, DRL, Orientation, Library, School Notices, Deadlines
  const catalogEntries: { title: string; detail: string; url?: string; target: SearchIndexItem['target'] }[] = [
    ...EXAM_FORMS.map((f) => ({
      title: f.title,
      detail: f.note,
      url: f.url,
      target: { section: 'handbook' as NavSection, handbookTab: 'exam' as HandbookTab },
    })),
    ...DRL_LINKS.map((l) => ({
      title: l.label,
      detail: 'Liên kết ĐRL & Sinh viên 5 Tốt',
      url: l.url,
      target: { section: 'handbook' as NavSection, handbookTab: 'drl' as HandbookTab },
    })),
    ...DRL_GUIDES.map((g) => ({
      title: g.title,
      detail: `${g.badge} — ${g.items.slice(0, 2).join(' ')}`,
      url: undefined,
      target: { section: 'handbook' as NavSection, handbookTab: 'drl' as HandbookTab },
    })),
    ...ORIENTATION_DOCS.map((o) => ({
      title: o.title,
      detail: `Văn bản mã ${o.code} — Quy chế / Biểu mẫu sinh viên`,
      url: o.url,
      target: { section: 'handbook' as NavSection, handbookTab: 'admin' as HandbookTab },
    })),
    ...SCHOOL_NOTICES.map((n) => ({
      title: n.title,
      detail: `${n.dateLabel} — ${n.summary}`,
      url: n.links?.[0]?.url,
      target: { section: 'deadline' as NavSection },
    })),
    ...DEADLINES.map((d) => ({
      title: d.title,
      detail: `${d.dueLabel} — ${d.summary}`,
      url: d.externalUrl || d.links?.[0]?.url,
      target: { section: 'deadline' as NavSection },
    })),
    ...LIBRARY_RESOURCES.map((b) => ({
      title: b.title,
      detail: `${b.author} — ${b.usage}`,
      url: b.url,
      target: { section: 'library' as NavSection },
    })),
  ];

  const matchedEntries = catalogEntries
    .map((entry) => {
      const hay = normalizeText(`${entry.title} ${entry.detail}`);
      const score = tokens.reduce((acc, t) => (hay.includes(t) ? acc + 2 : acc), 0);
      return { entry, score };
    })
    .filter((x) => x.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (matchedEntries.length > 0) {
    const lines = matchedEntries.map(
      ({ entry }) =>
        `• **${entry.title}**\n  ${entry.detail}${entry.url ? `\n  Link: ${entry.url}` : ''}`
    );
    return {
      handledLocally: true,
      answerText: `Đã tìm thấy thông tin phù hợp trong kho dữ liệu nội bộ:\n${lines.join('\n')}`,
      relatedItems: findRelatedLinks(trimmed),
    };
  }

  return {
    handledLocally: false,
    answerText: '',
    relatedItems: findRelatedLinks(trimmed),
  };
}
