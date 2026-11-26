import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  DEADLINES,
  DeadlineTask,
  getActiveDeadlines,
  getCalendarDaysRemaining,
  HandbookTab,
  HK2_HOLIDAYS,
  HK2_SCHEDULE_EVENTS,
  Hk2ScheduleEvent,
  NavSection,
  SCHEDULE_CLASS_META,
  ScheduleClassCode,
} from '../data/d25bData';
import { useAppUpdates } from '../services/githubUpdatesService';
import { HoverPreviewCard } from './HoverMiniPreview';

interface DeadlineViewProps {
  completedIds: string[];
  onToggleComplete: (id: string) => void;
  preferredClass?: 'ALL' | ScheduleClassCode;
  onChangePreferredClass?: (cls: 'ALL' | ScheduleClassCode) => void;
  onNavigate: (
    section: NavSection,
    options?: { handbookTab?: HandbookTab; courseId?: string }
  ) => void;
}

const CATEGORIES: ('Tất cả' | DeadlineTask['category'])[] = [
  'Tất cả',
  'Đăng ký học phần',
  'Học vụ & BHYT',
  'Hoạt động & ĐRL',
];

const CLASS_FILTERS: ('ALL' | ScheduleClassCode)[] = [
  'ALL',
  'D25A',
  'D25B',
  'D25C',
  'D25D',
];

const CLASS_ORDER: ScheduleClassCode[] = ['D25A', 'D25B', 'D25C', 'D25D'];

const CLASS_BADGE_STYLES: Record<
  ScheduleClassCode,
  { badge: string; border: string; dot: string; text: string }
> = {
  D25A: {
    badge: 'bg-sky-400/15 text-sky-300 border-sky-400/40',
    border: 'border-sky-500/30',
    dot: 'bg-sky-400',
    text: 'text-sky-300',
  },
  D25B: {
    badge: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/40',
    border: 'border-cyan-500/35',
    dot: 'bg-cyan-400',
    text: 'text-cyan-300',
  },
  D25C: {
    badge: 'bg-violet-400/15 text-violet-300 border-violet-400/40',
    border: 'border-violet-500/30',
    dot: 'bg-violet-400',
    text: 'text-violet-300',
  },
  D25D: {
    badge: 'bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/40',
    border: 'border-fuchsia-500/30',
    dot: 'bg-fuchsia-400',
    text: 'text-fuchsia-300',
  },
};

const KIND_BADGE: Record<
  Hk2ScheduleEvent['kind'],
  { label: string; style: string }
> = {
  theory: {
    label: 'Lý thuyết',
    style: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  practice: {
    label: 'Thực hành',
    style: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  },
  exam: {
    label: 'Thi / Đánh giá',
    style: 'bg-rose-400/15 text-rose-300 border-rose-400/35',
  },
  makeup: {
    label: 'Bù Tết DL / Đổi phòng',
    style: 'bg-amber-400/15 text-amber-300 border-amber-400/35',
  },
};

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function shiftDateKey(key: string, deltaDays: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + deltaDays);
  return toDateKey(d);
}

function getHk2WeekNumber(key: string): number | null {
  const start = new Date(2026, 10, 16); // 2026-11-16 (Week 1 start)
  const target = parseDateKey(key);
  const diffDays = Math.floor(
    (target.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays < 0 || diffDays >= 31 * 7) return null;
  return Math.floor(diffDays / 7) + 1;
}

function formatViDate(d: Date): string {
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatViTime(d: Date): string {
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function DeadlineView({
  completedIds,
  onToggleComplete,
  preferredClass,
  onChangePreferredClass,
  onNavigate,
}: DeadlineViewProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [localClassFilter, setLocalClassFilter] = useState<'ALL' | ScheduleClassCode>(
    preferredClass ?? 'ALL'
  );
  const classFilter = preferredClass ?? localClassFilter;
  const setClassFilter = (next: 'ALL' | ScheduleClassCode) => {
    setLocalClassFilter(next);
    onChangePreferredClass?.(next);
  };
  const [calendarInspectorTab, setCalendarInspectorTab] = useState<'day' | 'special'>('day');
  const [category, setCategory] = useState<'Tất cả' | DeadlineTask['category']>('Tất cả');
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [expandedDeadlineIds, setExpandedDeadlineIds] = useState<string[]>([]);
  const [expandedUpdateIds, setExpandedUpdateIds] = useState<string[]>([]);

  // Real-time clock synchronization (refreshes every 30s and on tab focus)
  useEffect(() => {
    const syncNow = () => setNow(new Date());
    const timer = window.setInterval(syncNow, 30_000);
    window.addEventListener('focus', syncNow);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', syncNow);
    };
  }, []);

  const todayKey = toDateKey(now);
  const focusedDateKey = selectedDateKey ?? todayKey;

  // Auto-prune expired deadlines & 7-day expired app updates in real time
  const activeDeadlines = useMemo(() => getActiveDeadlines(now), [now]);
  const activeUpdates = useAppUpdates(now);

  // Next upcoming deadline for the top countdown
  const nextDeadline = useMemo(() => {
    if (activeDeadlines.length === 0) return null;
    return [...activeDeadlines].sort(
      (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    )[0];
  }, [activeDeadlines]);

  // Filtered deadlines by category (never accidentally hidden when browsing calendar weeks)
  const filteredDeadlines = useMemo(() => {
    return activeDeadlines.filter((d) => {
      if (category !== 'Tất cả' && d.category !== category) return false;
      return true;
    });
  }, [activeDeadlines, category]);

  // Schedule lookup maps (filtered by selected class or ALL 4 classes)
  const visibleScheduleEvents = useMemo(() => {
    if (classFilter === 'ALL') return HK2_SCHEDULE_EVENTS;
    return HK2_SCHEDULE_EVENTS.filter((e) => e.classCode === classFilter);
  }, [classFilter]);

  const scheduleByDateMap = useMemo(() => {
    const map = new Map<string, Hk2ScheduleEvent[]>();
    for (const ev of visibleScheduleEvents) {
      const list = map.get(ev.date);
      if (list) list.push(ev);
      else map.set(ev.date, [ev]);
    }
    return map;
  }, [visibleScheduleEvents]);

  const holidayMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const h of HK2_HOLIDAYS) {
      map.set(h.date, h.label);
    }
    return map;
  }, []);

  // Today's quick summary for the compact collapsed calendar toggle bar
  const todayAllEvents = useMemo(
    () => HK2_SCHEDULE_EVENTS.filter((e) => e.date === todayKey),
    [todayKey]
  );
  const todayHolidayLabel = holidayMap.get(todayKey);

  // Events on the currently inspected calendar date, grouped clearly by each of the 4 classes
  const focusedDayEvents = useMemo(
    () => scheduleByDateMap.get(focusedDateKey) ?? [],
    [scheduleByDateMap, focusedDateKey]
  );

  const focusedDayEventsByClass = useMemo(() => {
    const groups: { classCode: ScheduleClassCode; items: Hk2ScheduleEvent[] }[] = [];
    for (const code of CLASS_ORDER) {
      const items = focusedDayEvents.filter((e) => e.classCode === code);
      if (items.length > 0) groups.push({ classCode: code, items });
    }
    return groups;
  }, [focusedDayEvents]);

  const focusedDayDeadlines = useMemo(
    () => activeDeadlines.filter((d) => d.eventDate === focusedDateKey),
    [activeDeadlines, focusedDateKey]
  );

  const focusedDayUpdates = useMemo(
    () => activeUpdates.filter((u) => toDateKey(new Date(u.updatedAt)) === focusedDateKey),
    [activeUpdates, focusedDateKey]
  );

  const upcomingSpecialEvents = useMemo(() => {
    return visibleScheduleEvents.filter(
      (e) => (e.kind === 'exam' || e.kind === 'makeup') && e.date >= todayKey
    );
  }, [visibleScheduleEvents, todayKey]);

  // Calendar grid generation (Monday-first)
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;

    const cells: { date: Date | null; key: string }[] = [];
    for (let i = 0; i < offset; i++) {
      cells.push({ date: null, key: `empty-start-${i}` });
    }
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      cells.push({ date, key: toDateKey(date) });
    }
    return cells;
  }, [calendarMonth]);

  const deadlineDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const d of activeDeadlines) {
      if (d.eventDate) set.add(d.eventDate);
    }
    return set;
  }, [activeDeadlines]);

  const updateDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const u of activeUpdates) {
      set.add(toDateKey(new Date(u.updatedAt)));
    }
    return set;
  }, [activeUpdates]);

  const toggleDeadlineExpand = (id: string) => {
    setExpandedDeadlineIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleUpdateExpand = (id: string) => {
    setExpandedUpdateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeCompletedCount = activeDeadlines.filter((d) =>
    completedIds.includes(d.id)
  ).length;

  const shiftMonth = (delta: number) => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const selectDateAndSyncMonth = (key: string) => {
    setSelectedDateKey(key);
    const d = parseDateKey(key);
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const jumpToToday = () => {
    const fresh = new Date();
    setNow(fresh);
    setCalendarMonth(new Date(fresh.getFullYear(), fresh.getMonth(), 1));
    setSelectedDateKey(null);
  };

  const monthLabel = calendarMonth.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const focusedWeek = getHk2WeekNumber(focusedDateKey);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium">
            Đồng bộ thời gian thực · Tự động lọc tin quá hạn
          </p>
          <h1 className="mt-1.5 font-heading text-3xl sm:text-4xl font-bold text-slate-50">
            Lịch Deadline &amp; Cập nhật Hệ thống
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-[#0E1525] border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs text-slate-400 capitalize">{formatViDate(now)}</p>
              <p className="text-sm font-mono tabular-nums font-semibold text-slate-50">
                {formatViTime(now)} · Thời gian thực
              </p>
            </div>
          </div>

          <div className="bg-[#0E1525] border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs text-slate-400">Đầu việc còn hiệu lực</p>
              <p className="text-sm font-mono tabular-nums font-semibold text-slate-50">
                {activeCompletedCount}/{activeDeadlines.length} đã xong
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Compact Daily Calendar & 4-Class HK2 Schedule Section */}
      <section className="bg-[#0E1525] border border-slate-800 rounded-xl overflow-hidden">
        {/* Compact Clickable Trigger Header */}
        <button
          type="button"
          onClick={() => setIsCalendarExpanded((prev) => !prev)}
          aria-expanded={isCalendarExpanded}
          className="w-full px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left hover:bg-[#131C31]/70 transition-colors cursor-pointer"
        >
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-semibold">
                  Bộ đếm lịch theo ngày
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-100 mt-0.5 truncate">
                {todayHolidayLabel
                  ? `Hôm nay (${todayKey.split('-').reverse().join('/')}): ${todayHolidayLabel}`
                  : todayAllEvents.length > 0
                    ? `Hôm nay (${todayKey.split('-').reverse().join('/')}): ${todayAllEvents
                        .map((e) => `${e.classCode} (${e.session}: ${e.subject})`)
                        .join(' · ')}`
                    : `Hôm nay (${todayKey.split('-').reverse().join('/')}) · Lịch tháng & TKB 4 lớp`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 pl-13 md:pl-0">
            {nextDeadline && (
              <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30 rounded-md whitespace-nowrap">
                {(() => {
                  const diff = getCalendarDaysRemaining(nextDeadline.expiresAt, now);
                  if (diff <= 0) return 'Deadline hôm nay';
                  if (diff === 1) return 'Deadline: Còn 1 ngày';
                  return `Deadline: Còn ${diff} ngày`;
                })()}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-400/10 border border-cyan-500/30 rounded-md whitespace-nowrap">
              <span>{isCalendarExpanded ? 'Thu gọn lịch' : 'Bấm để mở lịch'}</span>
              {isCalendarExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </div>
        </button>

        {/* Expanded Calendar & 4-Class Timetable Content */}
        {isCalendarExpanded && (
          <div className="p-5 border-t border-slate-800 space-y-5 bg-[#0B1120]/50">
            {/* 4-Class Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-200">
                  Chọn lớp để xem lịch HK2 2026–2027 (Phân tách 4 lớp khác nhau):
                </p>
                <p className="text-xs text-slate-400">
                  {classFilter === 'ALL'
                    ? 'Đang hiển thị lịch của cả 4 lớp D25A, D25B, D25C và D25D với nhãn màu riêng biệt.'
                    : `${SCHEDULE_CLASS_META[classFilter].label}: ${SCHEDULE_CLASS_META[classFilter].description}`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {CLASS_FILTERS.map((code) => {
                  const active = classFilter === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setClassFilter(code)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-cyan-400 text-slate-950 border-cyan-400 font-semibold'
                          : 'bg-[#0E1525] text-slate-300 border-slate-700 hover:border-cyan-400/50'
                      }`}
                    >
                      {code === 'ALL'
                        ? 'Tất cả (4 lớp)'
                        : SCHEDULE_CLASS_META[code].shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Interactive Monthly Calendar */}
              <div className="lg:col-span-5 bg-[#0E1525] border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-cyan-400 font-semibold">
                      Lịch tháng · 4 lớp HK2
                    </p>
                    <h2 className="font-heading text-lg font-bold text-slate-50 capitalize">
                      {monthLabel}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={jumpToToday}
                      className="px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-500/30 hover:bg-cyan-400/20 rounded-md cursor-pointer"
                    >
                      Hôm nay
                    </button>
                    <button
                      type="button"
                      onClick={() => shiftMonth(-1)}
                      aria-label="Tháng trước"
                      className="p-1.5 text-slate-300 bg-[#0B1120] border border-slate-800 hover:border-slate-700 rounded-md cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => shiftMonth(1)}
                      aria-label="Tháng sau"
                      className="p-1.5 text-slate-300 bg-[#0B1120] border border-slate-800 hover:border-slate-700 rounded-md cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((cell) => {
                    if (!cell.date) {
                      return <div key={cell.key} className="h-10" />;
                    }
                    const key = cell.key;
                    const isToday = key === todayKey;
                    const isSelected = key === focusedDateKey;
                    const dayEvents = scheduleByDateMap.get(key) ?? [];
                    const hasClass = dayEvents.length > 0;
                    const hasExam = dayEvents.some((e) => e.kind === 'exam');
                    const hasMakeup = dayEvents.some((e) => e.kind === 'makeup');
                    const isHoliday = holidayMap.has(key);
                    const hasDeadline = deadlineDateSet.has(key);
                    const hasUpdate = updateDateSet.has(key);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedDateKey(key);
                          setCalendarInspectorTab('day');
                        }}
                        title={
                          holidayMap.get(key) ??
                          (dayEvents.length > 0
                            ? `${dayEvents.length} buổi học`
                            : undefined)
                        }
                        className={`relative h-10 rounded-lg text-xs font-mono tabular-nums transition-colors flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-400 text-slate-950 font-bold'
                            : isToday
                              ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/60 font-bold'
                              : isHoliday
                                ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 hover:bg-amber-500/25'
                                : 'text-slate-300 hover:bg-[#131C31]'
                        }`}
                      >
                        <span>{cell.date.getDate()}</span>
                        {(hasClass || hasDeadline || hasUpdate) && (
                          <span className="flex items-center gap-0.5 mt-0.5">
                            {hasExam ? (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-slate-950' : 'bg-rose-400'
                                }`}
                              />
                            ) : hasMakeup ? (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-slate-950' : 'bg-amber-300'
                                }`}
                              />
                            ) : hasClass ? (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-slate-950' : 'bg-cyan-400'
                                }`}
                              />
                            ) : null}
                            {hasDeadline && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-slate-950' : 'bg-amber-400'
                                }`}
                              />
                            )}
                            {hasUpdate && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-slate-950' : 'bg-emerald-400'
                                }`}
                              />
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Lịch học / TT
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Thi / Đánh giá
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-300" />
                    Bù Tết DL / Nghỉ lễ
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Cập nhật App
                  </span>
                </div>
              </div>

              {/* Selected Day / 4-Class Inspector Panel */}
              <div className="lg:col-span-7 bg-[#0E1525] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 p-1 bg-[#0B1120] border border-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCalendarInspectorTab('day')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                        calendarInspectorTab === 'day'
                          ? 'bg-cyan-400 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      Chi tiết theo ngày
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarInspectorTab('special')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                        calendarInspectorTab === 'special'
                          ? 'bg-cyan-400 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      Lịch thi &amp; Bù Tết DL ({upcomingSpecialEvents.length})
                    </button>
                  </div>

                  {calendarInspectorTab === 'day' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          selectDateAndSyncMonth(shiftDateKey(focusedDateKey, -1))
                        }
                        className="px-2.5 py-1 text-xs text-slate-300 bg-[#0B1120] border border-slate-700 hover:border-cyan-400/40 rounded cursor-pointer"
                      >
                        Ngày trước
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          selectDateAndSyncMonth(shiftDateKey(focusedDateKey, 1))
                        }
                        className="px-2.5 py-1 text-xs text-slate-300 bg-[#0B1120] border border-slate-700 hover:border-cyan-400/40 rounded cursor-pointer"
                      >
                        Ngày sau
                      </button>
                    </div>
                  )}
                </div>

                {calendarInspectorTab === 'day' ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                          {focusedDateKey === todayKey
                            ? 'Lịch hôm nay'
                            : 'Ngày đang xem'}
                          {focusedWeek ? ` · Tuần ${focusedWeek} (HK2 2026–2027)` : ''}
                        </p>
                        <h3 className="font-heading text-lg font-bold text-slate-50 capitalize">
                          {formatViDate(parseDateKey(focusedDateKey))}
                        </h3>
                      </div>

                      {selectedDateKey && selectedDateKey !== todayKey && (
                        <button
                          type="button"
                          onClick={jumpToToday}
                          className="text-xs text-cyan-400 hover:underline cursor-pointer"
                        >
                          Về hôm nay
                        </button>
                      )}
                    </div>

                    {holidayMap.get(focusedDateKey) && (
                      <div className="p-3.5 rounded-lg bg-amber-400/10 border border-amber-400/35 text-xs sm:text-sm text-amber-200 font-medium">
                        {holidayMap.get(focusedDateKey)} — Không có lịch học chính khóa trong bảng HK2.
                      </div>
                    )}

                    {/* Class-separated schedule cards */}
                    {focusedDayEventsByClass.length > 0 ? (
                      <div className="space-y-3">
                        {focusedDayEventsByClass.map((group) => {
                          const meta = SCHEDULE_CLASS_META[group.classCode];
                          const style = CLASS_BADGE_STYLES[group.classCode];
                          return (
                            <div
                              key={group.classCode}
                              className={`rounded-lg bg-[#0B1120] border ${style.border} p-3.5 space-y-2.5`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-md ${style.badge}`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                                  {meta.label}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  {group.items.length} buổi trong ngày
                                </span>
                              </div>

                              <div className="space-y-2">
                                {group.items.map((item, idx) => (
                                  <div
                                    key={`${item.classCode}-${item.session}-${idx}`}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 rounded-md bg-[#0E1525] border border-slate-800/90"
                                  >
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-mono font-semibold text-cyan-300">
                                          Ca {item.session}
                                        </span>
                                        <span className="text-slate-600">·</span>
                                        <span className="text-sm font-bold text-slate-100">
                                          {item.subject}
                                        </span>
                                      </div>
                                      {item.detail && (
                                        <p className="text-xs text-slate-400 mt-0.5">
                                          {item.detail}
                                        </p>
                                      )}
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 text-[11px] font-medium border rounded whitespace-nowrap self-start sm:self-center ${KIND_BADGE[item.kind].style}`}
                                    >
                                      {KIND_BADGE[item.kind].label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      !holidayMap.get(focusedDateKey) && (
                        <div className="p-4 rounded-lg bg-[#0B1120] border border-slate-800 text-xs sm:text-sm text-slate-400">
                          Không ghi nhận buổi học/thi nào trong file TKB HK2 cho{' '}
                          <strong className="text-slate-200">
                            {classFilter === 'ALL'
                              ? '4 lớp'
                              : SCHEDULE_CLASS_META[classFilter].shortLabel}
                          </strong>{' '}
                          vào ngày này.
                        </div>
                      )
                    )}

                    {/* Deadlines & App updates matching this date */}
                    {(focusedDayDeadlines.length > 0 || focusedDayUpdates.length > 0) && (
                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <p className="text-[11px] uppercase tracking-widest text-amber-300 font-semibold">
                          Deadline &amp; Cập nhật trùng ngày
                        </p>
                        {focusedDayDeadlines.map((dl) => (
                          <div
                            key={dl.id}
                            className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/30 text-xs text-slate-200"
                          >
                            <span className="font-semibold text-amber-300">Deadline:</span>{' '}
                            {dl.title} ({dl.dueLabel})
                          </div>
                        ))}
                        {focusedDayUpdates.map((upd) => (
                          <div
                            key={upd.id}
                            className="p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-xs text-slate-200"
                          >
                            <span className="font-semibold text-emerald-300">Cập nhật:</span>{' '}
                            {upd.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {upcomingSpecialEvents.length > 0 ? (
                      upcomingSpecialEvents.map((ev, idx) => {
                        const style = CLASS_BADGE_STYLES[ev.classCode];
                        return (
                          <button
                            key={`${ev.date}-${ev.classCode}-${idx}`}
                            type="button"
                            onClick={() => {
                              selectDateAndSyncMonth(ev.date);
                              setCalendarInspectorTab('day');
                            }}
                            className="w-full text-left p-3 rounded-lg bg-[#0B1120] border border-slate-800 hover:border-cyan-400/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 text-[11px] font-semibold border rounded ${style.badge}`}
                                >
                                  {SCHEDULE_CLASS_META[ev.classCode].shortLabel}
                                </span>
                                <span className="text-xs font-mono text-slate-300">
                                  {ev.date.split('-').reverse().join('/')} · Tuần {ev.week} · Ca {ev.session}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-slate-100">
                                {ev.subject}{' '}
                                <span className="font-normal text-xs text-slate-400">
                                  ({ev.detail})
                                </span>
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[11px] font-medium border rounded whitespace-nowrap self-start sm:self-center ${KIND_BADGE[ev.kind].style}`}
                            >
                              {KIND_BADGE[ev.kind].label}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 p-4">
                        Không có lịch thi/bù sắp tới cho bộ lọc lớp hiện tại.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Active Deadlines Section (Prioritized before App Updates) */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-cyan-400/55 bg-gradient-to-b from-[#12203A] via-[#0E1629] to-[#0A101E] p-5 sm:p-7 shadow-[0_0_50px_-14px_rgba(34,211,238,0.32)] space-y-5">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-300"
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider font-semibold text-cyan-300 bg-cyan-400/15 border border-cyan-400/40 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                Ưu tiên theo dõi
              </span>
              <span className="text-xs font-mono text-amber-300 font-medium">
                {filteredDeadlines.length} mốc đang hiển thị
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Nhiệm vụ &amp; Mốc thời gian còn hiệu lực
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#080D1A] border border-cyan-500/30 rounded-lg overflow-x-auto w-fit max-w-full shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  category === cat
                    ? 'bg-cyan-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#090F1E]/95 border border-cyan-500/30 rounded-xl divide-y divide-slate-800/90 overflow-hidden shadow-inner">
          {filteredDeadlines.length > 0 ? (
            filteredDeadlines.map((task) => {
              const isDone = completedIds.includes(task.id);
              const isOpen = expandedDeadlineIds.includes(task.id);
              const daysLeft = getCalendarDaysRemaining(task.expiresAt, now);
              const isUrgent = !isDone && daysLeft <= 3;

              return (
                <div
                  key={task.id}
                  className={`border-l-4 transition-colors ${
                    isDone
                      ? 'border-l-emerald-500/40 bg-[#070B14]/75 opacity-80'
                      : isUrgent
                        ? 'border-l-amber-400 bg-amber-400/[0.04] hover:bg-[#131F38]/80'
                        : 'border-l-cyan-400 hover:bg-[#131F38]/75'
                  }`}
                >
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleComplete(task.id)}
                        aria-label={
                          isDone
                            ? `Bỏ đánh dấu ${task.title}`
                            : `Đánh dấu đã xong ${task.title}`
                        }
                        className="mt-1 text-cyan-400 hover:scale-105 transition-transform shrink-0 cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-cyan-400/75" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDeadlineExpand(task.id)}
                        className="min-w-0 flex-1 text-left cursor-pointer group"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-cyan-300">
                            {task.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-amber-300 font-semibold">
                            {task.dueLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`px-2 py-0.5 rounded border font-mono font-semibold ${
                              isUrgent
                                ? 'bg-amber-400/15 text-amber-200 border-amber-400/40'
                                : 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30'
                            }`}
                          >
                            {daysLeft <= 0 ? 'Hôm nay' : `Còn ${daysLeft} ngày`}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-300">
                            {isDone ? 'Đã hoàn thành' : task.statusLabel}
                          </span>
                        </div>
                        <h3
                          className={`mt-2 text-base sm:text-lg font-bold group-hover:text-cyan-300 transition-colors ${
                            isDone ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-200 leading-relaxed">
                          {task.summary}
                        </p>
                        <p className="mt-1.5 text-xs text-slate-400">
                          Đối tượng: {task.audience}
                        </p>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pl-9 md:pl-0 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleDeadlineExpand(task.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-100 bg-[#0D162B] border border-slate-600 hover:border-cyan-400/60 hover:text-cyan-300 rounded-md whitespace-nowrap cursor-pointer"
                      >
                        <span>{isOpen ? 'Thu gọn nội dung' : 'Xem nội dung đầy đủ'}</span>
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {task.externalUrl && (
                        <a
                          href={task.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md whitespace-nowrap shadow-sm"
                        >
                          <span>Mở cổng / Văn bản</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Expanded Full Content Panel */}
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-3 pl-14 bg-[#070B14]/85 border-t border-slate-800/80 space-y-4">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                          Nội dung chi tiết từ The D25B Times
                        </p>
                        <ul className="space-y-2 text-sm text-slate-300 leading-relaxed list-disc pl-5">
                          {task.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>

                      {(task.links?.length || task.actionTab) && (
                        <div className="pt-2 flex flex-wrap items-center gap-2.5">
                          {task.links?.map((link) => (
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
                          {task.actionTab && (
                            <button
                              type="button"
                              onClick={() =>
                                onNavigate(task.actionTab!.section, {
                                  handbookTab: task.actionTab!.handbookTab,
                                  courseId: task.actionTab!.courseId,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#131C31] border border-slate-700 hover:border-cyan-400/50 rounded-md cursor-pointer"
                            >
                              {task.actionTab.label}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-medium text-slate-200">
                Không có deadline nào còn hiệu lực cho bộ lọc hiện tại.
              </p>
              <p className="text-xs text-slate-400">
                Các thông báo &amp; mốc đã quá hạn đều được lưu trữ đầy đủ trong mục Cẩm nang &amp; Học tập.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 7-Day App Updates Feed */}
      <section>
        <div>
          {activeUpdates.length > 0 ? (
            <div className="bg-[#0E1525] border border-cyan-500/30 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 bg-[#0B1120] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-heading text-base sm:text-lg font-bold text-slate-50">
                    Cập nhật mới trên The D25B Times
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 rounded">
                  Hiển thị tự động 7 ngày từ ngày sửa đổi
                </span>
              </div>

              <div className="divide-y divide-slate-800">
                {activeUpdates.map((upd) => {
                  const isOpen = expandedUpdateIds.includes(upd.id);
                  const modDate = new Date(upd.updatedAt).toLocaleDateString('vi-VN');
                  return (
                    <div key={upd.id} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => toggleUpdateExpand(upd.id)}
                        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-[#131C31]/70 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-emerald-300">
                              {upd.category}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="font-mono text-slate-400">
                              Cập nhật {modDate}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="font-mono text-cyan-300">
                              Còn {upd.daysRemaining}/7 ngày
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-100">
                            {upd.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                            {upd.summary}
                          </p>
                        </div>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-cyan-400 shrink-0">
                          <span>{isOpen ? 'Thu gọn' : 'Chi tiết'}</span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 bg-[#0B1120]/70 border-t border-slate-800/70 space-y-3">
                          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed list-disc pl-5">
                            {upd.details.map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>

                          {(upd.target || upd.externalUrl) && (
                            <div className="pt-1 flex flex-wrap gap-2">
                              {upd.target && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (upd.target!.section === 'deadline') {
                                      setIsCalendarExpanded(true);
                                      return;
                                    }
                                    onNavigate(upd.target!.section, {
                                      handbookTab: upd.target!.handbookTab,
                                      courseId: upd.target!.courseId,
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md cursor-pointer"
                                >
                                  <span>{upd.target.label}</span>
                                </button>
                              )}
                              {upd.externalUrl && (
                                <a
                                  href={upd.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-400/10 border border-cyan-500/30 hover:bg-cyan-400/20 rounded-md"
                                >
                                  <span>Xem thay đổi trên GitHub</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-6 text-sm text-slate-400">
              Không có thông báo cập nhật hệ thống mới nào trong 7 ngày gần nhất.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
