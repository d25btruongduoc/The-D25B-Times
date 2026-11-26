import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Globe,
  LayoutGrid,
  List,
  Mail,
  Search,
  Table,
  Video,
  X,
} from 'lucide-react';
import { CONTACTS, COURSES, CourseItem, ResourceLink } from '../data/d25bData';

interface StudyViewProps {
  initialCourseId?: string;
  bookmarkedCourseIds?: string[];
  onToggleBookmarkCourse?: (courseId: string) => void;
}

type SemesterFilter = 'all' | 'y1-hk1' | 'y1-hk2' | 'y2-hk1' | 'y3-5';

const SEMESTER_TABS: { id: SemesterFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả học phần' },
  { id: 'y1-hk1', label: 'Năm 1 · HK1' },
  { id: 'y1-hk2', label: 'Năm 1 · HK2' },
  { id: 'y2-hk1', label: 'Năm 2 · HK1' },
  { id: 'y3-5', label: 'Năm 3 – 5' },
];

const COMPACT_SEMESTER_MAP: Record<CourseItem['semesterKey'], string> = {
  'y1-hk1': 'N1·K1',
  'y1-hk2': 'N1·K2',
  'y2-hk1': 'N2·K1',
  'y3-5': 'N3–5',
};

const PTN2_STEPS = [
  'Xem xét cơ sở lý thuyết ở mỗi bài thực tập (e-learning)',
  'Xem và phân tích video hướng dẫn thực tập (e-learning)',
  'Đọc và phân tích bài thực tập trong giáo trình',
  'Xem kỹ hình ảnh rổ dụng cụ (e-learning)',
  'Sắp xếp trình tự thực hiện các thí nghiệm cho phù hợp',
  'Xem xét việc sử dụng hóa chất, dụng cụ phù hợp cho từng thí nghiệm',
  'Nêu được các ứng dụng từ nội dung của bài thực tập trong ngành Dược',
];

function getLinkMeta(kind?: ResourceLink['kind']) {
  switch (kind) {
    case 'drive':
      return { Icon: FolderOpen, tag: 'Google Drive' };
    case 'docs':
      return { Icon: FileText, tag: 'Google Docs' };
    case 'sheets':
      return { Icon: Table, tag: 'Google Sheets' };
    case 'video':
      return { Icon: Video, tag: 'Video YouTube' };
    case 'forms':
      return { Icon: FileText, tag: 'Biểu mẫu nộp bài' };
    case 'notebook':
      return { Icon: BookOpen, tag: 'NotebookLM' };
    case 'teams':
      return { Icon: Globe, tag: 'MS Teams' };
    default:
      return { Icon: Globe, tag: 'Trang liên kết' };
  }
}

function getPreviewInfo(
  rawUrl: string,
  folderMode: 'list' | 'grid'
): { embedUrl: string; isFolder: boolean; isVideo: boolean } | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return null;

    const host = parsed.hostname;
    const path = parsed.pathname;

    if (host === 'drive.google.com') {
      const fileMatch = path.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch) {
        return {
          embedUrl: `https://drive.google.com/file/d/${fileMatch[1]}/preview`,
          isFolder: false,
          isVideo: false,
        };
      }
      const folderMatch = path.match(/^\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
      if (folderMatch) {
        return {
          embedUrl: `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#${folderMode}`,
          isFolder: true,
          isVideo: false,
        };
      }
      if (path === '/open') {
        const id = parsed.searchParams.get('id');
        if (id && /^[a-zA-Z0-9_-]+$/.test(id)) {
          return {
            embedUrl: `https://drive.google.com/file/d/${id}/preview`,
            isFolder: false,
            isVideo: false,
          };
        }
      }
    }

    if (host === 'docs.google.com') {
      if (path === '/folderview') {
        const id = parsed.searchParams.get('id');
        if (id && /^[a-zA-Z0-9_-]+$/.test(id)) {
          return {
            embedUrl: `https://drive.google.com/embeddedfolderview?id=${id}#${folderMode}`,
            isFolder: true,
            isVideo: false,
          };
        }
      }
      const docMatch = path.match(/^\/document\/d\/([a-zA-Z0-9_-]+)/);
      if (docMatch) {
        return {
          embedUrl: `https://docs.google.com/document/d/${docMatch[1]}/preview`,
          isFolder: false,
          isVideo: false,
        };
      }
      const sheetMatch = path.match(/^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (sheetMatch) {
        return {
          embedUrl: `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/htmlembed`,
          isFolder: false,
          isVideo: false,
        };
      }
    }

    if (host === 'www.youtube.com' || host === 'youtube.com') {
      const videoId = parsed.searchParams.get('v');
      if (path === '/watch' && videoId && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
        return {
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          isFolder: false,
          isVideo: true,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

function Hpt1FilenameBuilder() {
  const [group, setGroup] = useState('N01');
  const [labCode, setLabCode] = useState('1ABN');
  const [stt, setStt] = useState('02');
  const [fullName, setFullName] = useState('Nguyễn Văn A');
  const [mssv, setMssv] = useState('511250001');
  const [copied, setCopied] = useState(false);

  const formattedName = `THHPT1_D25_${group.trim() || 'N01'}_${labCode.trim() || '1ABN'}_${stt.trim() || '01'}_${fullName.trim() || 'HoTen'}_${mssv.trim() || 'MSSV'}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedName);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API fallback ignored if denied
    }
  };

  return (
    <div className="border border-slate-700/80 bg-[#0B1120] rounded-xl p-5">
      <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
        Tiện ích thực hành Hóa Phân Tích 1
      </p>
      <h4 className="mt-1 font-heading text-lg font-bold text-slate-50">
        Trình tạo tên file PDF chuẩn trước khi tải lên OneDrive
      </h4>
      <p className="mt-1 text-xs text-slate-400">
        Nhập thông tin cá nhân để tạo đúng định dạng tên file, tránh bị loại báo cáo khi nộp trong 24 giờ.
      </p>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <label className="block">
          <span className="text-xs text-slate-400">Nhóm</span>
          <input
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono bg-[#070B14] border border-slate-700 text-slate-100 rounded-md focus:outline-none focus:border-cyan-400"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400">Mã bài</span>
          <input
            type="text"
            value={labCode}
            onChange={(e) => setLabCode(e.target.value)}
            className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono bg-[#070B14] border border-slate-700 text-slate-100 rounded-md focus:outline-none focus:border-cyan-400"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400">STT</span>
          <input
            type="text"
            value={stt}
            onChange={(e) => setStt(e.target.value)}
            className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono bg-[#070B14] border border-slate-700 text-slate-100 rounded-md focus:outline-none focus:border-cyan-400"
          />
        </label>
        <label className="block col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400">Họ và tên</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full px-2.5 py-1.5 text-xs bg-[#070B14] border border-slate-700 text-slate-100 rounded-md focus:outline-none focus:border-cyan-400"
          />
        </label>
        <label className="block col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400">MSSV</span>
          <input
            type="text"
            value={mssv}
            onChange={(e) => setMssv(e.target.value)}
            className="mt-1 w-full px-2.5 py-1.5 text-xs font-mono bg-[#070B14] border border-slate-700 text-slate-100 rounded-md focus:outline-none focus:border-cyan-400"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#070B14] border border-slate-800 rounded-lg">
        <code className="text-xs sm:text-sm font-mono text-cyan-300 break-all">
          {formattedName}.pdf
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Đã sao chép' : 'Sao chép tên file'}</span>
        </button>
      </div>
    </div>
  );
}

function Ptn2PrepChecklist() {
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="border border-slate-700/80 bg-[#0B1120] rounded-xl p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            Kiểm tra trước buổi thực tập PTN 2 – BM. CNDP
          </p>
          <h4 className="mt-1 font-heading text-lg font-bold text-slate-50">
            7 bước chuẩn bị bắt buộc trước khi vào phòng thí nghiệm
          </h4>
        </div>
        <span className="text-xs font-mono tabular-nums font-medium text-cyan-300 shrink-0">
          {checkedSteps.length}/{PTN2_STEPS.length} bước
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {PTN2_STEPS.map((step, idx) => {
          const isChecked = checkedSteps.includes(idx);
          return (
            <li key={step}>
              <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#070B14] border border-slate-800/80 hover:border-slate-700 cursor-pointer text-xs sm:text-sm text-slate-300 hover:text-slate-100">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleStep(idx)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-[#070B14] text-cyan-400 focus:ring-cyan-400 shrink-0"
                />
                <span className={isChecked ? 'line-through text-slate-500' : ''}>
                  <span className="font-mono text-xs text-cyan-400 mr-1.5">0{idx + 1}.</span>
                  {step}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FacultyContactItem({ raw }: { raw: string }) {
  const emailMatch = raw.match(/\(([^@\s]+@[^@\s)]+)\)/);
  const email = emailMatch?.[1];
  const cleanLabel = email ? raw.replace(emailMatch[0], '').trim() : raw;
  const [role, person] = cleanLabel.split(':').map((s) => s.trim());

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3.5 py-2.5 bg-[#070B14] border border-slate-800/80 rounded-lg text-xs sm:text-sm">
      <div className="min-w-0">
        {person ? (
          <>
            <span className="text-slate-400">{role}: </span>
            <span className="font-medium text-slate-100">{person}</span>
          </>
        ) : (
          <span className="text-slate-200">{cleanLabel}</span>
        )}
      </div>
      {email && (
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-cyan-400 hover:text-cyan-300 shrink-0"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{email}</span>
        </a>
      )}
    </div>
  );
}

export function StudyView({
  initialCourseId,
  bookmarkedCourseIds = [],
  onToggleBookmarkCourse,
}: StudyViewProps) {
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialCourseId || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [folderMode, setFolderMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    if (initialCourseId) {
      setSelectedId(initialCourseId);
      setSemesterFilter('all');
      setSearchQuery('');
      setIsDrawerOpen(false);
    }
  }, [initialCourseId]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const filteredCourses = useMemo(() => {
    if (semesterFilter === 'y3-5') return [];
    const q = searchQuery.trim().toLowerCase();
    return COURSES.filter((c) => {
      const matchSem = semesterFilter === 'all' || c.semesterKey === semesterFilter;
      if (!matchSem) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.shortCode.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.highlights.some((hl) => hl.toLowerCase().includes(q)) ||
        (c.chapters?.some((ch) => ch.toLowerCase().includes(q)) ?? false) ||
        (c.sections?.some(
          (sec) =>
            sec.title.toLowerCase().includes(q) ||
            sec.items.some((item) => item.toLowerCase().includes(q))
        ) ?? false)
      );
    });
  }, [semesterFilter, searchQuery]);

  const activeCourse: CourseItem | undefined = useMemo(() => {
    if (!selectedId) return undefined;
    return filteredCourses.find((c) => c.id === selectedId) || COURSES.find((c) => c.id === selectedId);
  }, [filteredCourses, selectedId]);

  const firstPreviewableUrl = useMemo(() => {
    if (!activeCourse) return null;
    return activeCourse.links.find((l) => getPreviewInfo(l.url, 'list') !== null)?.url ?? null;
  }, [activeCourse]);

  useEffect(() => {
    setPreviewUrl(firstPreviewableUrl);
  }, [firstPreviewableUrl]);

  const activePreviewLink = useMemo(() => {
    if (!activeCourse || !previewUrl) return null;
    return activeCourse.links.find((l) => l.url === previewUrl) ?? null;
  }, [activeCourse, previewUrl]);

  const activePreviewInfo = useMemo(() => {
    if (!activePreviewLink) return null;
    return getPreviewInfo(activePreviewLink.url, folderMode);
  }, [activePreviewLink, folderMode]);

  const activeSemesterLabel =
    SEMESTER_TABS.find((t) => t.id === semesterFilter)?.label || 'Tất cả học phần';

  const handleSelectSemester = (tabId: SemesterFilter) => {
    setSemesterFilter(tabId);
    setSelectedId(null);
    setIsDrawerOpen(false);
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedId(courseId);
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
      {/* Slim Compact Top Header & Semester Controls */}
      <div className="pb-4 border-b border-slate-800 flex flex-col gap-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-50">
              Kho học phần &amp; Thực tập D25B
            </h1>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              5 năm Dược sĩ ĐH
            </span>
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lọc nhanh tên môn, mã môn..."
              aria-label="Lọc nhanh tên môn học"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-[#0E1525] border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Semester Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#0E1525] border border-slate-800 rounded-lg overflow-x-auto w-fit max-w-full">
          {SEMESTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectSemester(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                semesterFilter === tab.id
                  ? 'bg-cyan-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Left-Edge Pull-Out Pop-up Handle & Drawer for Courses by Semester */}
      {semesterFilter !== 'y3-5' && filteredCourses.length > 0 && (
        <>
          {!isDrawerOpen && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Kéo ra danh sách học phần theo học kỳ"
              title={`Mở danh sách ${activeSemesterLabel}`}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-[#0B1120]/95 backdrop-blur-md border border-l-0 border-cyan-400/50 rounded-r-xl py-4 px-1.5 text-cyan-400 hover:text-cyan-200 hover:bg-[#131C31] hover:pl-2.5 transition-all shadow-[4px_0_24px_rgba(0,0,0,0.55)] cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {isDrawerOpen && (
            <>
              <div
                aria-hidden="true"
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
              />

              <div
                role="dialog"
                aria-label="Danh sách học phần theo học kỳ"
                className="fixed left-0 top-1/2 -translate-y-1/2 z-50 w-[300px] sm:w-[340px] max-w-[88vw] max-h-[78vh] flex flex-col bg-[#0B1120]/98 backdrop-blur-xl border border-l-0 border-cyan-500/45 rounded-r-2xl shadow-[16px_0_48px_rgba(0,0,0,0.75)] overflow-hidden"
              >
                <div className="px-3.5 py-2.5 bg-[#070B14] border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 truncate">
                      {activeSemesterLabel}
                    </p>
                    <p className="text-xs font-semibold text-slate-100">
                      Danh sách môn ({filteredCourses.length})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    aria-label="Thu vào danh sách học phần"
                    className="p-1.5 text-slate-400 hover:text-cyan-300 bg-[#0E1525] border border-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#070B14] border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                      <tr>
                        <th scope="col" className="py-2 pl-3.5 pr-1.5 font-medium">
                          Mã
                        </th>
                        <th scope="col" className="py-2 px-1.5 font-medium">
                          Học phần
                        </th>
                        <th scope="col" className="py-2 pl-1.5 pr-3.5 font-medium text-right">
                          HK
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-xs">
                      {filteredCourses.map((course) => {
                        const isSelected = activeCourse?.id === course.id;
                        return (
                          <tr
                            key={course.id}
                            onClick={() => handleSelectCourse(course.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-cyan-400/15 border-l-2 border-l-cyan-400'
                                : 'hover:bg-[#131C31]'
                            }`}
                          >
                            <td className="py-2.5 pl-3.5 pr-1.5 align-top font-mono font-semibold whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCourse(course.id);
                                }}
                                className={`text-left cursor-pointer ${
                                  isSelected ? 'text-cyan-300' : 'text-cyan-400/85'
                                }`}
                              >
                                {course.shortCode}
                              </button>
                            </td>
                            <td
                              className={`py-2.5 px-1.5 align-top leading-snug ${
                                isSelected ? 'font-semibold text-slate-50' : 'text-slate-300'
                              }`}
                            >
                              {course.name}
                            </td>
                            <td className="py-2.5 pl-1.5 pr-3.5 align-top text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                              {COMPACT_SEMESTER_MAP[course.semesterKey]}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Main Content Area */}
      {semesterFilter === 'y3-5' ? (
        <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            Lộ trình Năm 3 · Năm 4 · Năm 5
          </p>
          <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold text-slate-50">
            Kho học liệu các năm chuyên ngành đang được hoàn thiện
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Hiện khóa D25B đang tập trung cập nhật đầy đủ học liệu Năm 1 và Năm 2 (HK1). Nếu anh chị khóa trên hoặc các bạn có tài liệu chuyên ngành Năm 3–5 muốn đóng góp cho lớp, vui lòng gửi về email thư viện lớp.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${CONTACTS.libraryEmail}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
            >
              <span>Gửi tài liệu qua {CONTACTS.libraryEmail}</span>
            </a>
            <button
              type="button"
              onClick={() => handleSelectSemester('y2-hk1')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-100 bg-[#131C31] border border-slate-700 hover:border-cyan-400/50 rounded-lg whitespace-nowrap cursor-pointer"
            >
              <span>Xem môn Năm 2 · HK1</span>
            </button>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-10 text-center">
          <p className="text-base font-medium text-slate-100">
            Không có học phần nào khớp với &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              handleSelectSemester('all');
            }}
            className="mt-3 text-sm font-medium text-cyan-400 hover:underline cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : activeCourse ? (
        /* Selected Course Detail Content (Full Width, No Bottom List) */
        <section className="w-full bg-[#0E1525] border border-slate-800 rounded-xl p-5 sm:p-7 space-y-6">
          {/* Course Header & Overview */}
          <div className="pb-5 border-b border-slate-800/90">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-cyan-300 bg-[#0B1120] border border-slate-800 hover:border-cyan-500/40 rounded-md transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Danh sách học phần</span>
                </button>
                <span className="px-2 py-0.5 font-mono font-semibold bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 rounded">
                  {activeCourse.shortCode}
                </span>
                <span className="text-cyan-400 font-semibold">{activeCourse.semester}</span>
                <span className="text-slate-600" aria-hidden="true">
                  /
                </span>
                <span className="text-slate-300">{activeCourse.category}</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span>{activeCourse.links.length} tài liệu</span>
                {activeCourse.chapters && activeCourse.chapters.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{activeCourse.chapters.length} chuyên đề</span>
                  </>
                )}
                {onToggleBookmarkCourse && (
                  <button
                    type="button"
                    onClick={() => onToggleBookmarkCourse(activeCourse.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-sans text-xs font-medium transition-colors cursor-pointer ${
                      bookmarkedCourseIds.includes(activeCourse.id)
                        ? 'bg-cyan-400/15 border-cyan-400/50 text-cyan-300'
                        : 'bg-[#0B1120] border-slate-700 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300'
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        bookmarkedCourseIds.includes(activeCourse.id) ? 'fill-cyan-400 text-cyan-400' : ''
                      }`}
                    />
                    <span>
                      {bookmarkedCourseIds.includes(activeCourse.id) ? 'Đã lưu môn' : 'Đánh dấu'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <h2 className="mt-3.5 font-heading text-2xl sm:text-3xl font-bold text-slate-50 leading-tight">
              {activeCourse.name}
            </h2>

            <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed">
              {activeCourse.summary}
            </p>
          </div>

          {/* Priority Lookup: Tài liệu & Liên kết nhanh + Inline Small Preview Window Below */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                Truy cập nhanh tài liệu &amp; thư mục ({activeCourse.links.length})
              </h3>
              {firstPreviewableUrl && (
                <span className="text-[11px] text-slate-400">
                  Nhấn vào thẻ để xem trước ở khung bên dưới hoặc mở tab mới
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCourse.links.map((link) => {
                const { Icon, tag } = getLinkMeta(link.kind);
                const isPreviewable = getPreviewInfo(link.url, folderMode) !== null;
                const isPreviewing = activePreviewLink?.url === link.url;

                if (!isPreviewable) {
                  return (
                    <a
                      key={link.url + link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 px-4 py-3 bg-[#0B1120] hover:bg-[#131C31] border border-slate-800 hover:border-cyan-400/60 rounded-lg transition-colors"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="p-2 rounded-md bg-cyan-400/10 text-cyan-400 shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-100 group-hover:text-cyan-300 truncate">
                            {link.label}
                          </span>
                          <span className="block text-[11px] font-mono text-slate-400">
                            {tag}
                          </span>
                        </span>
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                    </a>
                  );
                }

                return (
                  <div
                    key={link.url + link.label}
                    className={`group flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border transition-colors ${
                      isPreviewing
                        ? 'bg-cyan-400/12 border-cyan-400 shadow-[0_0_0_1px_rgba(34,211,238,0.2)]'
                        : 'bg-[#0B1120] hover:bg-[#131C31] border-slate-800 hover:border-cyan-400/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(link.url)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <span
                        className={`p-2 rounded-md shrink-0 ${
                          isPreviewing
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-cyan-400/10 text-cyan-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-medium truncate ${
                            isPreviewing
                              ? 'text-cyan-200 font-semibold'
                              : 'text-slate-100 group-hover:text-cyan-300'
                          }`}
                        >
                          {link.label}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <span>{tag}</span>
                          <span aria-hidden="true">·</span>
                          <span className={isPreviewing ? 'text-cyan-300' : 'text-cyan-400/80'}>
                            {isPreviewing ? 'Đang xem' : 'Xem trước'}
                          </span>
                        </span>
                      </span>
                    </button>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Mở trong tab mới"
                      aria-label={`Mở ${link.label} trong tab mới`}
                      className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 rounded-md transition-colors shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Small Inline Preview Window Below File Links */}
            {activePreviewLink && activePreviewInfo ? (
              <div className="mt-4 border border-cyan-500/40 bg-[#0B1120] rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
                <div className="px-3.5 py-2 bg-[#070B14] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center gap-1 shrink-0" aria-hidden="true">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    </span>
                    <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-100 truncate">
                      {activePreviewLink.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {activePreviewInfo.isFolder && (
                      <button
                        type="button"
                        onClick={() =>
                          setFolderMode((prev) => (prev === 'list' ? 'grid' : 'list'))
                        }
                        title={
                          folderMode === 'list'
                            ? 'Chuyển sang dạng lưới'
                            : 'Chuyển sang dạng danh sách'
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-cyan-300 bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded transition-colors cursor-pointer"
                      >
                        {folderMode === 'list' ? (
                          <>
                            <LayoutGrid className="w-3 h-3" />
                            <span>Lưới</span>
                          </>
                        ) : (
                          <>
                            <List className="w-3 h-3" />
                            <span>Danh sách</span>
                          </>
                        )}
                      </button>
                    )}

                    <a
                      href={activePreviewLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded transition-colors"
                    >
                      <span>Mở tab mới</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setPreviewUrl(null)}
                      aria-label="Đóng cửa sổ xem trước"
                      className="p-1 text-slate-400 hover:text-slate-100 bg-[#0E1525] border border-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  className={`w-full h-[360px] sm:h-[420px] ${
                    activePreviewInfo.isVideo ? 'bg-[#070B14]' : 'bg-slate-100'
                  }`}
                >
                  <iframe
                    key={activePreviewInfo.embedUrl}
                    src={activePreviewInfo.embedUrl}
                    title={`Xem trước ${activePreviewLink.label}`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            ) : (
              firstPreviewableUrl && (
                <div className="mt-3 px-3.5 py-2 bg-[#0B1120] border border-dashed border-slate-700 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>
                    Nhấn vào bất kỳ tài liệu Drive, thư mục, Docs, Sheets hoặc Video phía trên để xem trước ngay tại đây.
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(firstPreviewableUrl)}
                    className="inline-flex items-center gap-1 font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Mở xem trước</span>
                  </button>
                </div>
              )
            )}
          </div>

          {/* Scannable Structured Grid: Highlights + Chapters */}
          {(activeCourse.highlights.length > 0 ||
            (activeCourse.chapters && activeCourse.chapters.length > 0)) && (
            <div
              className={`grid grid-cols-1 ${
                activeCourse.highlights.length > 0 &&
                activeCourse.chapters &&
                activeCourse.chapters.length > 0
                  ? 'xl:grid-cols-12'
                  : ''
              } gap-5`}
            >
              {activeCourse.highlights.length > 0 && (
                <div
                  className={`${
                    activeCourse.chapters && activeCourse.chapters.length > 0
                      ? 'xl:col-span-5'
                      : ''
                  } bg-[#0B1120] border border-slate-800 rounded-xl p-4 sm:p-5`}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <h3>Điểm cần lưu ý</h3>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {activeCourse.highlights.map((hl, idx) => (
                      <li
                        key={hl}
                        className="text-sm text-slate-200 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="font-mono text-xs text-cyan-400 mt-0.5 shrink-0">
                          0{idx + 1}
                        </span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeCourse.chapters && activeCourse.chapters.length > 0 && (
                <div
                  className={`${
                    activeCourse.highlights.length > 0 ? 'xl:col-span-7' : ''
                  } bg-[#0B1120] border border-slate-800 rounded-xl p-4 sm:p-5`}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-300 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <h3>Nội dung bài giảng &amp; Chuyên đề</h3>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeCourse.chapters.map((ch, idx) => (
                      <div
                        key={ch}
                        className="flex items-start gap-2 px-3 py-2 text-xs sm:text-sm bg-[#070B14] border border-slate-800/80 rounded-md text-slate-200"
                      >
                        <span className="font-mono text-[11px] text-cyan-400 mt-0.5 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span>{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Course Posts / Regulations / Schedules from The D25B Times */}
          {activeCourse.sections && activeCourse.sections.length > 0 && (
            <div className="space-y-4">
              {activeCourse.sections.map((sec) => (
                <div
                  key={sec.title}
                  className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="font-heading text-base font-bold text-slate-50">
                      {sec.title}
                    </h3>
                    {sec.badge && (
                      <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 rounded">
                        {sec.badge}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {sec.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 px-3 py-2 text-xs sm:text-sm bg-[#070B14] border border-slate-800/80 rounded-lg text-slate-200 leading-relaxed"
                      >
                        <span className="text-cyan-400 font-mono mt-0.5 shrink-0">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Faculty Contacts if present */}
          {activeCourse.facultyContact && activeCourse.facultyContact.length > 0 && (
            <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 sm:p-5">
              <h3 className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
                Liên hệ Bộ môn &amp; Phụ trách
              </h3>
              <div className="space-y-2">
                {activeCourse.facultyContact.map((fc) => (
                  <FacultyContactItem key={fc} raw={fc} />
                ))}
              </div>
            </div>
          )}

          {/* Special Interactive Course Utilities */}
          {activeCourse.specialTool === 'hpt1-filename' && <Hpt1FilenameBuilder />}
          {activeCourse.specialTool === 'ptn2-checklist' && <Ptn2PrepChecklist />}
          {activeCourse.specialTool === 'chemdraw-notice' && (
            <div className="border border-cyan-500/30 bg-[#0B1120] rounded-xl p-4 text-sm text-slate-300">
              <span className="font-semibold text-cyan-300">Yêu cầu phần mềm:</span> Bộ môn yêu cầu sinh viên cài đặt{' '}
              <span className="font-mono font-medium text-cyan-400">ChemDraw ≥ 18.0</span> trước khi bắt đầu học phần để phục vụ vẽ công thức cấu tạo và cơ chế phản ứng.
            </div>
          )}
        </section>
      ) : (
        /* Default Uncollapsed Course List shown immediately upon opening a Năm - Học Kỳ */
        <section className="w-full bg-[#0E1525] border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 bg-[#0B1120] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
                {activeSemesterLabel}
              </p>
              <h2 className="mt-0.5 font-heading text-lg sm:text-xl font-bold text-slate-50">
                Danh sách học phần ({filteredCourses.length} môn)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Chọn một môn học bên dưới để mở tài liệu và thông tin chi tiết
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0B1120]/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th scope="col" className="py-2.5 pl-5 pr-3 font-medium">
                    Mã HP
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-medium">
                    Tên học phần
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-medium hidden md:table-cell">
                    Phân loại
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-medium whitespace-nowrap">
                    Học kỳ
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-medium text-right whitespace-nowrap">
                    Tài liệu
                  </th>
                  <th scope="col" className="py-2.5 pl-2 pr-5 font-medium text-right">
                    <span className="sr-only">Mở</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    onClick={() => handleSelectCourse(course.id)}
                    className="group hover:bg-[#131C31] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 pl-5 pr-3 align-top whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 text-xs font-mono font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/25 rounded">
                        {course.shortCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCourse(course.id);
                        }}
                        className="text-left font-heading font-bold text-slate-100 group-hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        {course.name}
                      </button>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-1 max-w-2xl">
                        {course.summary}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 align-top text-xs text-slate-300 hidden md:table-cell whitespace-nowrap">
                      {course.category}
                    </td>
                    <td className="py-3.5 px-3 align-top text-xs font-mono text-slate-400 whitespace-nowrap">
                      {COMPACT_SEMESTER_MAP[course.semesterKey]}
                    </td>
                    <td className="py-3.5 px-3 align-top text-right text-xs font-mono text-cyan-400 whitespace-nowrap">
                      {course.links.length} link
                    </td>
                    <td className="py-3.5 pl-2 pr-5 align-top text-right">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 inline-block transition-transform group-hover:translate-x-0.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
