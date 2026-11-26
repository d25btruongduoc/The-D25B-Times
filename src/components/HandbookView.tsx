import { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import {
  CONTACTS,
  DRL_GUIDES,
  DRL_LINKS,
  EXAM_FORMS,
  HandbookTab,
  ORIENTATION_DOCS,
  SCHOOL_NOTICES,
} from '../data/d25bData';
import { HoverPreviewCard } from './HoverMiniPreview';

interface HandbookViewProps {
  initialTab?: HandbookTab;
}

const TABS: { id: HandbookTab; label: string }[] = [
  { id: 'campus', label: 'Tân sinh viên & UMPSP' },
  { id: 'exam', label: 'Khảo thí & Phúc khảo' },
  { id: 'bhyt', label: 'Bảo hiểm Y tế (BHYT)' },
  { id: 'drl', label: 'Điểm rèn luyện & SV 5 Tốt' },
  { id: 'admin', label: 'Tổ chức lớp & Văn bản' },
];

function CopyInlineButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard errors
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-500/30 hover:bg-cyan-400/20 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Đã chép' : label || 'Chép'}</span>
    </button>
  );
}

export function HandbookView({ initialTab }: HandbookViewProps) {
  const [activeTab, setActiveTab] = useState<HandbookTab>(initialTab || 'campus');
  const [mssv, setMssv] = useState('111250001');
  const [studentName, setStudentName] = useState('NGUYEN VAN A');
  const [expandedNoticeIds, setExpandedNoticeIds] = useState<string[]>(['notice-dkhp-hk2']);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const toggleNotice = (id: string) => {
    setExpandedNoticeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const transferSyntax = `BHYT ${mssv.trim() || 'MSSV'} ${(studentName.trim() || 'HO VA TEN').toUpperCase()}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium">
          Cẩm nang sinh viên Trường Dược · ĐHYD TP.HCM
        </p>
        <h1 className="mt-1.5 font-heading text-3xl sm:text-4xl font-bold text-slate-50">
          Hướng dẫn Sinh hoạt, Khảo thí &amp; Thủ tục Lớp
        </h1>
      </div>

      {/* Sub-navigation Segmented Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0E1525] border border-slate-800 rounded-lg overflow-x-auto w-fit max-w-full">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === t.id
                ? 'bg-cyan-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: UMPSP & TÂN SINH VIÊN */}
      {activeTab === 'campus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-[#0E1525] border border-slate-800 rounded-xl p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold text-slate-50">
                1. Lịch sử &amp; Kiến trúc 41–43 Đinh Tiên Hoàng
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Trường Dược – Đại học Y Dược TP.HCM tọa lạc tại{' '}
                <strong className="text-slate-100">41–43 Đinh Tiên Hoàng, phường Sài Gòn</strong> (trước đây thuộc phường Bến Nghé, quận 1). Tiền thân là Dược Khoa Đại Học Đường, tách ra từ Y Dược Đại Học Đường và dời về địa chỉ 41 Cường Để (nay là 41 Đinh Tiên Hoàng) vào tháng 4 năm 1964.
              </p>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Dãy nhà ngoài cùng sát đường Lê Duẩn hiện nay chính là một phần của di tích &ldquo;Thành Cộng Hòa – Martin des Pallières&rdquo; (dấu tích Thành Gia Định xưa), tạo nên lối kiến trúc pháo đài cổ kính, độc đáo và đầy hoài niệm.
              </p>
            </section>

            <section className="bg-[#0E1525] border border-slate-800 rounded-xl p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold text-slate-50">
                2. Gửi xe miễn phí từ 01/01/2026 &amp; Di chuyển tại Trường Dược
              </h2>
              <ul className="mt-4 space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                <li>
                  <strong className="text-cyan-300">Miễn phí 100% gửi xe từ 01/01/2026:</strong> Áp dụng cho toàn thể Sinh viên, Học viên khi xuất trình <strong className="text-slate-100">Thẻ Sinh viên / Thẻ Học viên</strong> lúc ra vào cổng. Học viên khóa chuyên đề ngắn hạn hoặc khách tập thể thao: <span className="font-mono text-slate-100">4.000đ/lượt</span>.
                </li>
                <li>
                  <strong className="text-slate-100">Giờ mở cửa nhà xe:</strong> Thứ 2 – Thứ 7: <span className="font-mono text-cyan-300">06h00 – 21h00</span> · Chủ nhật: <span className="font-mono text-cyan-300">06h00 – 17h00</span> (Nghỉ Lễ, Tết theo quy định).
                </li>
                <li>
                  <strong className="text-slate-100">Lưu ý an toàn &amp; Mất thẻ xe:</strong> Không để tài sản giá trị (laptop, ví tiền...) trong cốp xe. Nếu làm mất thẻ xe, cần chuẩn bị <span className="font-medium text-amber-300">CCCD + Giấy tờ xe + Thẻ SV</span> để làm thủ tục lấy xe và đóng phí làm lại thẻ.
                </li>
                <li>
                  <strong className="text-slate-100">Quy tắc qua cổng &amp; Bơm lốp:</strong> Xuống xe dắt bộ khoảng 5m khi qua cổng (trời mưa được chạy thẳng). Có máy bơm lốp miễn phí trước hành lang khu tự học (đối diện phòng bảo vệ — nhớ khóa van lại sau khi dùng).
                </li>
                <li>
                  <strong className="text-slate-100">Điểm đỗ dự phòng dịp lễ lớn:</strong> Khi nhà xe trường hết chỗ, có thể gửi tại{' '}
                  <span className="font-medium text-slate-100">
                    Diamond Plaza, Trường ĐH KHXH&amp;NV, Trung tâm TDTT Hoa Lư hoặc Thảo Cầm Viên
                  </span>{' '}
                  (lưu ý giờ đóng cửa khoảng 17h–19h để tránh phí qua đêm, sau đó có thể dời xe về lại trường khi vơi bớt).
                </li>
              </ul>
            </section>

            <section className="bg-[#0E1525] border border-slate-800 rounded-xl p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold text-slate-50">
                3. Văn hóa ứng xử, Áo Blouse &amp; An toàn Phòng thí nghiệm
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed">
                <div className="space-y-2.5">
                  <h3 className="font-bold text-slate-100">Áo Blouse &amp; Trang phục</h3>
                  <p>
                    Tuyệt đối <strong className="text-amber-300">nghiêm cấm mặc áo Blouse ra đường</strong>; chỉ mặc thoải mái khi di chuyển trong khuôn viên Trường.
                  </p>
                  <p>
                    Nên chuẩn bị <strong className="text-slate-100">2 áo Blouse</strong> (nhà trường sẽ tặng miễn phí 1 áo vào ngày lễ Khoác Áo Blouse).
                  </p>
                  <p>
                    Trang phục lên giảng đường tự do, lịch sự (không quá ngắn) và nên mang theo áo khoác mỏng vì máy lạnh giảng đường khá lạnh.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <h3 className="font-bold text-slate-100">Phòng thí nghiệm &amp; Văn hóa</h3>
                  <p>
                    Vào phòng thí nghiệm bắt buộc mang <strong className="text-slate-100">giày hoặc dép kín mũi chân</strong> để bảo vệ khỏi hóa chất rơi vãi.
                  </p>
                  <p>
                    Sinh viên được phép nhuộm tóc, xăm, đeo khuyên; riêng các bộ môn Hóa yêu cầu cắt ngắn móng tay và không dùng nails giả khi thực tập.
                  </p>
                  <p>
                    Kính trên nhường dưới, lễ phép với thầy cô, anh chị khóa trên, nhân viên công tác tại trường và bảo quản tư trang cá nhân cẩn thận.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-[#0E1525] border border-slate-800 rounded-xl p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold text-slate-50">
                4. Tiện ích tại Văn phòng Đoàn – Hội Trường Dược
              </h2>
              <p className="mt-2 text-xs font-mono text-cyan-400">
                Hoạt động: Thứ Hai – Thứ Sáu · 08h00 – 16h30 · Văn phòng Đoàn TN – Hội SV Trường Dược
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300 leading-relaxed list-disc pl-5">
                <li>Cho mượn áo Blouse giải cứu trong những ca thực tập quên áo bất chợt &amp; cho mượn mũ bảo hiểm (hoàn trả đúng hạn).</li>
                <li>Bơm bánh xe miễn phí &amp; Phòng họp nhóm sinh hoạt, trao đổi công việc.</li>
                <li>In ấn giá sinh viên (áp dụng từ 12/01/2026): <strong className="text-slate-100">250 đồng / 1 tờ</strong>, mỗi lần in tối đa 20 tờ.</li>
              </ul>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-5 space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Địa chỉ hành chính</span>
              </div>
              <p>{CONTACTS.academicOffice.school}</p>
              <p className="font-medium text-slate-100">{CONTACTS.academicOffice.address}</p>
              <a
                href={CONTACTS.academicOffice.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:underline"
              >
                <span>pharm.ump.edu.vn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: KHẢO THÍ & PHÚC KHẢO */}
      {activeTab === 'exam' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#0E1525] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                Áp dụng cho tất cả các môn thi tại Trường Dược
              </p>
              <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-slate-50">
                Quy chế &amp; Cách nộp Đơn xin Phúc khảo điểm thi
              </h2>
            </div>

            <div className="p-4 bg-[#0B1120] border border-slate-800 rounded-lg space-y-2 text-sm text-slate-300">
              <p>
                <strong className="text-slate-100">Thời hạn áp dụng:</strong> Trong vòng{' '}
                <span className="font-mono font-semibold text-amber-300">07 ngày</span> kể từ ngày công bố điểm.
              </p>
              <p>
                <strong className="text-slate-100">Quy trình từ năm học 2026 trở đi:</strong> Tất cả hồ sơ phúc khảo đều thực hiện trực tiếp thông qua Phòng KH-ĐT-ĐN (không cần qua lớp trưởng).
              </p>
              <p>
                <strong className="text-slate-100">Địa điểm nộp đơn:</strong> Văn phòng Phòng KH-ĐT-ĐN tại{' '}
                <span className="font-medium text-cyan-300">
                  sảnh tầng trệt tòa hành chính, nằm một bên Vườn Dược Liệu
                </span>{' '}
                (đi vào sẽ thấy đối diện cửa chính).
              </p>
            </div>

            <div className="pt-2">
              <a
                href={EXAM_FORMS[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span>Tải Đơn xin chấm phúc khảo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0E1525] border border-slate-800 rounded-xl p-6">
            <h3 className="font-heading text-xl font-bold text-slate-50">
              Biểu mẫu Quy trình Khảo thí ĐHYD TP.HCM
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Bộ biểu mẫu chính thức đính kèm từ Phòng ĐBCLGD &amp; Khảo thí.
            </p>
            <div className="mt-4 divide-y divide-slate-800">
              {EXAM_FORMS.slice(1).map((form) => (
                <a
                  key={form.title}
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 flex items-start justify-between gap-3 group"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-300">
                      {form.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{form.note}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BẢO HIỂM Y TẾ */}
      {activeTab === 'bhyt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#0E1525] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                Thông báo từ CVHT (Thầy Nguyễn Thanh Minh) · Hạn 16:00 ngày 20/03/2026
              </p>
              <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-slate-50">
                Đăng ký mua BHYT đợt 9 tháng (01/04 – 31/12/2026)
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Dành cho các bạn chưa đăng ký mua BHYT các đợt trước tại trường hoặc thẻ BHYT sắp hết hạn. Bắt buộc hoàn thành đủ cả 2 bước dưới đây.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-slate-800 bg-[#0B1120] rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Bước 1 · Điền Form đăng ký trực tuyến
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Điền đầy đủ thông tin cá nhân trên biểu mẫu Microsoft Forms của nhà trường.
                </p>
                <a
                  href="https://forms.office.com/r/KMcXuG6ytD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md"
                >
                  <span>Mở Form đăng ký BHYT</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-4 border border-slate-800 bg-[#0B1120] rounded-lg space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Bước 2 · Chuyển khoản đóng tiền (473.850 VNĐ)
                </p>
                <p className="text-sm text-slate-300">
                  Chủ tài khoản: <strong className="text-slate-100">Đại học Y Dược Thành phố Hồ Chí Minh</strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#070B14] border border-slate-800 rounded-md flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-100">Vietcombank · CN Sài Thành</p>
                      <p className="font-mono text-sm text-cyan-300 mt-0.5">0511000099999</p>
                    </div>
                    <CopyInlineButton text="0511000099999" />
                  </div>
                  <div className="p-3 bg-[#070B14] border border-slate-800 rounded-md flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-100">Vietinbank · Chi nhánh 5</p>
                      <p className="font-mono text-sm text-cyan-300 mt-0.5">112000093351</p>
                    </div>
                    <CopyInlineButton text="112000093351" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
              <p>
                <strong className="text-slate-200">Sử dụng thẻ:</strong> Cơ quan BHXH không cấp thẻ giấy; sinh viên dùng ảnh thẻ BHYT trên ứng dụng <span className="font-semibold text-slate-200">VssID</span> khi đi khám chữa bệnh.
              </p>
              <p>
                <strong className="text-slate-200">Hỗ trợ lỗi:</strong> {CONTACTS.studentAffairs.name} · ĐT{' '}
                <span className="font-mono text-slate-200">{CONTACTS.studentAffairs.phone}</span> · {CONTACTS.studentAffairs.email} ({CONTACTS.studentAffairs.location}).
              </p>
              <a
                href="https://drive.google.com/file/d/1-IbVzeG8VsePvVnKFooDHuR6OU9IpaOf/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-cyan-400 hover:underline"
              >
                <span>Xem công văn 521-THONG BAO.DANG KY MUA BHYT NH 25-26</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive BHYT Syntax Generator */}
          <aside className="lg:col-span-5 bg-[#111A2E] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-heading text-xl font-bold text-slate-50">
                Tạo nhanh cú pháp chuyển khoản BHYT
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Điền MSSV và Họ tên không dấu để tạo chính xác nội dung chuyển khoản theo quy định của nhà trường.
            </p>

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Mã số sinh viên (MSSV)</span>
                <input
                  type="text"
                  value={mssv}
                  onChange={(e) => setMssv(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm font-mono bg-[#070B14] border border-slate-700 text-slate-100 rounded-md focus:outline-none focus:border-cyan-400"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Họ và tên (không dấu)</span>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-[#070B14] border border-slate-700 text-slate-100 rounded-md focus:outline-none focus:border-cyan-400"
                />
              </label>
            </div>

            <div className="p-3.5 bg-[#070B14] border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">Nội dung chuyển khoản:</span>
                <CopyInlineButton text={transferSyntax} label="Chép nội dung" />
              </div>
              <p className="font-mono text-sm font-semibold text-cyan-300 break-all">
                {transferSyntax}
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Số tiền: <strong className="font-mono text-slate-100">473850</strong></span>
                <CopyInlineButton text="473850" label="Chép số tiền" />
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 4: ĐIỂM RÈN LUYỆN & SINH VIÊN 5 TỐT */}
      {activeTab === 'drl' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#0E1525] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                Săn điểm rèn luyện · D25B
              </p>
              <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-slate-50">
                Bảng hướng dẫn, Form đóng góp &amp; Danh sách hoạt động ĐRL
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Nếu bạn có thông tin về các chương trình, hội thảo, hoạt động tình nguyện cộng điểm rèn luyện, hãy điền vào Form để chia sẻ chung cho cả lớp D25B cùng tham gia.
              </p>
            </div>

            <div className="divide-y divide-slate-800 border-t border-slate-800">
              {DRL_LINKS.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 flex items-center justify-between gap-4 group"
                >
                  <span className="text-sm font-medium text-slate-200 group-hover:text-cyan-300">
                    {item.label}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </a>
              ))}
            </div>

            {DRL_GUIDES.map((guide) => (
              <div
                key={guide.id}
                className="p-4 bg-[#0B1120] border border-slate-800 rounded-lg space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-100">{guide.title}</h3>
                  <span className="text-[11px] font-mono text-cyan-400 shrink-0">
                    {guide.badge}
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed list-disc pl-5">
                  {guide.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 bg-[#0E1525] border border-slate-800 rounded-xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Tuổi trẻ Trường Dược · Năm học 2025–2026
            </p>
            <h3 className="font-heading text-xl font-bold text-slate-50">
              Xét chọn danh hiệu &ldquo;Sinh viên 5 Tốt&rdquo; Trường Dược
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              5 tiêu chí: <strong className="text-slate-100">Đạo đức tốt – Học tập tốt – Thể lực tốt – Tình nguyện tốt – Hội nhập tốt</strong>.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <strong className="text-slate-100">Thời gian nộp:</strong> 08:00 – 17:00 từ{' '}
                <span className="font-mono text-cyan-300">18/09/2026 – 28/09/2026</span> (trừ T7 &amp; CN).
              </li>
              <li>
                <strong className="text-slate-100">Địa điểm:</strong> Văn phòng Đoàn – Hội Trường Dược (41–43 Đinh Tiên Hoàng).
              </li>
              <li>
                <strong className="text-slate-100">Lưu ý:</strong> Việc đề xuất biểu mẫu và nhận bảng điểm có thể mất 4–6 ngày nên cần chuẩn bị sớm; giấy xác nhận sau duyệt được đăng lên Drive chậm nhất sau 03 ngày.
              </li>
            </ul>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://docs.google.com/document/d/124E602jfVBZIPRaMKQLOqfpLFiAy5DbLs877umhmWE4/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-medium bg-[#0B1120] hover:bg-[#131C31] border border-slate-800 hover:border-cyan-500/40 rounded-md text-slate-200"
              >
                <span>Bộ tiêu chí xét chọn Sinh viên 5 Tốt</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </a>
              <a
                href="https://docs.google.com/document/d/18T4O5dlNvtEDxJbXoi8by1mVyTobIQU2/edit?usp=sharing&ouid=105633943479691261981&rtpof=true&sd=true"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-medium bg-[#0B1120] hover:bg-[#131C31] border border-slate-800 hover:border-cyan-500/40 rounded-md text-slate-200"
              >
                <span>Mẫu &amp; Tra cứu giấy xác nhận hoạt động cấp Trường</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TỔ CHỨC LỚP & VĂN BẢN ĐẦU KHÓA */}
      {activeTab === 'admin' && (
        <div className="space-y-8">
          {/* Migrated & Archived School/Class Notices (Click-to-Expand Full Content) */}
          <section className="bg-[#0E1525] border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                Thông báo Trường – Lớp &amp; Lưu trữ Học vụ (Nguồn đầy đủ từ Site)
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-slate-50">
                Tổng hợp Thông báo, Quy định ĐKHP &amp; Hoạt động Trường Dược
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
                Các mốc deadline quá hạn và thông báo sinh hoạt trường – lớp được phân bổ và lưu trữ đầy đủ tại đây. Bấm vào từng mục để mở toàn bộ nội dung chi tiết.
              </p>
            </div>

            <div className="divide-y divide-slate-800">
              {SCHOOL_NOTICES.map((notice) => {
                const isOpen = expandedNoticeIds.includes(notice.id);
                return (
                  <div key={notice.id} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleNotice(notice.id)}
                      className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-[#131C31]/70 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-cyan-400">
                            {notice.category}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="font-mono text-amber-300">
                            {notice.dateLabel}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400">{notice.audience}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-50">
                          {notice.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {notice.summary}
                        </p>
                      </div>

                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-cyan-400 shrink-0">
                        <span>{isOpen ? 'Thu gọn' : 'Mở đầy đủ'}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-3 bg-[#0B1120]/80 border-t border-slate-800/80 space-y-4">
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed list-disc pl-5">
                          {notice.details.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>

                        {notice.links && notice.links.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-2.5">
                            {notice.links.map((link) => (
                              <HoverPreviewCard key={link.url} url={link.url} label={link.label}>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-500/30 hover:bg-cyan-400/20 rounded-md"
                                >
                                  <span>{link.label}</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </HoverPreviewCard>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-[#0E1525] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Sinh hoạt đầu khóa Tân sinh viên 2025
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-slate-50">
                  Hệ thống Quy chế, Văn bản &amp; Biểu mẫu thông dụng
                </h2>
              </div>

              <div className="divide-y divide-slate-800">
                {ORIENTATION_DOCS.map((doc, idx) => (
                  <HoverPreviewCard key={`${doc.code}-${idx}`} url={doc.url} label={doc.title}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3.5 flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-baseline gap-4 min-w-0">
                        <span className="font-mono tabular-nums text-xs font-semibold text-cyan-400 w-14 shrink-0">
                          {doc.code === 'MẪU' ? 'MẪU ĐƠN' : `Số ${doc.code}`}
                        </span>
                        <p className="text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {doc.title}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                    </a>
                  </HoverPreviewCard>
                ))}
              </div>

              <div className="pt-3 flex flex-wrap gap-3">
                <a
                  href="https://sv.ump.edu.vn/sinh-vien/tin-tuc/huong-dan-nop-cac-khoan-phi-tai-dai-hoc-y-duoc-thanh-pho-ho-chi-minh.html?pIDDanhMuc=13"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#0B1120] hover:bg-[#131C31] border border-slate-800 hover:border-cyan-500/40 rounded-md text-slate-200"
                >
                  <span>Hướng dẫn đóng học phí (OneUni &amp; sv.ump.edu.vn)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </a>
                <a
                  href="https://sv.ump.edu.vn/sinh-vien/tin-tuc/thong-tin-phong-tham-van.html?pIDDanhMuc=11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#0B1120] hover:bg-[#131C31] border border-slate-800 hover:border-cyan-500/40 rounded-md text-slate-200"
                >
                  <span>Thông tin Phòng Tham vấn Sinh viên</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="font-heading text-xl font-bold text-slate-50">
                  Đầu mối liên hệ nhanh
                </h3>
                <dl className="divide-y divide-slate-800 text-sm">
                  <div className="py-3">
                    <dt className="text-xs text-slate-400">Lớp trưởng Lớp D25B</dt>
                    <dd className="mt-0.5 font-medium text-slate-100">
                      {CONTACTS.classPresident.name} · Zalo{' '}
                      <span className="font-mono text-cyan-300">{CONTACTS.classPresident.zalo}</span>
                    </dd>
                    <dd className="text-xs font-mono text-slate-400">
                      {CONTACTS.classPresident.umpEmail}
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-xs text-slate-400">{CONTACTS.academicOffice.name}</dt>
                    <dd className="mt-0.5 text-slate-200">{CONTACTS.academicOffice.address}</dd>
                    <dd className="text-xs font-mono text-slate-400">
                      {CONTACTS.academicOffice.email}
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-xs text-slate-400">{CONTACTS.studentAffairs.name}</dt>
                    <dd className="mt-0.5 text-slate-200">{CONTACTS.studentAffairs.location}</dd>
                    <dd className="text-xs font-mono text-slate-400">
                      {CONTACTS.studentAffairs.phone} · {CONTACTS.studentAffairs.email}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-[#111A2E] border border-slate-800 rounded-xl p-6 space-y-2">
                <h3 className="font-heading text-lg font-bold text-slate-50">
                  Thu nộp quỹ lớp &amp; Thông báo học bổng
                </h3>
                <p className="text-sm text-slate-300">
                  Hai mục sao kê quỹ tài chính chi tiêu lớp và tổng hợp học bổng đang được Ban cán sự tiếp tục hoàn thiện dữ liệu minh bạch. Mọi đóng góp xin gửi về Zalo lớp trưởng hoặc{' '}
                  <a
                    href={`mailto:${CONTACTS.libraryEmail}`}
                    className="font-mono text-xs text-cyan-400 hover:underline"
                  >
                    {CONTACTS.libraryEmail}
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
