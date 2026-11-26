import { ArrowRight, BookOpen, Calendar, Compass, ExternalLink, FileText } from 'lucide-react';
import {
  CONTACTS,
  getActiveAppUpdates,
  getActiveDeadlines,
  getCalendarDaysRemaining,
  HandbookTab,
  IMAGES,
  NavSection,
} from '../data/d25bData';
import { EditorialImage } from './EditorialImage';

interface HomeViewProps {
  onNavigate: (section: NavSection, options?: { courseId?: string; handbookTab?: HandbookTab }) => void;
  completedDeadlines: string[];
}

export function HomeView({
  onNavigate,
  completedDeadlines,
}: HomeViewProps) {
  const now = new Date();
  const activeDeadlines = getActiveDeadlines(now);
  const activeUpdates = getActiveAppUpdates(now);
  const activeDoneCount = activeDeadlines.filter((d) =>
    completedDeadlines.includes(d.id)
  ).length;

  return (
    <div className="space-y-12 pb-16">
      {/* Futuristic Tech Masthead */}
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-[#0E172A] to-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium">
                Trường Dược - Đại học Y Dược TP.Hồ Chí Minh - D25B
              </p>
              <h1 className="mt-2 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-50">
                The D25B Times
              </h1>
            </div>
            <div className="text-xs sm:text-sm text-slate-400 md:text-right space-y-1">
              <p className="font-medium text-slate-200">41–43 Đinh Tiên Hoàng, P. Sài Gòn, TP.HCM</p>
              <p className="font-mono tabular-nums text-xs leading-relaxed text-slate-400">
                <span className="block">Cổng thông tin học tập &amp; Sinh hoạt lớp</span>
                <span className="block text-cyan-300">Năm học 2025-2030</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tier 1: Lead Story Split (items-stretch) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 bg-[#0E1525] border border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-cyan-400 font-semibold">Thư ngỏ Ban cán sự</span>
                <span aria-hidden="true">·</span>
                <span>Lớp trưởng Nguyễn Minh Huy</span>
              </div>

              <h2 className="mt-3 font-heading text-3xl sm:text-4xl font-bold text-slate-50 leading-tight">
                Gom toàn bộ học liệu, biểu mẫu và lịch trình D25B về một nơi dễ tra cứu
              </h2>

              <div className="mt-5 space-y-4 text-[15px] sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                <p className="drop-cap">
                  Hello anh em, lại là Minh Huy đây! Sau thời gian thử nghiệm đăng thông tin lên Facebook để mọi người đỡ bị trôi file, tụi mình nhận ra việc tìm lại link phúc khảo, đăng ký nghỉ học hay đề cương môn vẫn còn rối rắm vì bài viết trôi quá nhanh.
                </p>
                <p>
                  The D25B Times ra đời để giải quyết triệt để chuyện đó: tổ chức lại hơn 45 mục học phần, quy chế khảo thí, lịch đăng ký tín chỉ và hướng dẫn sinh hoạt tại 41–43 Đinh Tiên Hoàng sao cho bạn chỉ cần 1–2 lần bấm là tìm thấy ngay thứ mình cần.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('study')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Khám phá Kho học phần</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('deadline')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-100 bg-[#131C31] border border-slate-700 hover:border-cyan-400/50 hover:text-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Xem Deadline &amp; ĐKHP</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <EditorialImage
              src={IMAGES.campus}
              alt="Khuôn viên Trường Dược – Đại học Y Dược TP. Hồ Chí Minh tại 41-43 Đinh Tiên Hoàng"
              figureNumber="Ảnh 01."
              caption="Khuôn viên Trường Dược – ĐHYD TP.HCM tại 41–43 Đinh Tiên Hoàng (tiền thân Dược Khoa Đại Học Đường từ tháng 4/1964)."
              className="w-full h-full"
              imgClassName="w-full h-full min-h-[320px] lg:min-h-[420px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Tier 2: Priority Deadlines & Active Notices */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium">
              Nhiệm vụ hệ thống &amp; Thông báo
            </p>
            <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-slate-50">
              Các mốc thời gian cần lưu ý
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('deadline')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>
              Mở lịch thời gian thực ({activeDoneCount}/{activeDeadlines.length} mốc · {activeUpdates.length} cập nhật mới)
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeDeadlines.slice(0, 1).map((dl) => {
            const isDone = completedDeadlines.includes(dl.id);
            const daysLeft = getCalendarDaysRemaining(dl.expiresAt, now);
            return (
              <article
                key={dl.id}
                className="bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="font-medium text-cyan-400">{dl.category}</span>
                    <span className="font-mono tabular-nums text-amber-300">
                      {isDone ? 'Đã hoàn thành' : daysLeft <= 0 ? 'Hôm nay' : `Còn ${daysLeft} ngày`}
                    </span>
                  </div>
                  <h3 className="mt-2.5 font-heading text-lg font-bold text-slate-50 leading-snug">
                    {dl.title}
                  </h3>
                  <p className="mt-2 text-xs font-mono tabular-nums text-amber-300 font-medium">
                    Mốc: {dl.dueLabel}
                  </p>
                  <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">{dl.summary}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 truncate max-w-[60%]">{dl.audience}</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('deadline')}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </article>
            );
          })}

          {activeUpdates.slice(0, Math.max(2, 3 - activeDeadlines.slice(0, 1).length)).map((upd) => (
            <article
              key={upd.id}
              className="bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="font-medium text-emerald-300">{upd.category}</span>
                  <span className="font-mono tabular-nums text-cyan-300">
                    Mới · Còn {upd.daysRemaining}/7 ngày
                  </span>
                </div>
                <h3 className="mt-2.5 font-heading text-lg font-bold text-slate-50 leading-snug">
                  {upd.title}
                </h3>
                <p className="mt-2 text-xs font-mono tabular-nums text-slate-400">
                  Cập nhật: {new Date(upd.updatedAt).toLocaleDateString('vi-VN')}
                </p>
                <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">{upd.summary}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Tự ẩn sau 7 ngày</span>
                <button
                  type="button"
                  onClick={() =>
                    upd.target
                      ? onNavigate(upd.target.section, {
                          handbookTab: upd.target.handbookTab,
                          courseId: upd.target.courseId,
                        })
                      : onNavigate('deadline')
                  }
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Mở cập nhật →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Tier 3: Modular Tech Bento Directory & Recruitment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 70% Modular Bento Grid */}
          <div className="lg:col-span-8 space-y-5">
            <div className="pb-4 border-b border-slate-800">
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium">
                Kiến trúc chuyên mục
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-slate-50">
                4 phân khu chính của The D25B Times
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 flex flex-col justify-between transition-colors">
                <div>
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-50">
                    01. Kho Học phần &amp; Thực tập
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                    Đề cương, thư mục Drive bài giảng Năm 1–5, Giải phẫu, Hóa hữu cơ, Hóa phân tích và trình tạo tên file báo cáo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('study')}
                  className="mt-5 text-left text-sm font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap cursor-pointer"
                >
                  Vào Học tập →
                </button>
              </div>

              <div className="bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 flex flex-col justify-between transition-colors">
                <div>
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-50">
                    02. Lịch Deadline &amp; ĐKHP
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                    Khung giờ ĐKHP từng khóa (D22–D25), lịch học GDQPAN, hạn khai báo ngoại trú và checklist cá nhân.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('deadline')}
                  className="mt-5 text-left text-sm font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap cursor-pointer"
                >
                  Xem Deadline →
                </button>
              </div>

              <div className="bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 flex flex-col justify-between transition-colors">
                <div>
                  <Compass className="w-5 h-5 text-cyan-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-50">
                    03. Cẩm nang UMPSP &amp; BHYT
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                    Mẹo gửi xe 41–43 Đinh Tiên Hoàng, áo Blouse, đơn phúc khảo 7 ngày, tạo cú pháp chuyển khoản BHYT và săn ĐRL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('handbook')}
                  className="mt-5 text-left text-sm font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap cursor-pointer"
                >
                  Mở Cẩm nang →
                </button>
              </div>

              <div className="bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 flex flex-col justify-between transition-colors">
                <div>
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-50">
                    04. Thư viện &amp; Góc chia sẻ
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                    Đầu sách uy tín (Medical Statistics, English in Pharmacy) và mô phỏng LabXChange, BioDigital 3D, Alila Media.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('library')}
                  className="mt-5 text-left text-sm font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap cursor-pointer"
                >
                  Vào Thư viện →
                </button>
              </div>
            </div>
          </div>

          {/* 30% Side Margin Note: Recruitment & Contact */}
          <aside className="lg:col-span-4">
            <div className="bg-[#111A2E] border border-slate-800 rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                Góc Tuyển dụng lớp mình
              </p>
              <h3 className="mt-2 font-heading text-xl font-bold text-slate-50">
                Chung tay xây dựng The D25B Times
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                &ldquo;Về sơ bộ thì tui đã làm sườn cho site này nhưng vẫn rất cần sự hỗ trợ từ anh em trong lớp có khả năng design, tổng hợp tài liệu hoặc cập nhật thông tin học bổng, tài chính để trang web của lớp ngày càng xịn hơn!&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <p>
                  Zalo Lớp trưởng:{' '}
                  <span className="font-mono font-semibold text-slate-50">
                    {CONTACTS.classPresident.zalo}
                  </span>
                </p>
                <p>
                  Email lớp:{' '}
                  <a
                    href={`mailto:${CONTACTS.libraryEmail}`}
                    className="font-mono text-cyan-400 hover:underline"
                  >
                    {CONTACTS.libraryEmail}
                  </a>
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <a
                    href={CONTACTS.classPresident.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    <span>Facebook Minh Huy</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={CONTACTS.classPresident.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
