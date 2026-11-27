import { useState, useMemo } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  HeartHandshake,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export function DrlScoringGuideSection() {
  const [activeDomain, setActiveDomain] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Search index for quick lookup
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const allItems: {
      domain: string;
      itemCode: string;
      title: string;
      points: string;
      notes?: string;
    }[] = [
      // Lĩnh vực 1
      { domain: 'Lĩnh vực 1', itemCode: '1.1', title: 'Ý thức và thái độ trong học tập (không vắng quá quy định)', points: 'Tối đa 2.0 đ' },
      { domain: 'Lĩnh vực 1', itemCode: '1.2.1', title: 'Chương trình Học thuật - Kỹ năng cấp Lớp / Trường Dược (Online)', points: 'Tham gia: 1.0 đ · BTC: 2.0 đ' },
      { domain: 'Lĩnh vực 1', itemCode: '1.2.1', title: 'Chương trình Học thuật - Kỹ năng cấp Lớp / Trường Dược (Offline)', points: 'Tham gia: 1.0 đ · BTC: 3.0 đ' },
      { domain: 'Lĩnh vực 1', itemCode: '1.2.1', title: 'Thi học thuật nhiều vòng cấp Lớp / Trường Dược', points: 'Vòng loại: 1.0 đ · Bán kết: 2.0 đ · Chung kết: 3.0 đ · BTC: 3.0 đ' },
      { domain: 'Lĩnh vực 1', itemCode: '1.2.1', title: 'Webinar, workshop học thuật cấp Trường Dược', points: '1 buổi: 1.0 đ · Từ 2 buổi trở lên: 2.0 đ · BTC: 3.0 đ' },
      { domain: 'Lĩnh vực 1', itemCode: '1.2.2', title: 'Học thuật cấp ĐHYD, Khoa mở rộng, ngoài trường (Offline)', points: 'Tham gia: 2.0 đ · BTC: 4.0 đ' },
      { domain: 'Lĩnh vực 1', itemCode: '1.2.2', title: 'Thi học thuật nhiều vòng cấp ĐHYD / ngoài trường', points: 'Vòng loại: 2.0 đ · Bán kết: 3.0 đ · Chung kết: 4.0 đ · BTC: 4.0 đ' },
      { domain: 'Lĩnh vực 1', itemCode: '1.3', title: 'Ý thức và thái độ tham gia kỳ thi (nghiêm túc, không vi phạm)', points: 'Tối đa 2.0 đ' },
      { domain: 'Lĩnh vực 1', itemCode: '1.4', title: 'Kết quả học tập: Xuất sắc (3.60 - 4.00)', points: '10.0 đ (BCH cộng sau)' },
      { domain: 'Lĩnh vực 1', itemCode: '1.4', title: 'Kết quả học tập: Giỏi (3.20 - 3.59)', points: '9.0 đ (BCH cộng sau)' },
      { domain: 'Lĩnh vực 1', itemCode: '1.4', title: 'Kết quả học tập: Khá (2.50 - 3.19)', points: '7.0 đ (BCH cộng sau)' },
      { domain: 'Lĩnh vực 1', itemCode: '1.4', title: 'Kết quả học tập: Trung bình (2.00 - 2.49)', points: '5.0 đ (BCH cộng sau)' },
      { domain: 'Lĩnh vực 1', itemCode: '1.5', title: 'Đạt giải Khuyến khích thi học thuật, NCKH, ngoại ngữ, Olympic', points: '1.0 đ / hoạt động' },
      { domain: 'Lĩnh vực 1', itemCode: '1.5', title: 'Thành viên đề tài NCKH cấp cơ sở hoặc bài báo trong nước', points: '1.0 đ / đề tài, bài báo' },
      { domain: 'Lĩnh vực 1', itemCode: '1.5', title: 'Thành viên đề tài cấp TP, Bộ hoặc bài báo quốc tế', points: '2.0 đ / đề tài, bài báo' },
      { domain: 'Lĩnh vực 1', itemCode: '1.5', title: 'Làm Monitor cho các Bộ môn', points: '2.0 đ' },
      { domain: 'Lĩnh vực 1', itemCode: '1.5', title: 'Tăng bậc học lực so với học kỳ trước', points: '2.0 đ / 1 bậc tăng (BCH cộng sau)' },

      // Lĩnh vực 2
      { domain: 'Lĩnh vực 2', itemCode: '2.1', title: 'Đăng ký thông tin ngoại trú / nội trú đầy đủ theo quy chế', points: '5.0 đ' },
      { domain: 'Lĩnh vực 2', itemCode: '2.2', title: 'Đóng học phí đúng quy định và thời hạn', points: '5.0 đ' },
      { domain: 'Lĩnh vực 2', itemCode: '2.3', title: 'Thực hiện đánh giá điểm rèn luyện đúng thời hạn quy định', points: '3.0 đ' },
      { domain: 'Lĩnh vực 2', itemCode: '2.4', title: 'Trang phục chỉnh tề, nghiêm túc; Đeo bảng tên khi vào trường', points: '3.0 đ' },
      { domain: 'Lĩnh vực 2', itemCode: '2.5', title: 'Không nói tục, chửi thề, không hút thuốc, không rượu bia trong trường', points: '3.0 đ' },
      { domain: 'Lĩnh vực 2', itemCode: '2.6', title: 'Bảo quản tài sản chung, giữ gìn vệ sinh, bỏ rác đúng nơi', points: '3.0 đ' },
      { domain: 'Lĩnh vực 2', itemCode: '2.7', title: 'Tôn trọng, lễ phép với Thầy Cô, cán bộ viên chức', points: '3.0 đ' },

      // Lĩnh vực 3
      { domain: 'Lĩnh vực 3', itemCode: '3.1.1', title: 'Văn nghệ, thể thao, chính trị cấp Lớp / Trường Dược (Offline)', points: 'Tham gia: 2.0 đ · BTC: 5.0 đ' },
      { domain: 'Lĩnh vực 3', itemCode: '3.1.2', title: 'Văn nghệ, thể thao, chính trị cấp ĐHYD / Khoa mở rộng (Offline)', points: 'Tham gia: 3.0 đ · BTC: 6.0 đ' },
      { domain: 'Lĩnh vực 3', itemCode: '3.1.3', title: 'Hoạt động văn thể mỹ ngoài trường được duyệt', points: '1.0 đ / chương trình (Tối đa 3.0 đ)' },
      { domain: 'Lĩnh vực 3', itemCode: '3.2', title: 'Tuyên truyền phòng chống tội phạm & tệ nạn xã hội', points: 'Tham gia: 2.0 đ · BTC: 3.0 đ' },
      { domain: 'Lĩnh vực 3', itemCode: '3.3', title: 'Kết nạp Đảng trong kỳ; Đảng viên hoàn thành NV; Đoàn viên ưu tú', points: '3.0 đ' },
      { domain: 'Lĩnh vực 3', itemCode: '3.3', title: 'Đạt danh hiệu Sinh viên Khỏe cấp Khoa / Trường Dược', points: '1.0 đ (Cấp ĐHYD trở lên: 2.0 đ)' },
      { domain: 'Lĩnh vực 3', itemCode: '3.3', title: 'Đạt giải các cuộc thi chính trị, văn hóa, thể thao từ giải Ba trở lên', points: '2.0 đ / HĐ (Giải KK: 1.0 đ)' },
      { domain: 'Lĩnh vực 3', itemCode: '3.3', title: 'Tham gia hội thi Olympic Mác – Lênin', points: '2.0 đ / hoạt động' },
      { domain: 'Lĩnh vực 3', itemCode: '3.3', title: 'Huy động lực lượng cấp Trường dự Lễ meeting, chào đón, tổng kết', points: '2.0 đ / hoạt động' },

      // Lĩnh vực 4
      { domain: 'Lĩnh vực 4', itemCode: '4.1', title: 'Chấp hành chủ trương chính sách Đảng, pháp luật nơi cư trú', points: '5.0 đ' },
      { domain: 'Lĩnh vực 4', itemCode: '4.1', title: 'Không vi phạm giữ gìn an ninh trật tự, luật an toàn giao thông', points: '5.0 đ' },
      { domain: 'Lĩnh vực 4', itemCode: '4.1', title: 'Hòa đồng, giúp đỡ bạn bè cùng tiến bộ; không chia rẽ đoàn kết', points: '5.0 đ' },
      { domain: 'Lĩnh vực 4', itemCode: '4.2.1', title: 'Tình nguyện ngắn ngày (< 5 ngày) cấp Lớp / Trường Dược', points: 'Tham gia: 2.0 đ · BTC: 5.0 đ' },
      { domain: 'Lĩnh vực 4', itemCode: '4.2.1', title: 'Tình nguyện dài ngày (>= 5 ngày) cấp Lớp / Trường Dược', points: '< 5 buổi: 2.0 đ · > 5 buổi: 4.0 đ · BTC: 7.0 đ' },
      { domain: 'Lĩnh vực 4', itemCode: '4.2.2', title: 'Tình nguyện ngắn ngày (< 5 ngày) cấp ĐHYD / ngoài trường', points: 'Tham gia: 3.0 đ · BTC: 6.0 đ' },
      { domain: 'Lĩnh vực 4', itemCode: '4.2.2', title: 'Tình nguyện dài ngày (>= 5 ngày) cấp ĐHYD / ngoài trường', points: '> 5 buổi: 4.0 đ · BTC: 7.0 đ' },
      { domain: 'Lĩnh vực 4', itemCode: '4.2.3', title: 'Quyên góp thiện nguyện có danh sách công nhận', points: 'Tham gia: 2.0 đ · BTC: 3.0 đ' },
      { domain: 'Lĩnh vực 4', itemCode: '4.2.3', title: 'Hiến máu nhân đạo (Tình nguyện viên hiến máu)', points: '5.0 đ / lần (Tối đa 2 lần/kỳ = 10.0 đ) · BTC: 3.0 đ' },
      { domain: 'Lĩnh vực 4', itemCode: '4.3', title: 'Khen thưởng các cấp về ý thức cộng đồng, công tác xã hội', points: '3.0 đ / hoạt động' },

      // Lĩnh vực 5
      { domain: 'Lĩnh vực 5', itemCode: '5.1', title: 'Thành viên BCH Đoàn - Hội cấp ĐHYD, chi ủy cấp ĐHYD', points: '8.0 đ' },
      { domain: 'Lĩnh vực 5', itemCode: '5.1', title: 'Thành viên BCH Đoàn - Hội cấp Trường Dược', points: '7.0 đ' },
      { domain: 'Lĩnh vực 5', itemCode: '5.1', title: 'Cán bộ Lớp (Lớp trưởng, phó, thủ quỹ), Cán bộ Đoàn Hội lớp, BCN CLB', points: '6.0 đ' },
      { domain: 'Lĩnh vực 5', itemCode: '5.1', title: 'Tổ trưởng, tổ phó', points: '4.0 đ' },
      { domain: 'Lĩnh vực 5', itemCode: '5.1', title: 'Thành viên CLB Đội Nhóm các cấp trực thuộc ĐHYD', points: '2.0 đ' },
      { domain: 'Lĩnh vực 5', itemCode: '5.2', title: 'Tham gia họp lớp (theo danh sách CVHT công nhận)', points: '1.0 đ / buổi' },
      { domain: 'Lĩnh vực 5', itemCode: '5.2', title: 'Điền hồ sơ điện tử E-portfolio đúng thời hạn', points: '1.0 đ' },
      { domain: 'Lĩnh vực 5', itemCode: '5.2', title: 'Tham gia ĐẦY ĐỦ tất cả buổi họp lớp + điền E-portfolio đúng hạn', points: 'Trọn vẹn 6.0 đ' },
      { domain: 'Lĩnh vực 5', itemCode: '5.3', title: 'Đạt danh hiệu Sinh viên 5 Tốt cấp Trường Dược', points: '3.0 đ' },
      { domain: 'Lĩnh vực 5', itemCode: '5.3', title: 'Được tuyên dương cấp ĐHYD trở lên (SV5T, Blouse trắng làm theo lời Bác)', points: '5.0 đ' },
      { domain: 'Lĩnh vực 5', itemCode: '5.3', title: 'Được khen thưởng các cấp về thành tích đặc biệt', points: '3.0 đ / hoạt động' },
    ];

    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.itemCode.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const domains = [
    {
      id: 1,
      title: '1. Ý thức học tập',
      short: 'Học tập & NCKH',
      maxScore: '20 điểm',
      icon: BookOpen,
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    },
    {
      id: 2,
      title: '2. Nội quy & Tác phong',
      short: 'Nội quy & Đeo thẻ',
      maxScore: '25 điểm',
      icon: ShieldCheck,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 3,
      title: '3. Văn - Thể - Mỹ & Đoàn thể',
      short: 'Văn nghệ - Thể thao',
      maxScore: '20 điểm',
      icon: Sparkles,
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    },
    {
      id: 4,
      title: '4. Tình nguyện & Cộng đồng',
      short: 'Tình nguyện - Hiến máu',
      maxScore: '25 điểm',
      icon: HeartHandshake,
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    },
    {
      id: 5,
      title: '5. Cán bộ lớp & Thành tích',
      short: 'Cán bộ & SV 5 Tốt',
      maxScore: '10 điểm',
      icon: Award,
      color: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
    },
  ];

  return (
    <section className="bg-[#0B1120] border-2 border-[#39FF14] shadow-[0_0_35px_-5px_rgba(57,255,20,0.38),0_0_15px_rgba(57,255,20,0.22)] rounded-2xl p-5 sm:p-7 space-y-6">
      {/* Header of the Special Fixed Guide Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 shadow-[0_0_12px_rgba(57,255,20,0.2)]">
              <FileSpreadsheet className="w-5 h-5 text-[#39FF14]" />
            </span>
            <div>
              <span className="text-[11px] font-mono text-[#39FF14] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14] animate-pulse" />
                Căn cứ QĐ số 1714/QĐ-ĐHYD · Ban hành 14/04/2026
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-50 leading-tight">
                Bảng Hướng Dẫn Chấm Điểm Rèn Luyện Trường Dược
              </h2>
            </div>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Bảng quy đổi điểm số chính thức gồm 5 lĩnh vực đánh giá (tổng tối đa 100 điểm). Sinh viên dùng bảng này để đối chiếu hoạt động và nhập minh chứng chuẩn xác vào Microsoft Forms.
          </p>
        </div>

        {/* Action Downloads / Original File links */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/assets/aistudio/BA_NG_HU_O__NG_DA__N_CHA__M__IE__M_RE_N_LUYE__N_-_BA_NG_HU_O__NG_DA__N_update_fa2fcdb7.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-100 bg-[#131C31] hover:bg-[#1A2642] border border-slate-700 hover:border-[#39FF14]/50 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Xem PDF gốc</span>
            <Download className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href="https://docs.google.com/spreadsheets/d/158atOdxiTKE1HZ3jUSk_tBHqG2gxePDQjHGFUga4KJo/edit?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-[#39FF14] hover:bg-[#32e012] shadow-[0_0_15px_rgba(57,255,20,0.3)] rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Mở Google Sheets</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tra cứu nhanh điểm: gõ hiến máu, họp lớp, e-portfolio, ngoại trú, btc, giải ba, xuất sắc..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#070B14] border border-slate-700 hover:border-slate-600 focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Filtered Search Results Dropdown/Card */}
        {searchResults && (
          <div className="mt-2.5 p-4 rounded-xl bg-[#0E1525] border border-cyan-500/30 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Tìm thấy {searchResults.length} mục phù hợp:</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Đóng kết quả
              </button>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Không tìm thấy mục nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;. Bạn hãy thử tra cứu theo danh mục 5 lĩnh vực bên dưới.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#070B14] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-cyan-400 font-semibold mr-2">
                        [{res.domain} · {res.itemCode}]
                      </span>
                      <span className="text-slate-200">{res.title}</span>
                    </div>
                    <span className="font-semibold text-amber-300 font-mono shrink-0 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {res.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5 Domain Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {domains.map((dom) => {
          const Icon = dom.icon;
          const isActive = activeDomain === dom.id;
          return (
            <button
              key={dom.id}
              type="button"
              onClick={() => {
                setActiveDomain(dom.id);
                setSearchQuery('');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                  : 'bg-[#0E1525] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                  {dom.maxScore}
                </span>
              </div>
              <div>
                <p className={`text-xs font-bold leading-snug ${isActive ? 'text-slate-50' : 'text-slate-300'}`}>
                  {dom.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{dom.short}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
        {/* DOMAIN 1 */}
        {activeDomain === 1 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Lĩnh vực 1 · Tối đa 20 điểm
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-50">
                  Đánh giá về Ý thức tham gia học tập
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Gồm Học lực, NCKH, CLB học thuật &amp; Kỷ luật thi cử
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mục 1.1 & 1.3 */}
              <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    1.1. Ý thức trong học tập
                  </h4>
                  <span className="text-xs font-mono text-cyan-300 font-bold">Tối đa 2.0 đ</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Nghiêm túc trong quá trình học và chấp hành quy định về giờ giấc, không vắng quá số buổi quy định của môn học/học phần.
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    1.3. Ý thức tham gia kỳ thi
                  </h4>
                  <span className="text-xs font-mono text-cyan-300 font-bold">Tối đa 2.0 đ</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Nghiêm túc trong thi cử, không vi phạm quy chế thi.
                </p>
              </div>

              {/* Mục 1.4: Học lực */}
              <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    1.4. Kết quả học tập
                  </h4>
                  <span className="text-xs font-mono text-cyan-300 font-bold">Tối đa 10.0 đ</span>
                </div>
                <p className="text-[11px] text-amber-300 italic">
                  * Điểm học tập do BCH Trường Dược cộng sau khi có bảng điểm chính thức (không tự điền vào Form).
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-300">Xuất sắc (3.60–4.0):</span>
                    <span className="text-emerald-300 font-bold">10 đ</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-300">Giỏi (3.20–3.59):</span>
                    <span className="text-emerald-300 font-bold">9 đ</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-300">Khá (2.50–3.19):</span>
                    <span className="text-cyan-300 font-bold">7 đ</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-300">TB (2.00–2.49):</span>
                    <span className="text-cyan-300 font-bold">5 đ</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-300">1.80–2.00:</span>
                    <span className="text-slate-400 font-bold">3 đ</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-300">1.40–1.80:</span>
                    <span className="text-slate-400 font-bold">2 đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mục 1.2: Bảng Ma trận Hoạt động Học thuật - Kỹ năng */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070B14] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                    1.2. Hoạt động Học thuật, Kỹ năng, NCKH
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Chỉ các chương trình chuyên môn, kỹ năng hoặc học thuật mới tính mục này. Nếu đảm nhiệm từ 2 vai trò, chỉ tính vai trò cao nhất.
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-300 font-bold shrink-0">Tối đa 6.0 đ</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                      <th className="py-2.5 px-3">Hình thức hoạt động</th>
                      <th className="py-2.5 px-3 text-cyan-300">Cấp Lớp / Trường Dược</th>
                      <th className="py-2.5 px-3 text-emerald-300">Cấp ĐHYD / Ngoài trường</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Online có danh sách</td>
                      <td className="py-2.5 px-3">Tham gia: <strong className="text-cyan-300">1.0 đ</strong> · BTC: <strong className="text-cyan-300">2.0 đ</strong></td>
                      <td className="py-2.5 px-3">Tham gia: <strong className="text-emerald-300">1.0 đ</strong> · BTC: <strong className="text-emerald-300">2.0 đ</strong></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Offline có danh sách</td>
                      <td className="py-2.5 px-3">Tham gia: <strong className="text-cyan-300">1.0 đ</strong> · BTC: <strong className="text-cyan-300">3.0 đ</strong></td>
                      <td className="py-2.5 px-3">Tham gia: <strong className="text-emerald-300">2.0 đ</strong> · BTC: <strong className="text-emerald-300">4.0 đ</strong></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Cuộc thi nhiều vòng</td>
                      <td className="py-2.5 px-3">Vòng loại: <strong className="text-cyan-300">1.0 đ</strong> · Bán kết: <strong className="text-cyan-300">2.0 đ</strong> · Chung kết: <strong className="text-cyan-300">3.0 đ</strong> · BTC: <strong className="text-cyan-300">3.0 đ</strong></td>
                      <td className="py-2.5 px-3">Vòng loại: <strong className="text-emerald-300">2.0 đ</strong> · Bán kết: <strong className="text-emerald-300">3.0 đ</strong> · Chung kết: <strong className="text-emerald-300">4.0 đ</strong> · BTC: <strong className="text-emerald-300">4.0 đ</strong></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Webinar, Workshop nhiều buổi</td>
                      <td className="py-2.5 px-3">1 buổi: <strong className="text-cyan-300">1.0 đ</strong> · Từ 2 buổi: <strong className="text-cyan-300">2.0 đ</strong> · BTC: <strong className="text-cyan-300">3.0 đ</strong></td>
                      <td className="py-2.5 px-3">1 buổi: <strong className="text-emerald-300">2.0 đ</strong> · Từ 2 buổi: <strong className="text-emerald-300">3.0 đ</strong> · BTC: <strong className="text-emerald-300">4.0 đ</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mục 1.5: Điểm thưởng & NCKH */}
            <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                1.5. Điểm thưởng, NCKH &amp; Đặc thù ngành
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Đạt giải Khuyến khích trở lên thi NCKH, học thuật, Olympic: <strong className="text-cyan-300">1.0 đ/HĐ</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Đề tài NCKH cấp cơ sở nghiệm thu hoặc bài báo trong nước: <strong className="text-cyan-300">1.0 đ/đề tài</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Đề tài cấp TP, Bộ nghiệm thu hoặc bài báo quốc tế: <strong className="text-cyan-300">2.0 đ/đề tài</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Làm Monitor cho các Bộ môn: <strong className="text-cyan-300">2.0 đ</strong></span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* DOMAIN 2 */}
        {activeDomain === 2 && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Lĩnh vực 2 · Tối đa 25 điểm
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-50">
                  Ý thức chấp hành Nội quy, Quy chế &amp; Quy định trong Nhà trường
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                7 tiêu chí chuẩn mực
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Đây là các điểm cộng nền tảng quan trọng, yêu cầu mỗi sinh viên đều cần hoàn thành đúng quy định và giữ gìn tác phong người cán bộ Dược tương lai:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2.1. Đăng ký thông tin ngoại trú / nội trú
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5.5">
                    Thực hiện khai báo đầy đủ trên cổng sv.ump.edu.vn theo đúng thông báo của trường.
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-300 shrink-0 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
                  5,0 đ
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2.2. Đóng học phí đúng hạn
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5.5">
                    Hoàn thành nghĩa vụ học phí đúng quy định và thời hạn thông báo.
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-300 shrink-0 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
                  5,0 đ
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2.3. Chấm ĐRL đúng thời hạn
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5.5">
                    Nộp biểu mẫu chấm điểm rèn luyện đúng thời hạn quy định của đợt chấm.
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-300 shrink-0 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
                  3,0 đ
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2.4. Trang phục &amp; Đeo thẻ SV
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5.5">
                    Trang phục chỉnh tề, nghiêm túc; luôn đeo bảng tên/thẻ sinh viên khi vào trường.
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-300 shrink-0 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
                  3,0 đ
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2.5. Văn hóa học đường
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5.5">
                    Không nói tục, không gây mất trật tự, không hút thuốc lá, uống rượu bia trong khuôn viên trường.
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-300 shrink-0 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
                  3,0 đ
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2.6. Giữ gìn vệ sinh chung
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5.5">
                    Bảo quản tài sản chung, giữ gìn vệ sinh, bỏ rác đúng nơi quy định tại các giảng đường &amp; hành lang.
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-300 shrink-0 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
                  3,0 đ
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800 flex items-start justify-between gap-3 sm:col-span-2">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2.7. Tôn sư trọng đạo &amp; Ứng xử chuẩn mực
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5.5">
                    Tôn trọng, lễ phép với Thầy Cô giáo, cán bộ viên chức và người lao động trong nhà trường.
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-300 shrink-0 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
                  3,0 đ
                </span>
              </div>
            </div>
          </div>
        )}

        {/* DOMAIN 3 */}
        {activeDomain === 3 && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  Lĩnh vực 3 · Tối đa 20 điểm
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-50">
                  Ý thức tham gia hoạt động Chính trị, Văn hóa, Văn nghệ, Thể thao &amp; Phòng chống tệ nạn
                </h3>
              </div>
              <span className="text-xs font-mono text-purple-300 font-bold bg-purple-950/60 px-3 py-1 rounded-full border border-purple-500/30">
                Văn - Thể - Mỹ &amp; Đoàn thể
              </span>
            </div>

            {/* Mục 3.1 Ma trận */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070B14] border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                3.1. Hoạt động Chính trị, Văn nghệ, Thể thao, Truyền thông, Hội nhập
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                      <th className="py-2.5 px-3">Hình thức hoạt động</th>
                      <th className="py-2.5 px-3 text-cyan-300">Cấp Lớp / Trường Dược</th>
                      <th className="py-2.5 px-3 text-purple-300">Cấp ĐHYD / Khoa mở rộng</th>
                      <th className="py-2.5 px-3 text-slate-400">Ngoài trường</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Online có danh sách</td>
                      <td className="py-2.5 px-3">Tham gia: <strong className="text-cyan-300">1.0 đ</strong> · BTC: <strong className="text-cyan-300">2.0 đ</strong></td>
                      <td className="py-2.5 px-3">Tham gia: <strong className="text-purple-300">1.0 đ</strong> · BTC: <strong className="text-purple-300">2.0 đ</strong></td>
                      <td className="py-2.5 px-3" rowSpan={4}>
                        Được hội đồng duyệt:<br />
                        <strong className="text-amber-300 font-mono">1.0 đ / CT</strong><br />
                        <span className="text-[11px] text-slate-400">(Tối đa 3.0 đ)</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Offline có danh sách</td>
                      <td className="py-2.5 px-3">Tham gia: <strong className="text-cyan-300">2.0 đ</strong> · BTC: <strong className="text-cyan-300">5.0 đ</strong></td>
                      <td className="py-2.5 px-3">Tham gia: <strong className="text-purple-300">3.0 đ</strong> · BTC: <strong className="text-purple-300">6.0 đ</strong></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Cuộc thi nhiều vòng</td>
                      <td className="py-2.5 px-3">Loại: <strong className="text-cyan-300">2.0 đ</strong> · Bán kết: <strong className="text-cyan-300">3.0 đ</strong> · Chung kết: <strong className="text-cyan-300">4.0 đ</strong> · BTC: <strong className="text-cyan-300">5.0 đ</strong></td>
                      <td className="py-2.5 px-3">Loại: <strong className="text-purple-300">3.0 đ</strong> · Bán kết: <strong className="text-purple-300">4.0 đ</strong> · Chung kết: <strong className="text-purple-300">5.0 đ</strong> · BTC: <strong className="text-purple-300">6.0 đ</strong></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Webinar, workshop nhiều buổi</td>
                      <td className="py-2.5 px-3">1 buổi: <strong className="text-cyan-300">2.0 đ</strong> · Từ 2 buổi: <strong className="text-cyan-300">3.0 đ</strong> · BTC: <strong className="text-cyan-300">5.0 đ</strong></td>
                      <td className="py-2.5 px-3">1 buổi: <strong className="text-purple-300">3.0 đ</strong> · Từ 2 buổi: <strong className="text-purple-300">4.0 đ</strong> · BTC: <strong className="text-purple-300">6.0 đ</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mục 3.2 & 3.3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  3.2. Phòng chống tội phạm &amp; Tệ nạn xã hội
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li>• Người tham gia: <strong className="text-purple-300 font-mono">2.0 đ / chương trình</strong></li>
                  <li>• Ban tổ chức (BTC): <strong className="text-purple-300 font-mono">3.0 đ / chương trình</strong></li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  3.3. Điểm thưởng &amp; Khen thưởng chính trị
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li>• Kết nạp Đảng / Đảng viên hoàn thành NV / Đoàn viên ưu tú: <strong className="text-amber-300">3.0 đ</strong></li>
                  <li>• Sinh viên khỏe cấp Khoa/Trường: <strong className="text-cyan-300">1.0 đ</strong> (Cấp ĐHYD: <strong className="text-emerald-300">2.0 đ</strong>)</li>
                  <li>• Giải ba trở lên cuộc thi chính trị, văn thể mỹ: <strong className="text-purple-300">2.0 đ</strong> (Giải KK: 1.0 đ)</li>
                  <li>• Olympic Mác – Lênin hoặc huy động lực lượng cấp trường: <strong className="text-purple-300">2.0 đ / HĐ</strong></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* DOMAIN 4 */}
        {activeDomain === 4 && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Lĩnh vực 4 · Tối đa 25 điểm
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-50">
                  Ý thức công dân trong quan hệ cộng đồng &amp; Các hoạt động Tình nguyện
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-300 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                Tình nguyện &amp; Hiến máu
              </span>
            </div>

            {/* Mục 4.1: Ý thức công dân */}
            <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  4.1. Ý thức công dân trong quan hệ cộng đồng
                </h4>
                <span className="text-xs font-mono text-amber-300 font-bold">Tối đa 15.0 đ</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <p className="font-semibold text-slate-200">Chấp hành chủ trương</p>
                  <p className="text-[11px] text-slate-400 mt-1">Chấp hành chính sách Đảng, pháp luật Nhà nước và địa phương cư trú: <strong className="text-amber-300 font-mono">5.0 đ</strong></p>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <p className="font-semibold text-slate-200">An ninh &amp; Giao thông</p>
                  <p className="text-[11px] text-slate-400 mt-1">Không vi phạm an ninh trật tự, chấp hành nghiêm luật an toàn giao thông: <strong className="text-amber-300 font-mono">5.0 đ</strong></p>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <p className="font-semibold text-slate-200">Đoàn kết tập thể</p>
                  <p className="text-[11px] text-slate-400 mt-1">Hòa đồng, giúp đỡ bạn bè cùng tiến bộ; không gây bè phái, chia rẽ nội bộ: <strong className="text-amber-300 font-mono">5.0 đ</strong></p>
                </div>
              </div>
            </div>

            {/* Mục 4.2: Tình nguyện & Hiến máu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  4.2.1 &amp; 4.2.2. Chiến dịch Tình nguyện
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span>Ngắn ngày (&lt; 5 ngày) cấp Trường Dược:</span>
                    <span className="font-mono text-cyan-300">TG: 2 đ · BTC: 5 đ</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span>Ngắn ngày (&lt; 5 ngày) cấp ĐHYD / ngoài trường:</span>
                    <span className="font-mono text-emerald-300">TG: 3 đ · BTC: 6 đ</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span>Dài ngày (&gt;= 5 ngày, trên 5 buổi):</span>
                    <span className="font-mono text-amber-300">TG: 4 đ · BTC: 7 đ</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span>Quyên góp thiện nguyện có danh sách:</span>
                    <span className="font-mono text-cyan-300">TG: 2 đ · BTC: 3 đ</span>
                  </div>
                </div>
              </div>

              {/* Hiến máu nhân đạo */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/30 to-[#070B14] border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <HeartHandshake className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                      Hiến máu nhân đạo
                    </h4>
                    <span className="text-[10px] text-slate-400">Điểm thưởng cao và ý nghĩa nhân văn</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 font-medium">Tình nguyện viên hiến máu:</span>
                    <span className="font-mono font-bold text-rose-300 text-sm">5,0 đ / lần</span>
                  </div>
                  <p className="text-[11px] text-amber-300">
                    * Lưu ý: Không quá 2 lần hiến máu trên một học kỳ (tối đa 10,0 điểm).
                  </p>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-300">Ban tổ chức ngày hội hiến máu:</span>
                    <span className="font-mono font-semibold text-slate-200">3,0 đ / đợt</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  4.3. Khen thưởng các cấp về ý thức cộng đồng, công tác xã hội: <strong className="text-amber-300 font-mono">3,0 đ / HĐ</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DOMAIN 5 */}
        {activeDomain === 5 && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                  Lĩnh vực 5 · Tối đa 10 điểm
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-50">
                  Ý thức &amp; Kết quả khi tham gia Công tác cán bộ lớp, Đoàn thể &amp; Thành tích đặc biệt
                </h3>
              </div>
              <span className="text-xs font-mono text-yellow-300 font-bold bg-yellow-950/60 px-3 py-1 rounded-full border border-yellow-500/30">
                Ban cán sự &amp; Sinh viên 5 Tốt
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mục 5.1: Cán bộ lớp */}
              <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-yellow-300 uppercase tracking-wide">
                  5.1. Công tác Cán bộ Lớp &amp; Đoàn – Hội
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Thành viên BCH Đoàn – Hội cấp ĐHYD, chi ủy:</span>
                    <strong className="text-yellow-300 font-mono">8,0 đ</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Thành viên BCH Đoàn – Hội cấp Trường Dược:</span>
                    <strong className="text-yellow-300 font-mono">7,0 đ</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Cán bộ Lớp (Lớp trưởng, phó, thủ quỹ), Đoàn lớp, BCN CLB:</span>
                    <strong className="text-yellow-300 font-mono">6,0 đ</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Tổ trưởng, tổ phó:</span>
                    <strong className="text-yellow-300 font-mono">4,0 đ</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Thành viên CLB / Đội / Nhóm trực thuộc ĐHYD:</span>
                    <strong className="text-yellow-300 font-mono">2,0 đ</strong>
                  </div>
                </div>
              </div>

              {/* Mục 5.2: Họp lớp & E-portfolio */}
              <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-yellow-300 uppercase tracking-wide">
                    5.2. Họp lớp &amp; E-portfolio
                  </h4>
                  <span className="text-[11px] font-mono text-cyan-300">Theo DS CVHT</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <p>• Tham gia họp lớp định kỳ: <strong className="text-slate-100 font-mono">1,0 đ / buổi</strong>.</p>
                  <p>• Điền hồ sơ sinh viên trực tuyến E-portfolio đúng hạn: <strong className="text-slate-100 font-mono">1,0 đ</strong>.</p>
                  <div className="p-3 rounded-lg bg-yellow-950/20 border border-yellow-500/30 text-yellow-200">
                    <span className="font-bold">⭐ Quy định đặc biệt:</span> Tham gia <strong>đầy đủ tất cả các buổi họp lớp</strong> trong học kỳ + <strong>điền E-portfolio đúng hạn</strong> được tính trọn vẹn: <strong className="font-mono text-sm text-yellow-300">6,0 điểm</strong>!
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-xs text-slate-300">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    5.3. Danh hiệu Sinh viên 5 Tốt &amp; Khen thưởng
                  </h4>
                  <p>• Danh hiệu Sinh viên 5 Tốt cấp Trường Dược: <strong className="text-yellow-300 font-mono">3,0 đ</strong></p>
                  <p>• Tuyên dương cấp ĐHYD trở lên (SV 5 Tốt, Blouse trắng làm theo lời Bác): <strong className="text-yellow-300 font-mono">5,0 đ</strong></p>
                  <p>• Khen thưởng thành tích đặc biệt các cấp: <strong className="text-yellow-300 font-mono">3,0 đ / HĐ</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Important General Notes Footer */}
      <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-200">
        <span className="font-bold text-rose-400 shrink-0">LƯU Ý QUAN TRỌNG:</span>
        <div className="space-y-1 text-slate-300 leading-relaxed">
          <p>
            1. <strong className="text-rose-300">Không tính điểm cho các Minigame</strong> có hình thức sao chép và dán (copy-paste) câu trả lời.
          </p>
          <p>
            2. Để thống nhất cách tính điểm, <strong className="text-rose-300">điểm học tập (Mục 1.4) và các điểm thưởng liên quan đến học tập</strong> sẽ được Ban Chấp hành Đoàn – Hội Trường Dược tiến hành cộng sau khi có bảng điểm chính thức từ Đào tạo. Sinh viên tự chấm bằng forms vui lòng <strong className="text-rose-300">không tự tính điểm này</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
