export type NavSection =
  | 'home'
  | 'study'
  | 'deadline'
  | 'handbook'
  | 'library'
  | 'forum'
  | 'profile';

export {
  HK2_HOLIDAYS,
  HK2_SCHEDULE_EVENTS,
  SCHEDULE_CLASS_META,
} from './hk2ScheduleData';
export type {
  ClassTrackMeta,
  Hk2Holiday,
  Hk2ScheduleEvent,
  ScheduleClassCode,
  ScheduleEventKind,
} from './hk2ScheduleData';

export type HandbookTab = 'campus' | 'exam' | 'bhyt' | 'drl' | 'admin';

export interface ResourceLink {
  label: string;
  url: string;
  kind?: 'drive' | 'docs' | 'sheets' | 'forms' | 'external' | 'video' | 'notebook' | 'teams';
}

export interface CourseDetailSection {
  title: string;
  badge?: string;
  items: string[];
}

export interface CourseItem {
  id: string;
  name: string;
  shortCode: string;
  year: 'year1' | 'year2' | 'year3to5';
  semester: string;
  semesterKey: 'y1-hk1' | 'y1-hk2' | 'y2-hk1' | 'y3-5';
  category: 'Chuyên ngành Dược' | 'Khoa học cơ bản' | 'Thực tập' | 'Đại cương & GDQPAN';
  summary: string;
  highlights: string[];
  chapters?: string[];
  sections?: CourseDetailSection[];
  facultyContact?: string[];
  specialTool?: 'hpt1-filename' | 'ptn2-checklist' | 'chemdraw-notice';
  links: ResourceLink[];
}

export interface DeadlineTask {
  id: string;
  title: string;
  category: 'Đăng ký học phần' | 'Học vụ & BHYT' | 'Hoạt động & ĐRL';
  dueLabel: string;
  eventDate?: string; // YYYY-MM-DD for calendar marking
  expiresAt: string; // ISO datetime for real-time auto-pruning
  statusLabel: 'Khẩn cấp' | 'Sắp tới' | 'Đang mở' | 'Tham khảo';
  audience: string;
  summary: string;
  details: string[];
  links?: ResourceLink[];
  actionTab?: { section: NavSection; handbookTab?: HandbookTab; courseId?: string; label: string };
  externalUrl?: string;
}

export interface AppUpdateItem {
  id: string;
  title: string;
  category: 'Tính năng mới' | 'Cập nhật học tập' | 'Cẩm nang & Thông báo';
  updatedAt: string; // ISO datetime of modification
  ttlDays: number; // Automatically hidden after ttlDays (7 days)
  summary: string;
  details: string[];
  target?: { section: NavSection; courseId?: string; handbookTab?: HandbookTab; label: string };
  links?: ResourceLink[];
}

export interface SchoolNoticeItem {
  id: string;
  title: string;
  category: 'Học vụ & ĐKHP' | 'Sinh hoạt lớp' | 'Hoạt động Trường' | 'Học phí & Hỗ trợ';
  dateLabel: string;
  audience: string;
  summary: string;
  details: string[];
  links?: ResourceLink[];
}

export interface SearchIndexItem {
  id: string;
  title: string;
  category: 'Học phần' | 'Thủ tục' | 'Deadline' | 'Tài liệu';
  subtitle: string;
  keywords: string;
  target: {
    section: NavSection;
    courseId?: string;
    handbookTab?: HandbookTab;
  };
  externalUrl?: string;
}

const ASSET_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : '/';

export const IMAGES = {
  campus: `${ASSET_BASE_URL}assets/aistudio/image-default_bce97e21.png`,
} as const;

export const CONTACTS = {
  classPresident: {
    name: 'Nguyễn Minh Huy',
    role: 'Lớp trưởng D25B',
    zalo: '0888103145',
    umpEmail: 'nmhuy.duoc25@ump.edu.vn',
    facebook: 'https://www.facebook.com/nguyenminhhuy1205',
    youtube: 'https://www.youtube.com/@inoyasha1205',
  },
  libraryEmail: 'd25b.truongduoc@gmail.com',
  academicOffice: {
    name: 'Phòng Khoa học – Đào tạo – Đối ngoại (KH-ĐT-ĐN)',
    school: 'Trường Dược – Đại học Y Dược TP. Hồ Chí Minh',
    address: '41-43 Đinh Tiên Hoàng, Phường Sài Gòn, TP. Hồ Chí Minh',
    website: 'https://pharm.ump.edu.vn',
    email: 'ree.sp@ump.edu.vn',
  },
  studentAffairs: {
    name: 'Phòng Công tác Sinh viên (CTSV)',
    phone: '02838.537976',
    email: 'ctsv@ump.edu.vn',
    location: 'Tầng 1 – Tòa nhà 15 tầng (giờ hành chính)',
  },
  originalSite: 'https://sites.google.com/view/the-d25b-times/trang-ch%E1%BB%A7',
  studentPortal: 'https://sv.ump.edu.vn',
};

export const COURSES: CourseItem[] = [
  // NĂM 1 - HK1
  {
    id: 'tacn1',
    name: 'Tiếng Anh Chuyên Ngành 1',
    shortCode: 'TACN1',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 1',
    semesterKey: 'y1-hk1',
    category: 'Chuyên ngành Dược',
    summary:
      'Giáo trình nền tảng tiếng Anh Dược học: đọc hiểu thuật ngữ dược, tài liệu y khoa và kỹ năng viết – trình bày chuyên ngành.',
    highlights: [
      'EBook: English in Pharmacy – Luisa Benigni ([Biophavn] English in Pharmacy - YDS.pdf)',
      'EBook: English for Pharmacy Writing and Oral Communication (PDF)',
    ],
    links: [
      {
        label: 'EBook English in Pharmacy – Luisa Benigni (PDF)',
        url: 'https://drive.google.com/open?id=1KE1UYUcMssLzTJ7YEMKB0WfK85OHCV94',
        kind: 'drive',
      },
      {
        label: 'English for Pharmacy Writing & Oral Communication (PDF)',
        url: 'https://drive.google.com/open?id=1cURYOMgNaHoRNVFgReIC3SYo1XUabZg1',
        kind: 'drive',
      },
    ],
  },

  // NĂM 1 - HK2 (Đầy đủ 13 học phần theo mục Lục HK2 trên site)
  {
    id: 'ktct',
    name: 'Kinh tế chính trị Mác – Lênin',
    shortCode: 'KTCT',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Đại cương & GDQPAN',
    summary:
      'Trọn bộ slide bài giảng các chương, ngân hàng câu hỏi trắc nghiệm ôn tập Chương 3 và giáo trình Kinh tế chính trị bản PDF.',
    highlights: [
      'Danh sách bài giảng: 2025_Chuong1.pdf, 2025_Chuong2 (1).pdf, KTCT Chương 3.pdf',
      'Bài tập ôn luyện trắc nghiệm: C3P1_TN_KTCT.pdf',
      'Giáo trình đầy đủ: Giáo trình KTCT 2021_20210918_0001.pdf',
    ],
    chapters: [
      'Chương 1 – Đối tượng, phương pháp & chức năng của KTCT (2025_Chuong1.pdf)',
      'Chương 2 – Hàng hóa, thị trường và vai trò các chủ thể (2025_Chuong2.pdf)',
      'Chương 3 – Giá trị thặng dư trong nền kinh tế thị trường (KTCT Chương 3.pdf)',
    ],
    links: [
      {
        label: 'Bài giảng Chương 1 (2025_Chuong1.pdf)',
        url: 'https://drive.google.com/file/d/1oninlRV24A0yl6-6JHjNWxHFxy3st2dC/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Bài giảng Chương 2 (2025_Chuong2.pdf)',
        url: 'https://drive.google.com/file/d/19K31mDWwBT_o5QXCnVhrezo746wO8-7b/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Bài giảng Chương 3 (KTCT Chương 3.pdf)',
        url: 'https://drive.google.com/file/d/1a-aFs9z5eOp6Z223gDfajqdmLUKfFqY-/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Bài tập ôn luyện (C3P1_TN_KTCT.pdf)',
        url: 'https://drive.google.com/file/d/1yPyPlgQRGEB98sMY8VAkgPJ6pod4X9wZ/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Giáo trình KTCT 2021 (PDF)',
        url: 'https://drive.google.com/file/d/1MTrhAthnxyDEY-zMM8hf8V6y7Xk2Uo8T/view?usp=sharing',
        kind: 'drive',
      },
    ],
  },
  {
    id: 'gpsl',
    name: 'Giải phẫu – Sinh lý',
    shortCode: 'GPSL',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Khoa học cơ bản',
    summary:
      'Đầy đủ đề cương lý thuyết, đề cương thực hành, lịch giảng chi tiết và toàn bộ 9 thư mục bài giảng chuyên đề Sinh lý học.',
    highlights: [
      'Đề cương Lý thuyết & Đề cương Thực hành bản PDF chính thức',
      'Lịch giảng chi tiết theo từng tuần học',
      'Mỗi chuyên đề từ 1 đến 9 có thư mục Drive bài giảng riêng bên trên',
    ],
    chapters: [
      '1. Sinh lý máu',
      '2. Sinh lý hệ tuần hoàn',
      '3. Sinh lý hệ hô hấp',
      '4. Sinh lý hệ tiêu hóa',
      '5. Sinh lý hệ thận niệu',
      '6. Sinh lý hệ nội tiết',
      '7. Sinh lý hệ sinh sản',
      '8. Sinh lý hệ thần kinh trung ương',
      '9. Sinh lý thần kinh cao cấp',
    ],
    links: [
      {
        label: 'Đề cương Lý thuyết (PDF)',
        url: 'https://drive.google.com/file/d/1qtJwKD8HTzZFY6Kyq_rnFriA1xFdIXn0/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Đề cương Thực hành (PDF)',
        url: 'https://drive.google.com/file/d/15Zy2wRZc-IJYwF8oNPzjImx1Wv01MRWm/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Lịch giảng chi tiết (PDF)',
        url: 'https://drive.google.com/file/d/1mx70lxCr892KMs8ZLejzVvHh4kQlz40u/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: '1. Sinh lý máu (Folder)',
        url: 'https://docs.google.com/folderview?id=1KAkWZ8I8QHH_b3xz1p8dMMXzWekp79j0',
        kind: 'drive',
      },
      {
        label: '2. Sinh lý hệ tuần hoàn (Folder)',
        url: 'https://docs.google.com/folderview?id=1jfeXeMPjAlj_q_fe37PKxqv6ucnaE98L',
        kind: 'drive',
      },
      {
        label: '3. Sinh lý hệ hô hấp (Folder)',
        url: 'https://docs.google.com/folderview?id=1FQvbU3ZomY5Va3MKUFp8tU1MlQipT5CJ',
        kind: 'drive',
      },
      {
        label: '4. Sinh lý hệ tiêu hóa (Folder)',
        url: 'https://docs.google.com/folderview?id=1_iH7LSWO3Yw0w9Ic8h4AW36eCzCErpqJ',
        kind: 'drive',
      },
      {
        label: '5. Sinh lý hệ thận niệu (Folder)',
        url: 'https://docs.google.com/folderview?id=1CiDxjPNykKwM90faLhteFEjj3NG335fh',
        kind: 'drive',
      },
      {
        label: '6. Sinh lý hệ nội tiết (Folder)',
        url: 'https://docs.google.com/folderview?id=1Dt3Zdc-GnVvixADI305vC6R7Eva0SMrt',
        kind: 'drive',
      },
      {
        label: '7. Sinh lý hệ sinh sản (Folder)',
        url: 'https://docs.google.com/folderview?id=1ZBN3aAJdFE8BkorT9At3wlCoQ0diA8Wt',
        kind: 'drive',
      },
      {
        label: '8. Sinh lý hệ thần kinh trung ương (Folder)',
        url: 'https://docs.google.com/folderview?id=16L9FXguYL7g3Fy8YEiGZ2s2oXnxyE7N0',
        kind: 'drive',
      },
      {
        label: '9. Sinh lý thần kinh cao cấp (Folder)',
        url: 'https://docs.google.com/folderview?id=1WJFJQKySQCQIpT-7sJebd-vFAHSJdlZM',
        kind: 'drive',
      },
    ],
  },
  {
    id: 'hhc1',
    name: 'Hóa hữu cơ 1',
    shortCode: 'HHC1',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Chuyên ngành Dược',
    summary:
      'Tổng hợp video tổng ôn cuối kỳ (Phần 1), tài liệu nội dung học tập – ôn tập cuối kỳ 2 và bộ đề các năm trước do lớp trưởng Minh Huy xin từ thầy.',
    highlights: [
      'Video tổng ôn cuối kỳ (P1) phát trực tiếp qua YouTube',
      'Thư mục Nội dung học tập & ôn tập cuối kỳ 2',
      'Bộ đề năm trước Minh Huy xin được từ thầy (hiện thầy chưa phát đáp án, sẽ cập nhật thêm khi có)',
      'Bộ môn yêu cầu cài phần mềm ChemDraw ≥ 18.0 trước khi bắt đầu học phần',
    ],
    specialTool: 'chemdraw-notice',
    links: [
      {
        label: 'Video Tổng ôn cuối kỳ Hóa hữu cơ 1 (P1)',
        url: 'https://www.youtube.com/watch?v=-j7anusCOps',
        kind: 'video',
      },
      {
        label: 'Thư mục Nội dung học tập & Ôn tập cuối kỳ 2',
        url: 'https://docs.google.com/folderview?id=1yytJW-aQCmtf9mcWI03zqCQK8dxVvGDs',
        kind: 'drive',
      },
      {
        label: 'Thư mục Bộ đề năm trước (MHuy xin từ thầy)',
        url: 'https://docs.google.com/folderview?id=1pqr9ERIfMMhHyzX2ELz2HuSXopYQ790C',
        kind: 'drive',
      },
    ],
  },
  {
    id: 'cnxhkh',
    name: 'Chủ nghĩa xã hội khoa học',
    shortCode: 'CNXHKH',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Đại cương & GDQPAN',
    summary:
      'Quy định tài liệu, cơ cấu đánh giá (30% quá trình + 70% tự luận 75 phút không tài liệu) và toàn bộ thể lệ thuyết trình nhóm từ 20/04/2026.',
    highlights: [
      'Điểm quá trình (30%) = Thuyết trình (30%) + Chuyên cần (20%) + Kiểm tra giữa kỳ (50%)',
      'Điểm cuối kỳ (70%): Bài thi tự luận 75 phút gồm 2 câu hỏi, KHÔNG sử dụng tài liệu',
      'Thuyết trình bắt đầu từ 20/04/2026: mỗi buổi 2 chủ đề / 2 nhóm (thứ tự chủ đề 01 – 10)',
    ],
    sections: [
      {
        title: '1. Tài liệu & Cơ cấu đánh giá học phần',
        badge: 'Quy định môn học',
        items: [
          'Tài liệu tham khảo: Giáo trình Chủ nghĩa xã hội khoa học; Tạp chí Cộng sản; Tạp chí Lý luận chính trị...',
          'Cơ cấu 30% quá trình: Thuyết trình 30% + Chuyên cần 20% + Kiểm tra giữa kỳ 50%.',
          'Cơ cấu 70% cuối kỳ: Thi tự luận 75 phút (2 câu hỏi), sinh viên không sử dụng tài liệu.',
        ],
      },
      {
        title: '2. Thể lệ chuẩn bị & Chấm điểm Thuyết trình (Từ 20/04/2026)',
        badge: '25 phút / nhóm',
        items: [
          'Nộp 01 file cứng cho Thầy ghi danh sách nhóm và mức độ tham gia thành viên (tỷ lệ tham khảo: 75% tham gia 100%; 15% tham gia 90%; 10% tham gia 80% hoặc nhận xét riêng). KHÔNG cần in bản sao slides để nộp.',
          'Tổng thời gian trình bày: 25 phút (bao gồm thuyết trình, đặt câu hỏi và trả lời).',
          'Tiêu chí chấm: Thời gian chuẩn bị; Slide ít chữ, có hình ảnh & video minh họa, nói lưu loát sinh động có dẫn chứng/ví dụ và trò chơi ôn lại nội dung; Trả lời 03 câu hỏi của GV (không dùng tài liệu).',
          'Điểm cộng: Sinh viên tham gia đặt câu hỏi hoặc trả lời câu hỏi trong buổi thuyết trình sẽ được cộng điểm chuyên cần.',
        ],
      },
    ],
    links: [
      {
        label: 'Danh sách chia nhóm thuyết trình (Google Sheets)',
        url: 'https://docs.google.com/spreadsheets/d/1qwJIdXISVJ2jJIiYCl96r4cZyXI-5jMrMA9zCBIf6Cc/edit?usp=sharing',
        kind: 'sheets',
      },
    ],
  },
  {
    id: 'phapluat',
    name: 'Pháp luật',
    shortCode: 'PL',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Đại cương & GDQPAN',
    summary:
      'Kho slide bài giảng Pháp luật đại cương (Google Drive) đi kèm 3 sổ tay NotebookLM chuyên sâu về Pháp luật ngành Dược.',
    highlights: [
      'Toàn bộ file bài giảng Pháp luật lưu trong thư mục Drive chung của lớp',
      'Hỗ trợ 3 không gian NotebookLM (Pháp Luật Dược 1, 2, 3) để hỏi đáp & ôn thi nhanh',
    ],
    links: [
      {
        label: 'Thư mục Nội dung bài giảng Pháp luật (Drive)',
        url: 'https://docs.google.com/folderview?id=1bsSjCigRrxnEibldoRaqM0juJ5IgtT2K',
        kind: 'drive',
      },
      {
        label: 'NotebookLM – Pháp Luật (Dược)',
        url: 'https://notebooklm.google.com/notebook/5eff3d1d-c210-42ec-87b6-089f9a61fe29',
        kind: 'notebook',
      },
      {
        label: 'NotebookLM – Pháp Luật (Dược) - 2',
        url: 'https://notebooklm.google.com/notebook/65529ccc-b8cd-4f3b-99d6-5f7a8276c269',
        kind: 'notebook',
      },
      {
        label: 'NotebookLM – Pháp Luật (Dược) - 3',
        url: 'https://notebooklm.google.com/notebook/eb2f4772-4c71-4be5-880f-31eaec06cbf0',
        kind: 'notebook',
      },
    ],
  },
  {
    id: 'shtb',
    name: 'Sinh học tế bào',
    shortCode: 'SHTB',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Khoa học cơ bản',
    summary:
      'Trọn bộ 5 file PDF lý thuyết (Đề cương chi tiết, Eukaryote, Hô hấp – Quang hợp, Prokaryote, Vận chuyển – Chu kỳ tế bào) và 4 video thực hành kính hiển vi.',
    highlights: [
      'Lý thuyết gồm 5 tài liệu PDF chi tiết cho năm học 2025–2026',
      'Thực hành gồm 4 video YouTube: cấu tạo kính hiển vi, cách sử dụng và hướng dẫn thực hành Bài 1 & Bài 2',
    ],
    chapters: [
      'Đề cương chi tiết Lý thuyết Sinh học (NH 2020–2021)',
      'Bài 1. Tế bào Eukaryote (2025)',
      'Bài 2. Hô hấp – Quang hợp (2025)',
      'Bài 3. Tế bào Prokaryote (2025)',
      'Bài 4. Vận chuyển & Chu kỳ – Phân bào (TDUOC 2026)',
    ],
    links: [
      {
        label: 'Đề cương chi tiết Lý thuyết Sinh học (PDF)',
        url: 'https://drive.google.com/file/d/1Tg2XDMDGneJ0xYDipy4Pf5yCS4XLIrqy/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Tế bào Eukaryote 2025 (PDF)',
        url: 'https://drive.google.com/file/d/1_tdr87CBT-tUqn74RaEXP1tjzP2G85Xi/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Hô hấp – Quang hợp 2025 (PDF)',
        url: 'https://drive.google.com/file/d/1RDFH-t97Tdou3hGjM_oJ_Vou8zQ7zo50/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Tế bào Prokaryote 2025 (PDF)',
        url: 'https://drive.google.com/file/d/1Z9ndWspM_VaXb55zxRYSZcBtnnFXgEt9/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Vận chuyển & Phân bào TDUOC 2026 (PDF)',
        url: 'https://drive.google.com/file/d/1cHOYqVxYcqbzESJQfnV1aUhC-6z4Kkq1/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Video TH: Giới thiệu các bộ phận kính hiển vi',
        url: 'https://www.youtube.com/watch?v=VsCf04qCaew',
        kind: 'video',
      },
      {
        label: 'Video TH: Hướng dẫn sử dụng kính hiển vi',
        url: 'https://www.youtube.com/watch?v=Uv9mlCt8w2s',
        kind: 'video',
      },
      {
        label: 'Video TH: Hướng dẫn thực hành Sinh học tế bào',
        url: 'https://www.youtube.com/watch?v=kv9guSUWQ1w',
        kind: 'video',
      },
      {
        label: 'Video TH: Hướng dẫn thực hành SHTB Bài 2',
        url: 'https://www.youtube.com/watch?v=G3JEZvxwT_M',
        kind: 'video',
      },
    ],
  },
  {
    id: 'shpt',
    name: 'Sinh học phân tử',
    shortCode: 'SHPT',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Khoa học cơ bản',
    summary:
      'Đề cương chi tiết, Rubric & hình thức đánh giá môn học, bảng thuật ngữ SHPT, bài mở đầu PDF và 8 thư mục bài giảng riêng biệt.',
    highlights: [
      'Đầy đủ Đề cương chi tiết, Rubric đánh giá và Hình thức đánh giá học phần (Docs)',
      'Kèm thư mục Một số thuật ngữ trong SHPT và file bài mở đầu.pdf',
      'Có 8 thư mục Google Drive riêng từ Bài 1 đến Bài 7 và Di truyền vi khuẩn',
    ],
    chapters: [
      'Bài 1. Sao chép DNA',
      'Bài 2. Sự phiên mã và mã di truyền',
      'Bài 3. Các loại ARN',
      'Bài 4. Dịch mã',
      'Bài 5. Điều hòa hoạt động gen',
      'Bài 6. Đột biến gen',
      'Bài 7. Phương pháp cơ bản của SHPT',
      'Di truyền vi khuẩn',
    ],
    links: [
      {
        label: 'Đề cương chi tiết học phần SHPT (Docs)',
        url: 'https://docs.google.com/document/d/1o3gr6wVQ_TpQSs6Gw5XjLfiKhgTy8o11VwR9DBqlU4g/edit?usp=sharing',
        kind: 'docs',
      },
      {
        label: 'Rubric đánh giá môn học SHPT (Docs)',
        url: 'https://docs.google.com/document/d/1u_rxH_qWWHvK_at5WvtPbdD1JI1BdOIayDoaWO-tkO4/edit?usp=sharing',
        kind: 'docs',
      },
      {
        label: 'Hình thức đánh giá học phần (Docs)',
        url: 'https://docs.google.com/document/d/1wxp-fYWoLR5s1ihadduR0L5FdLpZhtg0Bq7qoNWc-lo/edit?usp=sharing',
        kind: 'docs',
      },
      {
        label: 'Một số thuật ngữ trong SHPT (Drive)',
        url: 'https://drive.google.com/drive/folders/1idlXPAUhjR9hhJ0HCBifUge7-zSErd6L',
        kind: 'drive',
      },
      {
        label: 'Bài mở đầu (bài mở đầu.pdf)',
        url: 'https://drive.google.com/file/d/1VGwkSZyr0COVsf8ULvIKEAJWIIbGa1e5/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Bài 1. Sao chép DNA (Folder)',
        url: 'https://docs.google.com/folderview?id=1BoiMVSsjgTzsfsd5c_tETyQt6ICZuXXx',
        kind: 'drive',
      },
      {
        label: 'Bài 2. Sự phiên mã & Mã di truyền (Folder)',
        url: 'https://docs.google.com/folderview?id=1pK8efz97WiDB4xJEpiHU3AyJ4vwvD1mc',
        kind: 'drive',
      },
      {
        label: 'Bài 3. Các loại ARN (Folder)',
        url: 'https://docs.google.com/folderview?id=1ti5Fae1SE0GSy5Ju6GrOgp6XpW8NycFC',
        kind: 'drive',
      },
      {
        label: 'Bài 4. Dịch mã (Folder)',
        url: 'https://docs.google.com/folderview?id=1zqVBrbpjUeyYWJdTRy3KQoNvQ_e6rDZ_',
        kind: 'drive',
      },
      {
        label: 'Bài 5. Điều hòa hoạt động gen (Folder)',
        url: 'https://docs.google.com/folderview?id=1hn6TaGrJPXGp_aljOxQhr4_VzkBb65Fu',
        kind: 'drive',
      },
      {
        label: 'Bài 6. Đột biến gen (Folder)',
        url: 'https://docs.google.com/folderview?id=1UVPY9lmghYu_H5urqDCZsNjFnN5RkJ-Z',
        kind: 'drive',
      },
      {
        label: 'Bài 7. Phương pháp cơ bản của SHPT (Folder)',
        url: 'https://docs.google.com/folderview?id=1iQq6p3yF9sBmDzQdDMpTaggWPhxSdGB1',
        kind: 'drive',
      },
      {
        label: 'Di truyền vi khuẩn (Folder)',
        url: 'https://docs.google.com/folderview?id=106Hn16jXG1HihanK1ZdjBFJfd7hEmwau',
        kind: 'drive',
      },
    ],
  },
  {
    id: 'ttdk1',
    name: 'Thực tập Dược khoa 1 (Nhận thức Dược liệu)',
    shortCode: 'TTDK1',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Thực tập',
    summary:
      'Toàn bộ slide nội quy NTDL, đề cương, ứng dụng định vị cây thuốc trong Vườn Dược Liệu, danh sách phân nhóm, link MS Teams, SharePoint nộp bài và tài liệu Bài 1.',
    highlights: [
      'Từ danh sách nhóm, mỗi tiểu nhóm bầu nhóm trưởng và điền Sheet trước 17:00 Thứ Ba 06/01/2026',
      'Họp MS Teams sinh hoạt nội quy học phần dự kiến 18:00 Thứ Năm 08/01/2026 (có video record trên YouTube)',
      'Sử dụng website mplant.ump.edu.vn và bảng định vị cây thuốc trong Vườn Dược Liệu',
    ],
    sections: [
      {
        title: 'Nội dung họp & Tổ chức tiểu nhóm TTDK1',
        badge: 'Thông báo quan trọng',
        items: [
          'Xem danh sách nhóm trong file "SINH VIÊN_THỰC TẬP DƯỢC KHOA 1_2025-2026" và bầu chọn nhóm trưởng của từng tiểu nhóm.',
          'Điền thông tin nhóm trưởng vào Sheet trước 17h00 Thứ Ba, ngày 06/01/2026.',
          'Tham gia kênh MS Teams TTDK1 để họp phổ biến nội quy học phần (dự kiến 18h00 Thứ Năm 08/01/2026; đã có bản record trên YouTube).',
        ],
      },
      {
        title: 'Học liệu Nhận thức Dược liệu & Nộp bài thuyết trình',
        items: [
          'Slide nội quy: Noi dung - noi qui thuc tap NTDL_2026.pptx.',
          'Nhận thức Dược liệu Bài 1 gồm 2 tài liệu PDF: 2025_NTDL bai 1_Nhan_thuc_Duoc_lieu.pdf và 2025_NTDL bai 1.pdf.',
          'Bài thuyết trình NTDL nộp qua thư mục SharePoint của giảng viên phụ trách.',
        ],
      },
    ],
    links: [
      {
        label: 'Slide Nội dung & Nội quy NTDL 2026 (.pptx)',
        url: 'https://drive.google.com/file/d/1F7u6-dQSSDfzoFhxnXTJjhpRwhAAJ5C7/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Đề cương môn học TTDK1 (Docs)',
        url: 'https://docs.google.com/document/d/1Yv__Y7Ea7rXXVESZW7N5lKpCkMHHFq24TTW36zvfU1E/preview',
        kind: 'docs',
      },
      {
        label: 'Ứng dụng định vị cây thuốc trong Vườn Dược Liệu',
        url: 'https://docs.google.com/spreadsheets/d/1x1E8rdLDa49Ou3ra3bNpdDcDKQq0NPQPu5Ep_7hx9h0/edit?usp=sharing',
        kind: 'sheets',
      },
      {
        label: 'Đăng ký thực tập bù / Khiếu nại quá trình',
        url: 'https://docs.google.com/spreadsheets/d/1DZJ88IrIU5DGnkZxa2q2Au1935JmAh14RiU0OB35hHI/edit?usp=sharing',
        kind: 'sheets',
      },
      {
        label: 'Link nộp bài thuyết trình NTDL (SharePoint)',
        url: 'https://umpedu-my.sharepoint.com/:f:/g/personal/thutrang_ump_edu_vn/IgAC2OJOFSdXR7DQD1M_LA4NAcN3jGGaRxX9w3rehHBx2UU?e=7lLyRV',
        kind: 'external',
      },
      {
        label: 'Website Nhận thức Dược liệu (mplant.ump.edu.vn)',
        url: 'https://mplant.ump.edu.vn/',
        kind: 'external',
      },
      {
        label: 'Danh sách phân chia nhóm TTDK1 2025–2026',
        url: 'https://docs.google.com/spreadsheets/d/1CA1zIzhJvP_zb9W4DgUojq6X37h29t06sEBpDIpo2nw/edit?usp=sharing',
        kind: 'sheets',
      },
      {
        label: 'Nhập danh sách nhóm trưởng (hạn 17h 06/01/2026)',
        url: 'https://docs.google.com/spreadsheets/d/10HO0XsaBgDx9ZaSHs8YpGTC8D4iEhT6jkxkbe-_xvMk/edit?usp=sharing',
        kind: 'sheets',
      },
      {
        label: 'MS Teams – Sinh hoạt nội quy TTDK1',
        url: 'https://teams.microsoft.com/l/team/19%3ApGf0x9cFnV-KuWi07lbekANvDppfGtGiadYpfPHamTg1%40thread.tacv2/conversations?groupId=b5baeba5-079d-4f99-8b67-35963ef5dbed&tenantId=eab3c8f8-7488-460f-a2b4-412eaddea8bf',
        kind: 'teams',
      },
      {
        label: 'Video record họp phổ biến TTDK1 (YouTube)',
        url: 'https://www.youtube.com/watch?v=oimhOr5eE7M',
        kind: 'video',
      },
      {
        label: 'NTDL Bài 1 – Tài liệu chính (PDF)',
        url: 'https://drive.google.com/file/d/1YF65TPrb0kSFxK41Y8UGd9msQS2fLzL4/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'NTDL Bài 1 – Tài liệu bổ sung (PDF)',
        url: 'https://drive.google.com/file/d/1KNLNWrto7_2jGCgn4qOpsVmoWKEBkGhm/view?usp=sharing',
        kind: 'drive',
      },
    ],
  },
  {
    id: 'ttdk2',
    name: 'Thực tập Dược khoa 2 (Bào chế & Hóa hữu cơ)',
    shortCode: 'TTDK2',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Thực tập',
    summary:
      'Gồm 2 phân môn: TTDK2 – Bào chế (giáo trình, phiếu theo dõi bìa cứng, nội quy & đơn xin bù) và TTDK2 – Hóa hữu cơ (yêu cầu cài ChemDraw ≥ 18.0).',
    highlights: [
      'Ngày đầu tiên đi học Bào chế BẮT BUỘC mang đủ: GIÁO TRÌNH, PHIẾU THEO DÕI và DỤNG CỤ MỤC 3',
      'Giáo trình Bào chế khuyến khích photo 1 mặt, trang bìa TRÁNH màu XANH DƯƠNG',
      'Chỉ được bù DUY NHẤT 1 BUỔI (buổi thi số 4 KHÔNG được bù trừ bất khả kháng)',
      'TTDK2 – Hóa hữu cơ yêu cầu cài đặt ChemDraw từ phiên bản 18.0 trở lên',
    ],
    sections: [
      {
        title: 'Phân môn Bào chế – Chuẩn bị Giáo trình, Phiếu theo dõi & Dụng cụ',
        badge: 'Bắt buộc buổi đầu',
        items: [
          'Giáo trình TTDK2 – Bào chế (giao trinh.pdf): khuyến khích photo 1 mặt để tiện ghi chú bài giảng (hoặc 2 mặt tùy nhu cầu); trang bìa TRÁNH màu XANH DƯƠNG.',
          'Trước mỗi buổi thực tập phải xem kế hoạch ở trang 2 và nội dung liên quan; đọc kỹ mục 3, 7, 8 nội quy ở trang 3 để chuẩn bị đầy đủ.',
          'Mang nhiều giấy A4 mỗi buổi và khăn trắng thường dùng cỡ 20cm × 20cm (vảy xúc có thể mang hoặc dùng đồ bộ môn chuẩn bị).',
          'Phiếu theo dõi thực tập (PHIẾU THEO DÕI THỰC HÀNH DK2.pdf): photo trên bìa cứng (giống giấy ở TTTV), in 2 mặt, màu bất kỳ, không mùi, không vị, không hoa văn.',
        ],
      },
      {
        title: 'Phân môn Bào chế – Quy định Xin phép vắng & Thực tập bù',
        badge: 'Tối đa 1 buổi',
        items: [
          'Môn học chỉ cho phép bù DUY NHẤT 1 BUỔI. Khi xin bù phải in mẫu đơn của bộ môn (NH25-26. Mẫu đơn xin nghỉ - TT bù THDK2.docx), điền đầy đủ và nộp lên bộ môn duyệt trước mới được bù.',
          'Riêng buổi 4 (buổi thi) KHÔNG ĐƯỢC BÙ trừ trường hợp bất khả kháng.',
          'Đơn không có lý do chính đáng sẽ không được duyệt; các lý do hợp lệ theo quy định gồm: sức khỏe, ma chay, cưới hỏi.',
        ],
      },
    ],
    specialTool: 'chemdraw-notice',
    links: [
      {
        label: 'Thông báo thi THDK lớp D2025 (PDF)',
        url: 'https://drive.google.com/file/d/1E_elzgrXsH3PBfwyxO4H_GGBBkWo2ETs/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Giáo trình Thực tập Dược khoa 2 – Bào chế (PDF)',
        url: 'https://drive.google.com/file/d/18fbwHzjShsr1iBPB3zTyAQLqNoU53PQb/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Phiếu theo dõi thực hành DK2 (PDF)',
        url: 'https://drive.google.com/file/d/1SA9UyMCrYPUBXewlzYM3rYL5hToiB7m8/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Mẫu đơn xin nghỉ – Thực tập bù THDK2 (.docx)',
        url: 'https://drive.google.com/file/d/17aey0h9-XgLU9qDbHz5wEkU4Jca5ts2E/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Video hướng dẫn ChemDraw ≥ 18.0 (YouTube)',
        url: 'https://www.youtube.com/watch?v=wyeDuzzsB2Q',
        kind: 'video',
      },
    ],
  },
  {
    id: 'ttsh',
    name: 'Thực tập Sinh học',
    shortCode: 'TTSH',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Thực tập',
    summary:
      'Buổi 6 – Seminar Các kỹ thuật Sinh học phân tử: Thiết kế mồi bằng NCBI Primer-BLAST, kiểm tra Hairpin/Dimer với IDT OligoAnalyzer và định danh loài bằng Nucleotide BLAST.',
    highlights: [
      'The Virtual Bacterial ID Lab và thao tác theo bản dịch Primer-BLAST cần bật VPN',
      'Ngưỡng loại mồi trên IDT OligoAnalyzer: ΔG Hairpin ≤ -3 kcal/mol HOẶC ΔG Dimer ≤ -9 kcal/mol',
      'Hoàn thiện Distance tree và mẫu Báo cáo thực hành Seminar Buổi 6 (.docx)',
    ],
    sections: [
      {
        title: 'Quy trình 5 bước Seminar Buổi 6: Thiết kế mồi & Định danh BLAST',
        badge: 'Sinh học phân tử',
        items: [
          'Bước 1: Lấy dữ liệu trình tự FASTA từ FILE FASTA trong thư mục học liệu Bài 6.',
          'Bước 2: Nạp dữ liệu vào NCBI Primer-BLAST để tìm ra các cặp mồi gợi ý tiềm năng và kiểm tra độ đặc hiệu sơ bộ.',
          'Bước 3: Copy trình tự mồi vào IDT OligoAnalyzer để kiểm tra năng lượng ΔG. Nếu ΔG Hairpin ≤ -3 kcal/mol HOẶC ΔG Dimer ≤ -9 kcal/mol → không đạt, phải đổi mồi; đạt chuẩn an toàn → xác nhận cặp mồi.',
          'Bước 4: Nạp trình tự gen chưa biết từ FILE 3 vào NCBI Nucleotide BLAST để định danh loài.',
          'Bước 5: Xuất đồ họa cây phát sinh chủng loài (Distance tree) và hoàn thiện file Báo cáo thực tập Seminar Buổi 6.',
        ],
      },
    ],
    links: [
      {
        label: 'E-Learning: Thư mục Học liệu Bài 6 (Drive)',
        url: 'https://docs.google.com/folderview?id=1ibINyEovDJI_OJwGGcrSTlho5TRYyndS',
        kind: 'drive',
      },
      {
        label: 'Bản dịch Primer Designing Using Primer-BLAST (.docx · Bật VPN)',
        url: 'https://drive.google.com/file/d/1eK_ezYWLRWG5TykRvkkCjoqetBwwKZ23/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Mẫu Báo cáo thực hành Seminar B6 (.docx)',
        url: 'https://drive.google.com/file/d/1X3V1gSxA-cVXeu1bVnYXFbRAZmT1oaJc/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'The Virtual Bacterial ID Lab (Cần VPN)',
        url: 'https://media.hhmi.org/biointeractive/vlabs/bacterial_id2/content/index.html',
        kind: 'external',
      },
      {
        label: 'NCBI Primer-BLAST (Thiết kế mồi PCR)',
        url: 'https://www.ncbi.nlm.nih.gov/tools/primer-blast/',
        kind: 'external',
      },
      {
        label: 'Bacillus subtilis strain BS38 (NCBI)',
        url: 'https://www.ncbi.nlm.nih.gov/nuccore/CP017314.1',
        kind: 'external',
      },
      {
        label: 'Macrogen Standard Primers (PDF)',
        url: 'https://dna.macrogen.com/resources/order_guide/eng/Macrogen_Standard_Primers.pdf',
        kind: 'external',
      },
      {
        label: 'IDT OligoAnalyzer (Kiểm tra ΔG Hairpin & Dimer)',
        url: 'https://sg.idtdna.com/calc/analyzer',
        kind: 'external',
      },
      {
        label: 'NCBI Standard Nucleotide BLAST',
        url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome',
        kind: 'external',
      },
    ],
  },
  {
    id: 'ttsl',
    name: 'Thực tập Sinh lý học',
    shortCode: 'TTSL',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Thực tập',
    summary:
      'Danh sách chia lớp – TKB thực tập, quy định chuẩn bị phiếu điểm danh dán ảnh và hướng dẫn trực tiếp xin học bù tại Văn phòng Bộ môn Sinh lý.',
    highlights: [
      'Lưu ý lịch học: Chiều 15/04 học bài Hô hấp ký',
      'Cắt Phiếu điểm danh ở trang cuối sách, dán ảnh, ghi thông tin nhóm thực tập',
      'Bầu 01 bạn nhóm trưởng gom phiếu thành viên nộp cho bộ môn điểm danh',
    ],
    sections: [
      {
        title: 'Hướng dẫn xin học bù Thực tập Sinh lý học',
        badge: '217 Hồng Bàng',
        items: [
          'Sinh viên phải lên trực tiếp Văn phòng Bộ môn Sinh lý tại Tầng 9 – Tòa nhà 15 tầng (217 Hồng Bàng — đi thang máy lên tầng 9 rồi rẽ phải) để xin phép học bù trực tiếp.',
          'Theo chia sẻ từ giảng viên, cần thông báo sớm cho bộ môn để thể hiện thiện chí và sắp xếp lịch bù lại ngay trong tuần.',
          'Lưu ý: Nếu vắng vào ngày Thứ 6 thì sẽ không thể xin học bù trong tuần đó được — cần chủ động sắp xếp lịch học.',
        ],
      },
    ],
    links: [
      {
        label: 'Danh sách chia lớp & TKB Thực tập Sinh lý (Drive)',
        url: 'https://docs.google.com/folderview?id=1fwFcp-fF53A2MVCXwJjaCMrwe2AaVAJu',
        kind: 'drive',
      },
    ],
  },
  {
    id: 'gdtc3',
    name: 'Giáo dục thể chất 3',
    shortCode: 'GDTC3',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Đại cương & GDQPAN',
    summary:
      'Học phần Giáo dục thể chất 3 thuộc học kỳ 2 Năm 1. Trang môn học trên The D25B Times hiện chưa đăng tải tài liệu bổ sung.',
    highlights: [
      'Theo dõi lịch sân bãi, trang phục thể thao và thông báo phân nhóm trên cổng sinh viên sv.ump.edu.vn',
    ],
    links: [
      {
        label: 'Cổng thông tin Sinh viên UMP (Xem lịch học)',
        url: 'https://sv.ump.edu.vn',
        kind: 'external',
      },
    ],
  },
  {
    id: 'gdqpan',
    name: 'Giáo dục Quốc phòng – An ninh (ĐHQG-HCM)',
    shortCode: 'GDQPAN',
    year: 'year1',
    semester: 'Năm 1 · Học kỳ 2',
    semesterKey: 'y1-hk2',
    category: 'Đại cương & GDQPAN',
    summary:
      'Thông báo kế hoạch đào tạo số 4291/ĐHYD-ĐT & QĐ 4887/QĐ-BQP, đăng ký mã LHP 101600030201 (mã tự quản 71001016, 165 tiết), lịch học tập trung 04/05–29/05/2026 và trọn bộ cẩm nang sinh hoạt tại Trung tâm GDQPAN ĐHQG-HCM.',
    highlights: [
      'Căn cứ Thông báo 4291/ĐHYD-ĐT (24/10/2025) & QĐ 4887/QĐ-BQP (01/10/2025) về phân luồng giảng dạy môn GDQPAN',
      'Mã tự quản: 71001016 (165 tiết) · Mã LHP đăng ký lại: 101600030201 (hạn 24/02/2026)',
      'Thời gian học tập trung: 04/05/2026 – 29/05/2026 tại Trung tâm GDQPAN ĐHQG-HCM',
      '4 học phần: HP1 (45t), HP2 (30t), HP3 (30t), HP4 (30t)',
    ],
    sections: [
      {
        title: 'Tips chuẩn bị đồ dùng & Sinh hoạt thực tế tại Trung tâm GDQPAN',
        badge: 'Kinh nghiệm D25B',
        items: [
          'Bình đựng đá cỡ lớn: Tự hốt đá mang về tiện và tiết kiệm hơn mua 3k/ly.',
          'Thuốc bôi muỗi: Muỗi khu hồ đá và phòng ngủ khá nhiều, nên chuẩn bị sẵn để ngủ ngon.',
          'Quạt điện: Quạt hộp to để được dưới chân giường; quạt nhỏ phải dọn lên kệ trước giờ kiểm tra phòng. Nên mang thêm quạt cầm tay khi học ngoài trời rất nóng.',
          'Xà phòng, nước giặt & đầu lọc nước: Bàn trước mua chung theo tiểu đội để share bill (tránh dùng ké không xin phép). Gần kho quân trang có giặt ủi. Nên gắn đầu lọc nước vì nước bơm từ hồ đá (tắm được nhưng không nên dùng trực tiếp rửa mặt).',
          'Đèn học & Ổ cắm điện: 21h30 tắt đèn phòng mà ngay sau kỳ quân sự là chuỗi ngày thi liên tục nên cần đèn nhỏ ôn bài. Phòng tiêu chuẩn 12 giường chỉ có ~4 ổ cắm → 2–3 bạn nên mang chung 1 ổ cắm nối dài.',
          'Dù & Túi đựng rác: Mang dù che nắng mưa khi ra thao trường; mang túi rác vì chỗ đổ rác rất xa khu nội trú.',
          'Quy tắc cổng & Thú cưng: Mèo khá thân thiện nhưng chó thì không. Người thân đưa đồ ra cổng nhận được nhưng KHÔNG được mặc quần đùi ra cổng nhận đồ.',
        ],
      },
      {
        title: 'Chi tiết 4 Học phần & Thông báo 4291/ĐHYD-ĐT – QĐ 4887/QĐ-BQP',
        items: [
          'HP1: Đường lối quốc phòng và an ninh của Đảng Cộng sản Việt Nam (45 tiết).',
          'HP2: Công tác quốc phòng và an ninh (30 tiết).',
          'HP3: Quân sự chung (30 tiết).',
          'HP4: Kỹ thuật chiến đấu bộ binh và chiến thuật (30 tiết).',
        ],
      },
    ],
    links: [
      {
        label: 'Thông báo kế hoạch đào tạo 4291/ĐHYD-ĐT NH 25-26 (PDF)',
        url: 'https://drive.google.com/file/d/1S0v0VpN3JWLgpoAYplG7W66W3qepz6WU/view?usp=sharing',
        kind: 'drive',
      },
    ],
  },

  // NĂM 2 - HK1 (5 học phần)
  {
    id: 'hpt1',
    name: 'Hóa Phân Tích (THHPT1)',
    shortCode: 'HPT1',
    year: 'year2',
    semester: 'Năm 2 · Học kỳ 1',
    semesterKey: 'y2-hk1',
    category: 'Chuyên ngành Dược',
    summary:
      'Trọn bộ nội quy nộp báo cáo thực hành Hóa Phân Tích 1 (viết tay 100%, ghép 1 PDF lên OneDrive, nộp Form trong 24h), hướng dẫn điền kết quả định lượng và đủ 12 link nộp bài theo từng giảng viên.',
    highlights: [
      'Viết tay 100% (không đánh máy), chụp rõ từng trang, ghép thành 1 file PDF duy nhất đúng tên quy định',
      'Upload PDF lên thư mục riêng trên OneDrive cá nhân, rồi nộp Form đúng giảng viên phụ trách trong vòng 24 giờ',
      'Luôn bấm chọn "Lưu câu trả lời của tôi để chỉnh sửa" để có đường dẫn chỉnh sửa nếu cần (trong hạn 24h)',
      'Ví dụ hạn 24h: Thực hành sáng T2 → hạn 11h sáng T3; Chiều T4 → hạn 17h chiều T5. Nộp trễ hoặc >1 bài = 0 điểm',
    ],
    sections: [
      {
        title: 'Hướng dẫn điền kết quả Mẫu định lượng trên Form',
        badge: 'Chấm điểm tự động',
        items: [
          'Thông tin cá nhân & bài học: Điền chính xác MSSV, họ tên, nhóm, ngày học, buổi học, bài học và đính kèm/tải file PDF (thang điểm chấm riêng theo từng nhóm, ngày, buổi và mã số dung dịch).',
          'Mỗi buổi SV nhận 1–2 mẫu định lượng (mỗi mẫu chứa 1–2 chất định lượng): Mẫu 1 (luôn có mã số + Chất 1.1 luôn có, Chất 1.2 tùy bài) và Mẫu 2 (tùy bài: mã số + Chất 2.1, Chất 2.2).',
          'Ví dụ: Mẫu Natri clorid chỉ chứa 1 chất; Mẫu hỗn hợp acid chứa 2 chất là acid sulfuric và acid phosphoric.',
          'Chất nào có thì nhập kết quả, chất nào không có thì chọn "Không có", kết quả nhập 00 (làm đúng theo hướng dẫn trong form).',
        ],
      },
    ],
    specialTool: 'hpt1-filename',
    links: [
      {
        label: 'Kho tài liệu Hóa Phân Tích – Thư mục 1',
        url: 'https://docs.google.com/folderview?id=1IaRVaRHOHUh0MBEHBixH0zmvOC1locmu',
        kind: 'drive',
      },
      {
        label: 'Kho tài liệu Hóa Phân Tích – Thư mục 2',
        url: 'https://docs.google.com/folderview?id=1JdDPsd0az3jV4doh1IFByT0Bx3T7R-1A',
        kind: 'drive',
      },
      {
        label: 'Kho tài liệu Hóa Phân Tích – Thư mục 3',
        url: 'https://docs.google.com/folderview?id=1SyVJmy3si1g8VElROM9t228QAeZEbXUH',
        kind: 'drive',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Cô Diệp',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edURUtTUTFDRFExQ0xIWUg4TURHVkpGS0laWS4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Cô Thuỷ',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edUQThLSVZZWkNOVDhJWlZIUzMzN1EzNkNENS4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Cô Tú',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edUQjk3SFVHNlFLNVQ3WVA1UUVNUTk4QkdGTy4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Thầy Trọng Tuấn',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edURTYyMlUzNFJFVzczTEI4UTRRU1g0QzJVQS4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Cô Phương',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edURVUxNVpaRUNOVUpaSUNCUFhCTTVSQjJCQi4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Thầy Nam',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edUNEFXQ002MlVBMTFBVFRJRzNaMjEzUVU4RC4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Thầy Việt',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edUOUROWkcyOFRMMjlKUjA4SlJLV1VZTFg1Si4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Cô Dung',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edUQlBFTEhJMk1UWENSN0JNQ1EyVDNXNUVPUi4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Cô Thanh',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edUMEVUOEdIT0szWkIxUVgwTjNDQzRCSDk0VC4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Cô Khuyên',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edUN1M1R1Y2SFdOQlZLMTZCRUlaN1Q3M0pNWS4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Thầy Thành',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edUMzBPOUpYRzdBVVc2WFNSSldQTU4wQVA4UC4u',
        kind: 'forms',
      },
      {
        label: 'Nộp báo cáo THHPT1 – Thầy Đạt',
        url: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovzE7hq-AjuBPrGUtqadM4edUNlFaM0o5WVJVRExPQlVZVFpMVlE0RjhUOS4u',
        kind: 'forms',
      },
    ],
  },
  {
    id: 'hoaly',
    name: 'Hóa Lý Dược',
    shortCode: 'HLD',
    year: 'year2',
    semester: 'Năm 2 · Học kỳ 1',
    semesterKey: 'y2-hk1',
    category: 'Chuyên ngành Dược',
    summary:
      'Trọn bộ 5 thư mục bài giảng Google Drive tương ứng chính xác từng chương từ Hiện tượng bề mặt đến Quá trình lý hóa.',
    highlights: ['Đầy đủ 5 thư mục Google Drive tách riêng theo từng chương học phần'],
    chapters: [
      'Chương 1 – Các hiện tượng bề mặt',
      'Chương 2 – Hệ phân tán',
      'Chương 3 – Động học hóa học',
      'Chương 4 – Điện hóa học',
      'Chương 5 – Kiến thức cơ bản về các quá trình lý hóa',
    ],
    links: [
      {
        label: 'Chương 1 – Các hiện tượng bề mặt (Folder)',
        url: 'https://docs.google.com/folderview?id=1R_97ncddCEdbETR8oTPJgEemrBiDMFFR',
        kind: 'drive',
      },
      {
        label: 'Chương 2 – Hệ phân tán (Folder)',
        url: 'https://docs.google.com/folderview?id=11xJkr9u0dTCtWPe9QVvaF--zRdttP4Nl',
        kind: 'drive',
      },
      {
        label: 'Chương 3 – Động học hóa học (Folder)',
        url: 'https://docs.google.com/folderview?id=1EazkwfvKfKpS9iqgDMWPVoOl5DAZLCiq',
        kind: 'drive',
      },
      {
        label: 'Chương 4 – Điện hóa học (Folder)',
        url: 'https://docs.google.com/folderview?id=1ovM6E1Hgm46LlaLFotZr17vBZbwGW-WC',
        kind: 'drive',
      },
      {
        label: 'Chương 5 – Kiến thức cơ bản quá trình lý hóa (Folder)',
        url: 'https://docs.google.com/folderview?id=1_-khaU125-HFvEaL9vcEUetkmrh8ZZ7u',
        kind: 'drive',
      },
    ],
  },
  {
    id: 'tthld',
    name: 'Thực tập Hóa Lý Dược (PTN 2 – BM. CNDP)',
    shortCode: 'TTHLD',
    year: 'year2',
    semester: 'Năm 2 · Học kỳ 1',
    semesterKey: 'y2-hk1',
    category: 'Thực tập',
    summary:
      'Quy định toàn diện PTN 2 – Bộ môn Công nghệ Dược phẩm: giờ giấc đi trễ 15 phút, lịch xoay vòng 6 tuần theo STT Chẵn/Lẻ, quy tắc nộp báo cáo PDF 48 giờ và điều kiện học bù/thi cuối kỳ.',
    highlights: [
      'Ca sáng bắt đầu: 07:30 · Ca chiều bắt đầu: 13:00 — Đi trễ quá 15 phút tính là VẮNG buổi học đó',
      'Báo cáo viết bằng bút mực xanh dương hoặc mực tím, scan PDF đúng tên file, nộp trong 48 giờ (sai = 0đ)',
      'Điều kiện thi cuối học phần: Tham gia đầy đủ 100% thời lượng tất cả các buổi thực tập',
    ],
    sections: [
      {
        title: 'Lịch trình 6 tuần xoay vòng theo STT Chẵn / Lẻ',
        badge: 'PTN 2 · BM. CNDP',
        items: [
          'TUẦN 1: Bài pH – Độ dẫn điện (Nhóm STT Lẻ) | Bài Động học phản ứng bậc một (Nhóm STT Chẵn).',
          'TUẦN 2: Bài pH – Độ dẫn điện (Nhóm STT Chẵn) | Bài Động học phản ứng bậc một (Nhóm STT Lẻ).',
          'TUẦN 3: Bài Động học phản ứng bậc hai (Nhóm STT Lẻ + Chẵn).',
          'TUẦN 4: Bài Hệ phân tán (Nhóm STT Lẻ) | Bài Sự hấp phụ của acid acetic trên than hoạt tính (Nhóm STT Chẵn).',
          'TUẦN 5: Bài Hệ phân tán (Nhóm STT Chẵn) | Bài Sự hấp phụ của acid acetic trên than hoạt tính (Nhóm STT Lẻ).',
          'TUẦN 6: Đánh giá cuối học phần (chia ca theo danh sách thi được thông báo).',
        ],
      },
      {
        title: 'Quy định Trong phòng lab, Nộp báo cáo (48h) & Học bù',
        items: [
          'Trong quá trình thực tập: củng cố thuật ngữ, nguyên lý, quy trình, phân tích từng thí nghiệm và liên hệ ứng dụng với các môn học khác.',
          'Vệ sinh & sắp xếp cuối buổi: rửa sạch dụng cụ, sắp xếp hóa chất – thiết bị đúng chỗ trước khi ra về; sinh viên kiểm tra lẫn nhau, GV sẽ trừ điểm nhóm vi phạm.',
          'Báo cáo viết tay bằng bút mực xanh dương hoặc mực tím, scan/lưu PDF đúng quy định tên file, nộp đúng nhóm trong 48 giờ sau buổi thực tập. Sai tên file/trễ hạn/sai nhóm = 0 điểm.',
          'Học bù: tối đa 1 buổi/học phần; nộp đơn mẫu cho giáo vụ bộ môn tối thiểu 48 giờ trước ngày học bù để được duyệt; nộp báo cáo vào mục SV học bù trên e-learning ghi rõ nhóm và ngày đi bù.',
        ],
      },
    ],
    facultyContact: [
      'Phó Trưởng BM. CNDP: PGS.TS. Trần Phi Hoàng Yến (yen.tranphihoang@ump.edu.vn)',
      'Giáo vụ BM. CNDP: TS. Nguyễn Đăng Khoa (ndkhoa@ump.edu.vn)',
      'Lớp trưởng D25B: SV. Nguyễn Minh Huy (nmhuy.duoc25@ump.edu.vn)',
    ],
    specialTool: 'ptn2-checklist',
    links: [
      {
        label: 'Trang thông báo gốc Thực tập Hóa Lý Dược',
        url: 'https://sites.google.com/view/the-d25b-times/n%C4%83m-2/hk1/th%E1%BB%B1c-t%E1%BA%ADp-ho%C3%A1-l%C3%BD-d%C6%B0%E1%BB%A3c',
        kind: 'external',
      },
    ],
  },
  {
    id: 'hhc2',
    name: 'Hóa Hữu Cơ 2',
    shortCode: 'HHC2',
    year: 'year2',
    semester: 'Năm 2 · Học kỳ 1',
    semesterKey: 'y2-hk1',
    category: 'Chuyên ngành Dược',
    summary:
      'Trang thông tin học phần Hóa Hữu Cơ 2 dành cho khóa D25, cập nhật phạm vi Nội dung thi giữa kỳ Hóa Hữu Cơ 2 – D25.',
    highlights: [
      'Mục chính trên site: Nội dung thi giữa kỳ Hóa Hữu Cơ 2 – D25 (dạng bảng tổng hợp hình ảnh trên trang môn học)',
    ],
    links: [
      {
        label: 'Xem bảng Nội dung thi giữa kỳ HHC2 – D25 (Site gốc)',
        url: 'https://sites.google.com/view/the-d25b-times/n%C4%83m-2/hk1/ho%C3%A1-h%E1%BB%AFu-c%C6%A1-2',
        kind: 'external',
      },
    ],
  },
  {
    id: 'tacn2',
    name: 'Tiếng Anh Chuyên Ngành 2',
    shortCode: 'TACN2',
    year: 'year2',
    semester: 'Năm 2 · Học kỳ 1',
    semesterKey: 'y2-hk1',
    category: 'Chuyên ngành Dược',
    summary:
      'Tiếp nối bộ giáo trình Tiếng Anh chuyên ngành Dược học: thuật ngữ dược lâm sàng, đọc hiểu tài liệu chuyên môn, viết và giao tiếp học thuật.',
    highlights: [
      'EBook: English in Pharmacy – Luisa Benigni ([Biophavn] English in Pharmacy - YDS.pdf)',
      'EBook: English for Pharmacy Writing and Oral Communication (PDF)',
    ],
    links: [
      {
        label: 'EBook English in Pharmacy – Luisa Benigni (PDF)',
        url: 'https://drive.google.com/open?id=1KE1UYUcMssLzTJ7YEMKB0WfK85OHCV94',
        kind: 'drive',
      },
      {
        label: 'English for Pharmacy Writing & Oral Communication (PDF)',
        url: 'https://drive.google.com/open?id=1cURYOMgNaHoRNVFgReIC3SYo1XUabZg1',
        kind: 'drive',
      },
    ],
  },
];

export const DEADLINES: DeadlineTask[] = [
  {
    id: 'dkhp-k26-hk2',
    title: 'Dự kiến khóa K26 đăng ký học phần HK2 năm học 2026–2027 (Cổng SV UMP)',
    category: 'Đăng ký học phần',
    dueLabel: 'Từ 26/12/2026 (Dự kiến)',
    eventDate: '2026-12-26',
    expiresAt: '2026-12-26T23:59:59+07:00',
    statusLabel: 'Sắp tới',
    audience: 'Khóa K26 (tham khảo kèm quy định chung HK2 NH 2026–2027)',
    summary:
      'Mốc dự kiến mở cổng đăng ký học phần HK2 NH 2026–2027 cho khóa K26 cùng toàn bộ quy định khối lượng tín chỉ, học phần tiếng Anh và TKB dự kiến từ Phòng KH-ĐT-ĐN.',
    details: [
      'Mốc mở cổng dự kiến cho khóa K26: từ ngày 26/12/2026 trên cổng sv.ump.edu.vn.',
      'Thời khóa biểu dự kiến tham khảo: file (DỰ KIẾN) TKB HK2_NĂM HỌC 2026-2027 (GỞI SV_02.11.2026).xlsx.',
      'Quy định đối với D2023, D2024, D2025, HD24, HD25: Khối lượng đăng ký tối thiểu không ít hơn 2/3 và tối đa không vượt quá 3/2 khối lượng trung bình 1 học kỳ theo kế hoạch học tập chuẩn.',
      'Sinh viên (nguy cơ) bị cảnh báo học tập 2 kỳ liên tiếp hoặc >= 2 lần chỉ nên đăng ký học lại/học cải thiện; SV bị xếp trình độ năm học chỉ được đăng ký học lại/cải thiện.',
      'Nhóm học phần giảng dạy bằng tiếng Anh: 01–02 nhóm (30 SV/nhóm, ưu tiên đăng ký sớm). Nếu không theo kịp có thể chuyển sang nhóm tiếng Việt; Phụ lục văn bằng toàn khóa vẫn ghi ngôn ngữ đào tạo là tiếng Việt.',
      'Đối với D2022: Học phần tốt nghiệp (Khóa luận hoặc Cập nhật kiến thức chuyên ngành) = 8 tín chỉ; Học phần tự chọn = 6 tín chỉ (mở lớp tối thiểu 40 SV; Học phần GD liên ngành 2 bắt buộc cho ĐHCN Chăm sóc dược học tại 215 & 217 Hồng Bàng).',
      'Đối với D2021 trở về trước: Cập nhật kiến thức chuyên ngành D20 = 8 TC, D21 và từ D19 trở về trước = 10 TC; nếu HK2 không mở lại học phần tự chọn bị rớt trước đó có thể đổi sang học phần tự chọn tương đương.',
    ],
    links: [
      {
        label: '(DỰ KIẾN) TKB HK2_NĂM HỌC 2026-2027 (.xlsx)',
        url: 'https://umpedu-my.sharepoint.com/:x:/g/personal/nguyenthithuong_ump_edu_vn/IQDmZQVSe2dnT7ZXAKbbEoy1AWOdQyOICLLf8_q8okv2oL4?e=h3CtQp',
        kind: 'sheets',
      },
      {
        label: 'Cổng thông tin Sinh viên (sv.ump.edu.vn)',
        url: 'https://sv.ump.edu.vn',
        kind: 'external',
      },
    ],
    externalUrl: 'https://sv.ump.edu.vn',
  },
  {
    id: 'dkhp-hk2',
    title: 'Đăng ký học phần HK2 năm học 2026–2027 (D22–D25 & HD24–HD25)',
    category: 'Đăng ký học phần',
    dueLabel: 'D25: 14:00 09/11/2026 – 16:00 11/11/2026',
    eventDate: '2026-11-11',
    expiresAt: '2026-11-11T16:00:00+07:00',
    statusLabel: 'Khẩn cấp',
    audience: 'Sinh viên D22, D23, D24, D25, HD24, HD25',
    summary:
      'Mở cổng đăng ký theo khung giờ từng khóa. Kiểm tra kỹ TKB dự kiến (cập nhật 02/11/2026) trước khi bấm xác nhận.',
    details: [
      'D24: 07:00 ngày 07/11/2026 (Thứ 7) – 16:00 ngày 11/11/2026.',
      'D23: 13:00 ngày 07/11/2026 (Thứ 7) – 16:00 ngày 11/11/2026.',
      'HD24; HD25: 14:00 ngày 08/11/2026 (Chủ nhật) – 16:00 ngày 11/11/2026.',
      'D22: 08:00 ngày 09/11/2026 (Thứ 2) – 16:00 ngày 11/11/2026.',
      'D25: 14:00 ngày 09/11/2026 (Thứ 2) – 16:00 ngày 11/11/2026.',
    ],
    links: [
      {
        label: '(DỰ KIẾN) TKB HK2_NĂM HỌC 2026-2027 (.xlsx)',
        url: 'https://umpedu-my.sharepoint.com/:x:/g/personal/nguyenthithuong_ump_edu_vn/IQDmZQVSe2dnT7ZXAKbbEoy1AWOdQyOICLLf8_q8okv2oL4?e=h3CtQp',
        kind: 'sheets',
      },
    ],
    externalUrl: 'https://sv.ump.edu.vn',
  },
  {
    id: 'ngoai-tru',
    title: 'Đăng ký thông tin Ngoại trú, Nội trú (Năm học 2026–2027)',
    category: 'Học vụ & BHYT',
    dueLabel: '10/10/2026 (Thứ Bảy)',
    eventDate: '2026-10-10',
    expiresAt: '2026-10-10T23:59:59+07:00',
    statusLabel: 'Khẩn cấp',
    audience: 'Toàn thể sinh viên Lớp D25B',
    summary:
      'Nhiệm vụ hệ thống bắt buộc trên cổng sinh viên để phục vụ công tác quản lý cư trú và xét điểm rèn luyện.',
    details: [
      'Cập nhật thông tin nơi ở hiện tại (Ngoại trú / Nội trú KTX) trên tài khoản cổng sinh viên sv.ump.edu.vn.',
      'Đây là điều kiện bắt buộc phục vụ công tác quản lý sinh viên và là minh chứng quan trọng trong mục đánh giá Điểm rèn luyện học kỳ.',
    ],
    externalUrl: 'https://sv.ump.edu.vn',
  },
  {
    id: 'sv-5-tot',
    title: 'Nộp giấy xác nhận xét chọn "Sinh viên 5 Tốt" Trường Dược 2025–2026',
    category: 'Hoạt động & ĐRL',
    dueLabel: '18/09/2026 – 28/09/2026 (08:00–17:00, trừ T7/CN)',
    eventDate: '2026-09-28',
    expiresAt: '2026-09-28T17:00:00+07:00',
    statusLabel: 'Sắp tới',
    audience: 'Sinh viên từ năm 2 Trường Dược ĐHYD TP.HCM',
    summary:
      'Nộp bản cứng tại Văn phòng Đoàn – Hội Trường Dược (41-43 Đinh Tiên Hoàng). Đề xuất biểu mẫu & bảng điểm sớm trước 4–6 ngày.',
    details: [
      '5 tiêu chí xét chọn: Đạo đức tốt – Học tập tốt – Thể lực tốt – Tình nguyện tốt – Hội nhập tốt.',
      'Thời gian tiếp nhận giấy xác nhận: 08:00–17:00 từ 18/09/2026 đến 28/09/2026 (không nhận T7 và CN).',
      'Địa điểm: Văn phòng Đoàn – Hội Trường Dược (41–43 Đinh Tiên Hoàng, P. Sài Gòn, TP.HCM).',
    ],
    actionTab: { section: 'handbook', handbookTab: 'drl', label: 'Xem bộ tiêu chí & biểu mẫu' },
  },
  {
    id: 'gdqpan-schedule',
    title: 'Kế hoạch học tập trung Giáo dục Quốc phòng – An ninh (ĐHQG-HCM)',
    category: 'Học vụ & BHYT',
    dueLabel: '04/05/2026 – 29/05/2026',
    eventDate: '2026-05-29',
    expiresAt: '2026-05-29T17:00:00+07:00',
    statusLabel: 'Sắp tới',
    audience: 'Khóa D25B (4 học phần: 135 tiết)',
    summary:
      'Theo thông báo số 4291/ĐHYD-ĐT và QĐ 4887/QĐ-BQP về phân luồng giảng dạy môn GDQPAN năm học 2025–2026.',
    details: [
      'Học tập trung tại Trung tâm GDQPAN ĐHQG-HCM từ 04/05/2026 đến 29/05/2026.',
      'Gồm 4 học phần: HP1 (45 tiết), HP2 (30 tiết), HP3 (30 tiết), HP4 (30 tiết).',
    ],
    actionTab: { section: 'study', courseId: 'gdqpan', label: 'Mở học phần GDQPAN' },
    externalUrl: 'https://drive.google.com/file/d/1S0v0VpN3JWLgpoAYplG7W66W3qepz6WU/view?usp=sharing',
  },
  {
    id: 'psu-aun-camp',
    title: 'Trại hè PSU – AUN Summer Camp 2026 tại Thái Lan (3 tín chỉ)',
    category: 'Hoạt động & ĐRL',
    dueLabel: 'Học online: 01–30/04/2026 · Đăng ký trước 25/03/2026',
    eventDate: '2026-03-25',
    expiresAt: '2026-03-25T23:59:59+07:00',
    statusLabel: 'Tham khảo',
    audience: 'Chỉ tiêu 01–02 sinh viên / Trường cử đi',
    summary:
      'Chủ đề "Hương vị miền Nam Thái Lan — Kết nối văn hóa qua Ẩm thực" do Đại học Prince of Songkla đăng cai.',
    details: [
      'Trại hè cấp 3 tín chỉ: học trực tuyến 01–30/04/2026 và trực tiếp tại Thái Lan 05–18/05/2026.',
      'PSU đài thọ chỗ ở, phần lớn bữa ăn, di chuyển địa phương và học phí (100 USD).',
    ],
    actionTab: { section: 'handbook', handbookTab: 'admin', label: 'Xem thông báo trường – lớp' },
  },
  {
    id: 'bhyt-9m',
    title: 'Đăng ký mua Bảo hiểm Y tế đợt 9 tháng (01/04 – 31/12/2026)',
    category: 'Học vụ & BHYT',
    dueLabel: '16:00 · 20/03/2026',
    eventDate: '2026-03-20',
    expiresAt: '2026-03-20T16:00:00+07:00',
    statusLabel: 'Đang mở',
    audience: 'Sinh viên chưa mua BHYT đợt trước hoặc thẻ hết hạn',
    summary:
      'Bắt buộc hoàn thành đủ 2 bước: điền Form Office và chuyển khoản 473.850đ đúng cú pháp BHYT MSSV HỌ VÀ TÊN.',
    details: [
      'Mức đóng 473.850 VNĐ, hạn chót 16:00 ngày 20/03/2026.',
      'Thẻ BHYT tra cứu và sử dụng trên ứng dụng VssID khi đi khám chữa bệnh.',
    ],
    actionTab: { section: 'handbook', handbookTab: 'bhyt', label: 'Mở hướng dẫn & tạo cú pháp CK' },
  },
];

// Thông báo cập nhật tính năng & nội dung mới trên app — tự động hiển thị trong 7 ngày kể từ updatedAt
export const APP_UPDATES: AppUpdateItem[] = [
  {
    id: 'upd-hk2-schedule-20261125',
    title: 'Tích hợp TKB Học kỳ II NH 2026–2027 (D25A, D25B, D25C, D25D) & Thu gọn Bộ đếm lịch',
    category: 'Tính năng mới',
    updatedAt: '2026-11-25T19:20:00+07:00',
    ttlDays: 7,
    summary:
      'Bổ sung trọn bộ lịch học, lịch thực tập TT KST / TT HPT2, lịch bù Tết DL và lịch thi HK2 năm học 2026–2027 cho 4 lớp D25A, D25B, D25C, D25D vào Bộ đếm lịch.',
    details: [
      'Phân tách rõ lịch học của 4 lớp: D25A, D25B, D25C và D25D theo đúng từng ngày và ca học (Sáng / Chiều).',
      'Đánh dấu đầy đủ ngày nghỉ lễ (Ngày Văn hóa VN 24/11/2026, Tết Dương lịch 01/01/2027, Nghỉ Tết Nguyên Đán 25/01–14/02/2027), các buổi bù Tết DL (05/01, 07/01, 09/01) và các ngày thi kết thúc học phần.',
      'Rút gọn Bộ đếm lịch theo ngày thành thanh tóm tắt gọn nhẹ mặc định; bấm trực tiếp vào mục Bộ đếm lịch để mở toàn bộ lịch tháng và tra cứu từng ngày theo 4 lớp.',
    ],
    target: { section: 'deadline', label: 'Mở Lịch & Bộ đếm ngày' },
  },
  {
    id: 'upd-calendar-sync-20261125',
    title: 'Ra mắt Bộ đếm lịch theo ngày thời gian thực & Tự động lọc tin quá hạn',
    category: 'Tính năng mới',
    updatedAt: '2026-11-25T18:00:00+07:00',
    ttlDays: 7,
    summary:
      'Đồng bộ đồng hồ & lịch tháng theo ngày thực tế, tự động ẩn các deadline đã hết hạn khỏi bảng chính và chuyển toàn bộ nội dung lưu trữ sang Học tập và Cẩm nang.',
    details: [
      'Đồng bộ thời gian thực theo từng ngày: hiển thị lịch tháng tương tác, đánh dấu ngày hôm nay và đếm ngược số ngày còn lại đến các mốc tiếp theo.',
      'Các deadline đã qua hạn (BHYT đợt 9 tháng, ĐKHP HK2 các khóa 11/11, Ngoại trú 10/10, SV 5 Tốt 28/09, GDQPAN 05/2026, PSU–AUN Summer Camp) được tự động dọn khỏi danh sách đang mở và phân bổ đầy đủ vào Cẩm nang & Học tập.',
      'Đã gỡ bỏ khung thời gian ĐKHP HK2 và bảng dữ liệu bên dưới theo yêu cầu; toàn bộ quy định ĐKHP HK2 (D22–D25 & K26) và file TKB dự kiến được tích hợp dạng thẻ bấm xem chi tiết.',
      'Mọi cập nhật mới trên The D25B Times sẽ tự động hiển thị tại mục này trong vòng 7 ngày kể từ ngày sửa đổi.',
    ],
    target: { section: 'handbook', handbookTab: 'admin', label: 'Xem kho lưu trữ tại Cẩm nang' },
  },
  {
    id: 'upd-site-notices-20261125',
    title: 'Bổ sung trọn bộ Thông báo Trường – Lớp, Học phí, Gửi xe 2026 & ĐRL từ Google Site',
    category: 'Cẩm nang & Thông báo',
    updatedAt: '2026-11-25T18:00:00+07:00',
    ttlDays: 7,
    summary:
      'Cập nhật chính xác quy định gửi xe miễn phí 100% từ 01/01/2026, tiện ích Văn phòng Đoàn – Hội, quy định nghỉ học/vắng mặt, Điểm rèn luyện và hơn 15 văn bản SharePoint đầu khóa.',
    details: [
      'Mục Tân sinh viên & UMPSP: cập nhật giờ mở cửa nhà xe (T2–T7: 06:00–21:00; CN: 06:00–17:00), vé khách/chuyên đề 4.000đ/lượt, thủ tục khi mất thẻ xe (CCCD + Giấy tờ xe + Thẻ SV) và các tiện ích tại VP Đoàn – Hội (mượn blouse, mũ bảo hiểm, in ấn 250đ/tờ).',
      'Mục Điểm rèn luyện & SV 5 Tốt: tích hợp đầy đủ hướng dẫn chấm ĐRL 2026, quy định Minigame không copy-paste, cú pháp đặt tên file PDF minh chứng HK1 (sai trừ 2 điểm) và link danh sách hoạt động cấp Trường.',
      'Mục Tổ chức lớp & Văn bản: bổ sung PSU–AUN Summer Camp 2026, Đối thoại Lãnh đạo Trường Dược, Khảo sát IBM SPSS V31, Lớp Cảm tình Đoàn, Chiến dịch Xuân Tình Nguyện, Gia hạn học phí NH 25–26, link E-portfolio theo CVHT Cô Dung / Thầy Minh và đầy đủ link SharePoint các quy chế 838, 1691, 1497, 5158, 1706, 2971, 792, 5333, 3767.',
    ],
    target: { section: 'handbook', handbookTab: 'campus', label: 'Mở Cẩm nang UMPSP' },
  },
  {
    id: 'upd-study-preview-20261125',
    title: 'Đồng bộ đủ 19 học phần từ Site & Khung xem trước tài liệu trực tiếp trong Học tập',
    category: 'Cập nhật học tập',
    updatedAt: '2026-11-25T18:00:00+07:00',
    ttlDays: 7,
    summary:
      'Hợp nhất đầy đủ nội dung các bài đăng từ site vào từng học phần (TACN1, 13 môn HK2, 5 môn Năm 2 HK1) kèm khung xem trước Drive/Docs/Sheets/YouTube và ngăn kéo danh sách bên trái.',
    details: [
      'Danh sách học kỳ hiển thị trọn vẹn không thu gọn khi mở kho học phần; thanh trượt danh sách môn nằm gọn ở cạnh trái màn hình để ưu tiên tối đa không gian đọc nội dung.',
      'Bổ sung đầy đủ thông báo 4291/ĐHYD-ĐT & QĐ 4887/QĐ-BQP vào môn GDQPAN cùng toàn bộ tips sinh hoạt tại Trung tâm GDQPAN ĐHQG-HCM.',
      'Bấm vào từng tài liệu trong mục "Truy cập nhanh tài liệu & thư mục" để xem trước trực tiếp ngay bên dưới mà không cần mở nhiều tab rời.',
    ],
    target: { section: 'study', label: 'Mở Kho Học tập' },
  },
];

export const SCHOOL_NOTICES: SchoolNoticeItem[] = [
  {
    id: 'notice-dkhp-hk2',
    title: 'Quy định & Thời khóa biểu dự kiến Đăng ký học phần HK2 NH 2026–2027',
    category: 'Học vụ & ĐKHP',
    dateLabel: 'Cập nhật 02/11/2026 · K26 dự kiến 26/12/2026',
    audience: 'Toàn thể SV D22, D23, D24, D25, HD24, HD25 & K26',
    summary:
      'Lưu trữ trọn bộ thông báo ĐKHP HK2 NH 2026–2027 trên cổng sv.ump.edu.vn cùng các lưu ý tín chỉ tốt nghiệp, tự chọn và nhóm giảng dạy tiếng Anh.',
    details: [
      'Khung thời gian đã diễn ra (D22–D25 & HD24–HD25): D24 (07:00 07/11 – 16:00 11/11), D23 (13:00 07/11 – 16:00 11/11), HD24 & HD25 (14:00 08/11 – 16:00 11/11), D22 (08:00 09/11 – 16:00 11/11), D25 (14:00 09/11 – 16:00 11/11). Khóa K26 dự kiến mở ĐKHP HK2 từ ngày 26/12/2026.',
      '1/ Đối với SV D2022: Học phần tốt nghiệp (Khóa luận hoặc Cập nhật kiến thức chuyên ngành) = 8 tín chỉ; Học phần tự chọn không phân định hướng chuyên ngành = 6 tín chỉ (nếu HK1 đã học Kỹ năng cơ bản trong NCKH Dược — bắt buộc cho làm Khóa luận — thì HK2 đăng ký thêm 2 học phần tự chọn cho đủ 6 TC; ngày 12/11/2026 Phòng rà soát và hủy ngẫu nhiên nếu > 6 TC tự chọn; lớp tự chọn mở khi >= 40 SV). Học phần Giáo dục liên ngành 2 bắt buộc cho ĐHCN Chăm sóc dược, học tại 215 Hồng Bàng (BV ĐHYD) và 217 Hồng Bàng.',
      '2/ Đối với D2023, D2024, D2025, HD24, HD25: Học phần Giáo dục liên ngành 1 (D2023) học tại Giảng đường 217 Hồng Bàng. Khối lượng đăng ký tối thiểu >= 2/3 và tối đa <= 3/2 khối lượng trung bình một học kỳ theo kế hoạch học tập chuẩn.',
      'Cảnh báo học tập: SV (nguy cơ) bị cảnh báo 2 kỳ liên tiếp hoặc >= 2 lần chỉ nên đăng ký học lại/cải thiện để tránh bị buộc thôi học; SV bị xếp trình độ năm học chỉ được đăng ký học lại/học cải thiện.',
      'Nhóm giảng dạy bằng tiếng Anh: 01–02 nhóm (30 SV/nhóm, ưu tiên đăng ký sớm); nếu học không kịp tiến độ có thể chuyển sang nhóm tiếng Việt; Phụ lục văn bằng toàn khóa ghi ngôn ngữ đào tạo là tiếng Việt.',
      '3/ Đối với D2021 trở về trước: Cập nhật kiến thức chuyên ngành (Khóa D20: 8 TC; Khóa D21 & từ D19 trở về trước: 10 TC). Học phần tự chọn bị rớt nếu HK2 không mở lớp được phép đổi sang học phần tự chọn tương đương.',
    ],
    links: [
      {
        label: '(DỰ KIẾN) TKB HK2_NĂM HỌC 2026-2027 (GỞI SV_02.11.2026).xlsx',
        url: 'https://umpedu-my.sharepoint.com/:x:/g/personal/nguyenthithuong_ump_edu_vn/IQDmZQVSe2dnT7ZXAKbbEoy1AWOdQyOICLLf8_q8okv2oL4?e=h3CtQp',
        kind: 'sheets',
      },
      {
        label: 'Cổng thông tin Sinh viên (sv.ump.edu.vn)',
        url: 'https://sv.ump.edu.vn',
        kind: 'external',
      },
    ],
  },
  {
    id: 'notice-nghi-hoc-cvht',
    title: 'Khi bạn muốn nghỉ học, vắng mặt, đi muộn & Chia tổ theo CVHT / E-portfolio',
    category: 'Sinh hoạt lớp',
    dateLabel: 'Quy định thường xuyên · BCS D25B',
    audience: 'Toàn thể sinh viên Lớp D25B',
    summary:
      'Hướng dẫn xin nghỉ học/vắng mặt qua tổ trưởng, giới hạn đi trễ thực tập 15 phút, giới hạn cúp học và link tra cứu danh sách CVHT + nộp E-portfolio.',
    details: [
      'Lớp trưởng sẽ không điểm danh nếu không có yêu cầu từ thầy cô; tuy nhiên tuyệt đối không chủ quan.',
      '1. Xin nghỉ học / vắng mặt: Chỉ cần thông báo cho Tổ trưởng (nếu giảng viên yêu cầu điểm danh, Lớp trưởng sẽ tổng hợp danh sách báo vắng từ các tổ trưởng).',
      '2. Xin đi muộn: Giảng đường lý thuyết đi muộn không cần xin phép. Riêng buổi thực tập phải tới muộn nhất là 15 phút sau khi vào lớp hoặc làm thủ tục học bù. Các tiết Thể dục báo lớp trưởng hoặc tổ trưởng.',
      'Cảnh báo giới hạn: Vắng quá 3 buổi mỗi môn lý thuyết hoặc vắng 1 buổi thực tập không phép/không bù sẽ phải học lại.',
      'E-portfolio Hồ sơ sinh viên trực tuyến D2025: Điền file mẫu PDF (chú ý hạn chế chỉnh sửa nhiều lần vì hệ thống ghi nhận bản cuối; thông tin bảo mật giữa Thầy/Cô CVHT, SV và Nhà trường).',
    ],
    links: [
      {
        label: 'Danh sách lớp – Chia theo CVHT (Sheets)',
        url: 'https://docs.google.com/spreadsheets/d/1i5-VuVTrMAo8dweaUhmF_3c7zmNQ7BK8b0-JdAFmR9I/edit?usp=sharing',
        kind: 'sheets',
      },
      {
        label: 'File theo dõi sinh viên (Drive)',
        url: 'https://drive.google.com/drive/folders/1mcNfOxyaQ0X-1lijoCzab8ElkI3l9pHx?usp=drive_link',
        kind: 'drive',
      },
      {
        label: 'E-portfolio D2025 – CVHT Cô Nguyễn Thị Ngọc Dung',
        url: 'https://forms.office.com/r/bpLzcM1t4w',
        kind: 'forms',
      },
      {
        label: 'E-portfolio D2025 – CVHT Thầy Quang Trọng Minh',
        url: 'https://forms.office.com/r/KHFmVgCPHY',
        kind: 'forms',
      },
    ],
  },
  {
    id: 'notice-hoc-phi',
    title: 'Quy định đóng học phí & Hồ sơ gia hạn học phí NH 2025–2026',
    category: 'Học phí & Hỗ trợ',
    dateLabel: 'Thông báo 2943 & Gia hạn HK2 NH 25–26',
    audience: 'Sinh viên ĐHYD TP.HCM & Lớp D25B',
    summary:
      'Thông báo 2943 đóng học phí, điều kiện và mẫu đơn xin gia hạn thời gian đóng học phí HK2 cùng hướng dẫn nộp trực tuyến qua OneUni / chuyển khoản.',
    details: [
      'Hình thức trực tuyến: đóng qua ứng dụng di động OneUni hoặc trang sv.ump.edu.vn để cập nhật công nợ trực tiếp.',
      'Hình thức chuyển khoản: sau 3–5 ngày hành chính công nợ sẽ cập nhật trên trang sinh viên.',
      'Hồ sơ xin gia hạn đóng học phí HK2 (nộp về Phòng KH-ĐT-ĐN 41 Đinh Tiên Hoàng): gồm Đơn xin gia hạn theo mẫu + Sổ hộ nghèo/cận nghèo hoặc giấy xác nhận hoàn cảnh khó khăn có xác nhận địa phương (lưu ý phải hoàn tất học phí các kỳ trước đó).',
    ],
    links: [
      {
        label: '2943_THÔNG BÁO ĐÓNG HỌC PHÍ NH 25-26.pdf',
        url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/EXyS9tgIDAZNsSdMBtoGhXoBvrU11zGzyWREz5q4QzUe1Q?e=XqhLsp',
        kind: 'external',
      },
      {
        label: 'Thông báo thời gian gia hạn đóng học phí HK2 NH 25-26.pdf',
        url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/Ef5LmE7ll2hAk9nIiFqdAykBbAes5SJmrCT4VvnylHihhA?e=9i6kqY',
        kind: 'external',
      },
      {
        label: 'Mẫu đơn xin gia hạn thời gian đóng học phí NH 25-26.docx',
        url: 'https://umpedu-my.sharepoint.com/:w:/g/personal/ree_sp_ump_edu_vn/EcHCI2EjZzNDkJwDPEg02ysB1xYvnTiD1bfqIM9Sqwd8nQ?e=nNlsWH',
        kind: 'external',
      },
      {
        label: 'Video hướng dẫn đóng học phí qua OneUni & sv.ump.edu.vn',
        url: 'https://sv.ump.edu.vn/sinh-vien/tin-tuc/phim-huong-dan-dong-hoc-phi-qua-ung-dung-di-dong-oneuni-va-trang-svumpeduvn.html?pIDDanhMuc=13',
        kind: 'external',
      },
    ],
  },
  {
    id: 'notice-psu-aun',
    title: 'Trại hè PSU – AUN Summer Camp 2026 tại Thái Lan (3 tín chỉ)',
    category: 'Hoạt động Trường',
    dateLabel: 'Lưu trữ · Online 01–30/04/2026 · Trực tiếp 05–18/05/2026',
    audience: 'Sinh viên Trường Dược (chỉ tiêu 01–02 SV/Trường)',
    summary:
      'Chương trình trao đổi sinh viên tích hợp cấp 3 tín chỉ tại Đại học Prince of Songkla (PSU, Thái Lan), chủ đề "Hương vị miền Nam Thái Lan — Kết nối văn hóa qua Ẩm thực".',
    details: [
      'Tên chương trình: PSU-AUN Summer Camp 2026 — Chủ đề "Taste of Southern Thailand — Connecting Cultures through Gastronomy" (3 tín chỉ: 2-2-5).',
      'Thời gian diễn ra: Học trực tuyến từ 01–30/04/2026; Chương trình trực tiếp tại Thái Lan từ 05/05/2026 đến 18/05/2026.',
      'Các mốc thời gian: Gia hạn ứng tuyển 04–20/03/2026; Hạn Trường đề cử 13/03/2026 (15:00); Hạn đăng ký 25/03/2026; Xác nhận trực tiếp trước 31/03/2026; Gửi thư chấp nhận từ 03/04/2026.',
      'Hỗ trợ tài chính: PSU đài thọ chỗ ở, phần lớn bữa ăn, di chuyển địa phương và học phí (100 USD). Sinh viên/Trường cử đi tự túc vé máy bay khứ hồi, bảo hiểm và chi phí cá nhân.',
    ],
    links: [
      {
        label: 'Nomination Form: PSU-AUN Summer Camp 2026',
        url: 'https://forms.office.com/pages/responsepage.aspx?id=Z05jjmad0kalKeG3CMXYvDatYXjTqlNEsfQv_C1bK0BUOTdHUzhFN0Q5OU0zUVg5MjFZRjVIMUVTNS4u&route=shorturl',
        kind: 'forms',
      },
      {
        label: 'Website chính thức (mobility.psu.ac.th)',
        url: 'https://mobility.psu.ac.th/',
        kind: 'external',
      },
      {
        label: 'Poster PSU-AUN Summer Camp 2026 (Drive)',
        url: 'https://drive.google.com/file/d/1VeJxxBoRNq--ySrRW9_13dUsxkF0I5QX/view',
        kind: 'drive',
      },
      {
        label: 'Mô tả chi tiết chương trình (PDF)',
        url: 'https://drive.google.com/file/d/13nlV9-LRejMCCm9GTDqh4182V02G2An0/view',
        kind: 'drive',
      },
      {
        label: 'Sổ tay thông tin Booklet (PDF)',
        url: 'https://drive.google.com/file/d/1af154w18v9hI_s42r4xNVhjFSUhFMxNA/view',
        kind: 'drive',
      },
    ],
  },
  {
    id: 'notice-doi-thoai-doan',
    title: 'Đối thoại cùng Lãnh đạo Trường Dược 2025–2026 & Lớp Cảm tình Đoàn 2026',
    category: 'Hoạt động Trường',
    dateLabel: 'Lưu trữ · Tháng 03/2026',
    audience: 'Sinh viên Dược chính quy (90 SV/khối) & Hóa Dược (20 SV/khối)',
    summary:
      'Diễn đàn trao đổi trực tiếp với Lãnh đạo Trường Dược về học tập, cơ sở vật chất, cộng ĐRL mục 3.1.1; kèm thông báo Lớp học Cảm tình Đoàn 2026 kỷ niệm 95 năm thành lập Đoàn.',
    details: [
      'Đối thoại cùng Sinh viên Trường Dược 2025–2026: 17:00–19:30 Thứ Ba ngày 17/03/2026 tại Đại Giảng Đường Trường Dược (giới hạn 90 SV Dược chính quy/khối, 20 SV Hóa Dược/khối; được tính ĐRL mục Văn hóa cấp Trường 3.1.1).',
      'Lớp tìm hiểu về Đoàn TNCS Hồ Chí Minh năm 2026 (Lớp Cảm tình Đoàn): 08:00 Thứ Bảy ngày 14/03/2026 tại Giảng đường 3D – Tòa nhà 15 tầng.',
    ],
    links: [
      {
        label: 'Form đăng ký Đối thoại Lãnh đạo Trường Dược',
        url: 'https://forms.office.com/r/Atj79stuEr',
        kind: 'forms',
      },
      {
        label: 'Form đăng ký Lớp Cảm tình Đoàn 2026',
        url: 'https://forms.office.com/Pages/ResponsePage.aspx?id=-Miz6oh0D0aitEEurd6ovy1PfKWg1VVAsQR2eXiD8BNURDFTVkE5N1lFUDhBTVNCMFpNRk1DMDVCSCQlQCNjPTEu',
        kind: 'forms',
      },
    ],
  },
  {
    id: 'notice-spss-xtn-tet',
    title: 'Khảo sát IBM SPSS V31, Hội Trại Zootopia 2026, Xuân Tình Nguyện & Hỗ trợ Tết',
    category: 'Hoạt động Trường',
    dateLabel: 'Lưu trữ · 12/2025 – 01/2026',
    audience: 'Sinh viên ĐHYD TP.HCM & Trường Dược',
    summary:
      'Tổng hợp các hoạt động và khảo sát chính thức: Kế hoạch 5478/KH-ĐHYD khảo sát bản quyền IBM SPSS V31, tuyển BTC Hội trại Trường Dược 2026, Xuân Tình Nguyện 2026 và hỗ trợ Tết Bính Ngọ.',
    details: [
      'Khảo sát IBM SPSS Statistics V31 (Premium) theo KH số 5478/KH-ĐHYD (24/12/2025) làm cơ sở mua sắm phần mềm bản quyền phục vụ đào tạo & nghiên cứu (01–22/01/2026).',
      'Tuyển BTC Hội Trại Trường Dược 2026 ("Zootopia"): Phe Judy (Ban Lễ, Ban Hội, Ban Hậu cần, Ban Tài chính) & Phe Nick (Ban Truyền thông, Ban Trại-Ẩm thực, Ban Cheerleading, Ban Tiền).',
      'Chiến dịch Xuân Tình Nguyện 2026: 10 đội hình (Xuân Gắn Kết – Trường Dược, Xuân Yêu Thương, Trái tim Y Dược, Xuân Ấm Bên Em, Xuân Xanh, Xuân Hội Nhập, Tết Việt, Nụ Xuân, Văn Phòng, Truyền Thông).',
      'Hỗ trợ khó khăn Tết Nguyên Đán Bính Ngọ 2026 (TB 06/TB-CTSV): Tham khảo Quy định 3767 (chú ý Điều 4) và nộp hồ sơ về Phòng KH-ĐT-ĐN.',
    ],
    links: [
      {
        label: 'Kế hoạch 5478_KH-DHYD khảo sát SPSS Premium (PDF)',
        url: 'https://drive.google.com/file/d/1wnoVdbIu2260jlxu-9MQPjECOvKFlY35/view?usp=sharing',
        kind: 'drive',
      },
      {
        label: 'Link khảo sát IBM SPSS V31 (Forms)',
        url: 'https://forms.office.com/r/TrUpLHuxUy',
        kind: 'forms',
      },
      {
        label: 'Đơn đăng ký BTC Hội Trại Trường Dược 2026',
        url: 'https://forms.gle/eeb2b38zB87JBXe57',
        kind: 'forms',
      },
      {
        label: 'Đăng ký Chiến dịch Xuân Tình Nguyện 2026',
        url: 'https://forms.gle/DxrC1ZjwumP8xPuF8',
        kind: 'forms',
      },
      {
        label: 'Fanpage Blouse trắng Tình nguyện UMP',
        url: 'https://www.facebook.com/BTTNUMP',
        kind: 'external',
      },
    ],
  },
];

export const REGISTRATION_WINDOWS = [
  { cohort: 'D24', start: '07:00 · 07/11/2026 (Thứ 7)', end: '16:00 · 11/11/2026', note: 'Mở đợt đầu' },
  { cohort: 'D23', start: '13:00 · 07/11/2026 (Thứ 7)', end: '16:00 · 11/11/2026', note: 'Theo khung giờ' },
  { cohort: 'HD24; HD25', start: '14:00 · 08/11/2026 (Chủ nhật)', end: '16:00 · 11/11/2026', note: 'Hệ liên kết' },
  { cohort: 'D22', start: '08:00 · 09/11/2026 (Thứ 2)', end: '16:00 · 11/11/2026', note: '8 TC tốt nghiệp + 6 TC tự chọn' },
  { cohort: 'D25', start: '14:00 · 09/11/2026 (Thứ 2)', end: '16:00 · 11/11/2026', note: 'Theo dõi TKB dự kiến' },
];

export const EXAM_FORMS = [
  {
    title: 'Đơn xin chấm phúc khảo điểm thi (File chính)',
    note: 'Điền đầy đủ và nộp trực tiếp tại sảnh tầng trệt tòa hành chính (cạnh vườn dược liệu, Phòng KH-ĐT-ĐN) trong vòng 7 ngày kể từ ngày công bố điểm.',
    url: 'https://docs.google.com/document/d/1AZ-NWmXrbJ5v7Eq0LAYXXaPfus8hKfnh/edit?usp=sharing&ouid=111020693418178929716&rtpof=true&sd=true',
  },
  {
    title: '1. Quy trình Khảo thí ĐHYD TP.HCM (PDF)',
    note: 'Tài liệu hướng dẫn quy trình khảo thí chính thức.',
    url: 'https://drive.google.com/file/d/1b1ytVv_NfLhfrXG8ghaV0hf78wTYkXYl/view?usp=sharing',
  },
  {
    title: '2. Biểu mẫu Bảng điểm chấm phúc khảo (BM_2025ĐBCL_BĐCPK)',
    note: 'Biểu mẫu Phòng ĐBCLGD – ĐHYD TP.HCM.',
    url: 'https://ump.edu.vn/uploads/ckeditor/files/Ph%C3%B2ng%20%C4%90BCLGD/kh%E1%BA%A3o%20th%C3%AD/BM_2025%C4%90BCL_B%C4%90CPK_103_00_%20Bang%20diem%20cham%20phuc%20khao.docx',
  },
  {
    title: '3. Biên bản bàn giao bài thi (BM_2025_ĐBCL_BBBG)',
    note: 'Biểu mẫu bàn giao hồ sơ khảo thí.',
    url: 'https://ump.edu.vn/uploads/ckeditor/files/Ph%C3%B2ng%20%C4%90BCLGD/kh%E1%BA%A3o%20th%C3%AD/BM_2025_%C4%90BCL_BBBG_92_00_%20Bien%20ban%20ban%20giao.docx',
  },
  {
    title: '4. Biên bản coi thi & mở niêm phong (BM_2025_ĐBCL)',
    note: 'Biểu mẫu coi thi chuẩn của nhà trường.',
    url: 'https://ump.edu.vn/uploads/ckeditor/files/Ph%C3%B2ng%20%C4%90BCLGD/kh%E1%BA%A3o%20th%C3%AD/BM_2025_%C4%90BCL_BBCT_91_00_%20Bien%20ban%20coi%20thi.docx',
  },
];

export const ORIENTATION_DOCS = [
  {
    code: '838',
    title: 'Quy chế đào tạo đại học (chú ý Điều 10)',
    url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/EYiOPKR-oXtJgyntHapUm-kBXwdcedSDf3HCRa0df_ESmQ?e=nyOdb8',
  },
  {
    code: '1691',
    title: 'Quy chế công tác sinh viên ĐHYD TP.HCM (chú ý Chương III; Phụ lục)',
    url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/EfTwlvGZV_1Ho7lJub-GSYIBo1xXJeWMMcX6GjNp_xmo-w?e=7m63Ds',
  },
  {
    code: '1497',
    title: 'Quy định chính sách học bổng cho SV ĐH chính quy (chú ý Chương III)',
    url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/EVoJYK1UN-BPk_zD2I8XdgkBUFN9F09cd92x8bFXP8gqaw?e=bjY1Uc',
  },
  {
    code: '5158',
    title: 'Quy chế đánh giá kết quả rèn luyện (chú ý Điều 14)',
    url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/EchII9ZOkVlIogN4gZwcYbYBEawqCMoDwMRVZeK-xfTfmQ?e=Ejes8a',
  },
  {
    code: '1706',
    title: 'Phiếu đánh giá kết quả rèn luyện (.docx)',
    url: 'https://umpedu-my.sharepoint.com/:w:/g/personal/ree_sp_ump_edu_vn/EY9GxvndiU1NiOj-MBmYvE8B5kq0zr3NDMwx4AyPRcaxDA?e=ppI6oF',
  },
  {
    code: '2971',
    title: 'Quy định xử lý vi phạm quy chế thi',
    url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/ESgJW9Cp_bhMnYgrrF7cYfEBrzXT1GTHdGqeiswuQdaGKA?e=nxqGCd',
  },
  {
    code: '792',
    title: 'Quy định về chuẩn đầu ra ngoại ngữ (792_CHUẨN ĐẦU RA NGOẠI NGỮ.pdf)',
    url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/IQABng6l44_TTKGU9eLwt1_7AfJP1WdRoURreVBIYWjyJTI?e=DKZTJx',
  },
  {
    code: '5333',
    title: 'Thông báo 5333/TB-ĐHYD nộp minh chứng Tiếng Anh xét chuẩn đầu ra',
    url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/IQBX-DPbzeorQYJcjq0TGXtMAaWh4NDH4LeNiC8hWJkX_Uk?e=u4tEhm',
  },
  {
    code: '3767',
    title: 'Quy định chế độ hỗ trợ SV gặp khó khăn đột xuất (kèm Mẫu đơn)',
    url: 'https://umpedu-my.sharepoint.com/:b:/g/personal/ree_sp_ump_edu_vn/IQDvSGCPPeR6QJRSgqoh5gG1AccK_Kk1U7EeOw-GYE2Waco?e=vTONQx',
  },
  {
    code: 'MẪU',
    title: 'Đơn xin xét hỗ trợ khó khăn đột xuất (.docx)',
    url: 'https://umpedu-my.sharepoint.com/:w:/g/personal/ree_sp_ump_edu_vn/IQAom89lC6xnQbeKPc8VSuIeAcHooysuL11gAntQC1ggGGg?e=3hWd4z',
  },
  {
    code: 'MẪU',
    title: 'Đơn xin cấp lại Thẻ Sinh viên (.docx)',
    url: 'https://umpedu-my.sharepoint.com/:w:/g/personal/ree_sp_ump_edu_vn/IQC0qX4QWp21S54vheqF5o53ATduJJ2JTxlrRn-EtCWAhWg?e=s95EQR',
  },
  {
    code: 'MẪU',
    title: 'Đơn xin nghỉ học tạm thời (.docx) & Đơn xin nhập học lại (.docx)',
    url: 'https://umpedu-my.sharepoint.com/:w:/g/personal/ree_sp_ump_edu_vn/IQClQW5v9jIbQICaRjXuMiaTAXCqf3GRljtXBQMS2ct1Bx8?e=fQrSIc',
  },
];

export const DRL_LINKS = [
  {
    label: 'Form đóng góp chương trình kiếm Điểm rèn luyện (Google Form)',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSf-qddVLQMVORVSJIRNFNBfvkmO9zZvfX9CsSEQVDvuZ2hyxg/viewform',
  },
  {
    label: 'Bảng tổng hợp thông tin Điểm rèn luyện (Responses)',
    url: 'https://docs.google.com/spreadsheets/d/1-gQX0JiWhtUt040td0jJYmlgOxU2i9KfKUqLcN8c1f0/edit?usp=sharing',
  },
  {
    label: 'Bảng hướng dẫn chấm Điểm rèn luyện D25B',
    url: 'https://docs.google.com/spreadsheets/d/1CW4JKfym2rzAHF-Go2sSw0LYvpMvLES1mPqnXTQMU3M/htmlembed',
  },
  {
    label: 'Bảng hướng dẫn chấm ĐRL 2025–2026 & HK2 (Google Sheets)',
    url: 'https://docs.google.com/spreadsheets/d/158atOdxiTKE1HZ3jUSk_tBHqG2gxePDQjHGFUga4KJo/edit?usp=drive_link',
  },
  {
    label: '[2025–2026 HK2] Tổng hợp danh sách SV tham gia hoạt động cấp Trường Dược (.xlsx)',
    url: 'https://umpedu-my.sharepoint.com/:x:/g/personal/doanhoikhoaduoc_ump_edu_vn/IQByUZhLtz-1R7ENgzNKB5IXARn--6csQkrIxeky4zYA1UU?e=nnabgm',
  },
  {
    label: 'Danh sách chương trình dự kiến kiếm ĐRL 2026',
    url: 'https://docs.google.com/spreadsheets/d/1x82gJGgPux0gScbHioKb2nGnFnj9l3e_EA5kIsYh_2A/edit?usp=drivesdk',
  },
  {
    label: 'Form chấm mẫu Điểm rèn luyện Trường Dược',
    url: 'https://forms.office.com/r/nhh9ZsR6Fd',
  },
  {
    label: 'Mẫu file minh chứng ĐRL Trường Dược (.docx)',
    url: 'https://umpedu-my.sharepoint.com/:w:/g/personal/doanhoikhoaduoc_ump_edu_vn/ERP9PqaAvkxKt_rLG1TMI3UBuVQ2XK1v56OMiUZka7lGbA?e=8WwJee',
  },
  {
    label: 'Danh sách hoạt động HK1 2025–2026 (trước 30/11/2025)',
    url: 'https://docs.google.com/spreadsheets/d/1BqCN_aUVkrD8oz34isSk-gV2ZDeJ0Kw1fztUneR2fr8/edit?usp=sharing',
  },
];

export const DRL_GUIDES = [
  {
    id: 'drl-2026-rules',
    title: 'Quy định & Hướng dẫn Điểm rèn luyện 2026 (BCH Đoàn Hội Trường Dược)',
    badge: 'Quy định 2026',
    items: [
      'Hình thức chấm: Thực hiện qua Form chuẩn của Đoàn Hội Trường Dược gửi về các lớp khi có thông báo chính thức từ Phòng KH-ĐT-ĐN.',
      'Minigame: Các chương trình Minigame có hình thức sao chép và dán (copy-paste) câu trả lời sẽ KHÔNG được ghi nhận vào kết quả rèn luyện.',
      'Quy định đặt tên file minh chứng PDF chuẩn: Tổ - MSSV - Họ và tên - Lớp - Ngày tháng năm sinh (Tổ lấy 2 chữ số, ví dụ: 01 - 511186433 - Nguyễn Văn A - D18 - 07052000). Đặt sai cú pháp bị TRỪ 2 ĐIỂM vào điểm tổng.',
      'Chú ý HK2 2025–2026: Điểm học tập và điểm thưởng được BCH Trường Dược cộng sau khi có bảng điểm chính thức từ Đào tạo.',
    ],
  },
];

export const LIBRARY_RESOURCES = [
  {
    title: 'Medical Statistics Made Easy (4th Edition, 2020)',
    author: 'Michael Harris & Gordon Taylor · Scion Publishing (2021)',
    usage: 'Ứng dụng trong môn Mô hình Xác suất thống kê Y học',
    url: 'https://drive.google.com/open?id=1UjaLaQTFun210uORnhxAUf41lRcixFUF',
    downloadUrl: 'https://drive.google.com/uc?id=1UjaLaQTFun210uORnhxAUf41lRcixFUF&export=download',
  },
  {
    title: 'English in Pharmacy',
    author: 'Luisa Benigni · Tài liệu chuyên ngành YDS',
    usage: 'Dùng cho Tiếng Anh Chuyên Ngành 1 & 2',
    url: 'https://drive.google.com/open?id=1KE1UYUcMssLzTJ7YEMKB0WfK85OHCV94',
  },
  {
    title: 'English for Pharmacy Writing and Oral Communication',
    author: 'EBook học thuật chuyên ngành Dược',
    usage: 'Kỹ năng viết & trình bày Dược học bằng tiếng Anh',
    url: 'https://drive.google.com/open?id=1cURYOMgNaHoRNVFgReIC3SYo1XUabZg1',
  },
  {
    title: 'Boron & Boulpaep Medical Physiology',
    author: 'Sách tham khảo đề xuất bởi Thầy Nguyễn Thanh Minh',
    usage: 'Sinh lý học ở cấp độ phân tử & tế bào',
    url: 'https://sites.google.com/view/the-d25b-times/th%C3%B4ng-tin/g%C3%B3c-chia-s%E1%BA%BB-t%C3%A2m-s%E1%BB%B1',
  },
];

export const EXTERNAL_STUDY_TOOLS = [
  {
    name: 'LabXChange (Harvard University)',
    tag: 'Mô phỏng Lý · Hóa · Sinh',
    description:
      'Nền tảng mô phỏng thí nghiệm trực tuyến miễn phí từ Đại học Harvard, cực kỳ hữu ích để hình dung thao tác trước khi vào phòng lab.',
    url: 'https://www.labxchange.org/',
  },
  {
    name: 'Alila Medical Media',
    tag: 'Anatomy · Physiology · Pharmacology',
    description:
      'Kênh video hoạt họa y sinh được AstraZeneca, Mayo Clinic, Oxford & Johns Hopkins tin dùng. Nên xem phần Anatomy & Pharmacology.',
    url: 'https://www.youtube.com/@alilamedicalmedia',
  },
  {
    name: 'BioDigital Human 3D',
    tag: 'Mô phỏng Giải phẫu 3D',
    description:
      'Bộ mô phỏng giải phẫu cơ thể người 3D trực quan để ôn tập Giải phẫu – Sinh lý mọi lúc.',
    url: 'https://www.biodigital.com/',
  },
  {
    name: 'Long Term Potentiation & Memory Formation',
    tag: 'Quy tắc "Use it or lose it"',
    description:
      'Video kinh điển do thầy Nguyễn Thanh Minh gợi ý về cơ chế hình thành trí nhớ dài hạn: tín hiệu mạnh hoặc lặp lại đều đặn giúp củng cố kết nối thần kinh.',
    url: 'https://www.youtube.com/watch?v=4Hm08ksPtMo&list=PLJIs8ZcKXHUwUdwmH-jqkbp5fNNoP4MBb&index=15',
  },
];

export const SEARCH_INDEX: SearchIndexItem[] = [
  ...COURSES.map((c) => ({
    id: `course-${c.id}`,
    title: `${c.name} (${c.shortCode})`,
    category: 'Học phần' as const,
    subtitle: `${c.semester} · ${c.category}`,
    keywords: `${c.name} ${c.shortCode} ${c.semester} ${c.summary} ${c.chapters?.join(' ') ?? ''} ${c.highlights.join(' ')}`,
    target: { section: 'study' as NavSection, courseId: c.id },
  })),
  {
    id: 'proc-phuc-khao',
    title: 'Đơn & Quy chế phúc khảo điểm thi (7 ngày)',
    category: 'Thủ tục' as const,
    subtitle: 'Nộp tại sảnh tầng trệt tòa hành chính (cạnh vườn dược liệu, Phòng KH-ĐT-ĐN)',
    keywords: 'phúc khảo điểm thi khảo thí đơn xin phòng kh-đt-đn 7 ngày biểu mẫu',
    target: { section: 'handbook', handbookTab: 'exam' },
  },
  {
    id: 'proc-bhyt',
    title: 'Đăng ký & Chuyển khoản Bảo hiểm Y tế 9 tháng (473.850đ)',
    category: 'Thủ tục' as const,
    subtitle: 'Form Office + CK Vietcombank/Vietinbank + VssID (Hạn 16h00 20/03/2026)',
    keywords: 'bhyt bảo hiểm y tế 473850 473.850 vietcombank vietinbank vssid chuyển khoản',
    target: { section: 'handbook', handbookTab: 'bhyt' },
  },
  {
    id: 'proc-gui-xe',
    title: 'Gửi xe miễn phí, máy bơm lốp & bãi đỗ dịp lễ UMPSP',
    category: 'Thủ tục' as const,
    subtitle: '41-43 Đinh Tiên Hoàng · Dắt bộ 5m qua cổng · Diamond Plaza, KHXHNV, Hoa Lư, Thảo Cầm Viên',
    keywords: 'gửi xe máy bơm lốp miễn phí thẻ sinh viên diamond plaza hoa lư thảo cầm viên khxhnv',
    target: { section: 'handbook', handbookTab: 'campus' },
  },
  {
    id: 'proc-blouse',
    title: 'Quy định áo Blouse, giày kín mũi & nails phòng thí nghiệm',
    category: 'Thủ tục' as const,
    subtitle: 'Cấm mặc Blouse ra đường · Chuẩn bị 2 áo · Cắt ngắn nails khi thực tập Hóa',
    keywords: 'áo blouse văn hóa trang phục phòng thí nghiệm giày dép nails nhuộm tóc',
    target: { section: 'handbook', handbookTab: 'campus' },
  },
  {
    id: 'proc-drl',
    title: 'Săn Điểm rèn luyện & Xét chọn Sinh viên 5 Tốt',
    category: 'Thủ tục' as const,
    subtitle: 'Form đóng góp, bảng hướng dẫn chấm ĐRL, quy chế 5158 & phiếu 1706',
    keywords: 'đrl điểm rèn luyện sinh viên 5 tốt minh chứng 5158 1706',
    target: { section: 'handbook', handbookTab: 'drl' },
  },
  {
    id: 'proc-hpt1-name',
    title: 'Công cụ tạo tên file PDF báo cáo Thực hành Hóa Phân Tích 1',
    category: 'Thủ tục' as const,
    subtitle: 'Chuẩn THHPT1_D25_Nhóm_Mã bài_STT_Họ Tên_MSSV · Hạn nộp OneDrive 24h',
    keywords: 'hóa phân tích thhpt1 đặt tên file pdf onedrive báo cáo thực hành 24h',
    target: { section: 'study', courseId: 'hpt1' },
  },
  ...DEADLINES.map((d) => ({
    id: `dl-${d.id}`,
    title: d.title,
    category: 'Deadline' as const,
    subtitle: `${d.dueLabel} · ${d.audience}`,
    keywords: `${d.title} ${d.dueLabel} ${d.summary} ${d.category}`,
    target: { section: 'deadline' as NavSection },
  })),
  ...LIBRARY_RESOURCES.map((b, idx) => ({
    id: `lib-${idx}`,
    title: b.title,
    category: 'Tài liệu' as const,
    subtitle: `${b.author} · ${b.usage}`,
    keywords: `${b.title} ${b.author} ${b.usage} sách ebook thư viện`,
    target: { section: 'library' as NavSection },
  })),
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getActiveDeadlines(now: Date = new Date()): DeadlineTask[] {
  const nowMs = now.getTime();
  return DEADLINES.filter((d) => new Date(d.expiresAt).getTime() >= nowMs);
}

export function getActiveAppUpdates(now: Date = new Date()): (AppUpdateItem & { expiresAt: string; daysRemaining: number })[] {
  const nowMs = now.getTime();
  return APP_UPDATES.map((item) => {
    const startMs = new Date(item.updatedAt).getTime();
    const expiresMs = startMs + item.ttlDays * MS_PER_DAY;
    const daysRemaining = Math.max(0, Math.ceil((expiresMs - nowMs) / MS_PER_DAY));
    return {
      ...item,
      expiresAt: new Date(expiresMs).toISOString(),
      daysRemaining,
    };
  }).filter((item) => {
    const expiresMs = new Date(item.expiresAt).getTime();
    return expiresMs >= nowMs;
  });
}

export function getCalendarDaysRemaining(targetIso: string, now: Date = new Date()): number {
  const target = new Date(targetIso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((startOfTarget - startOfToday) / MS_PER_DAY);
}

