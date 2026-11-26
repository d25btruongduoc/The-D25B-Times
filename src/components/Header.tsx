import { useState } from 'react';
import { Cloud, Menu, User, X } from 'lucide-react';
import { NavSection } from '../data/d25bData';

interface HeaderProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  memberLabel?: string | null;
  memberAvatar?: string | null;
  isMemberSignedIn?: boolean;
  onOpenMemberModal: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'study', label: 'Học tập' },
  { id: 'deadline', label: 'Deadline' },
  { id: 'handbook', label: 'Cẩm nang' },
  { id: 'library', label: 'Thư viện' },
  { id: 'forum', label: 'Diễn đàn' },
];

export function Header({
  activeSection,
  onNavigate,
  memberLabel,
  memberAvatar,
  isMemberSignedIn,
  onOpenMemberModal,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id: NavSection) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const displayName = memberLabel || 'Thành viên';
  const isProfileActive = activeSection === 'profile';

  return (
    <header className="sticky top-0 z-40 bg-[#070B14]/90 backdrop-blur-md border-b border-slate-800/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Logo & Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="group inline-flex items-center gap-2.5 text-left shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
        >
          <img
            src="/assets/d25b-logo-nobg.png"
            alt="Logo D25B"
            className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 object-contain rounded-full"
          />
          <span className="flex flex-col items-start min-w-0 leading-tight">
            <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-slate-50 group-hover:text-cyan-400 transition-colors whitespace-nowrap leading-tight">
              The D25B Times
            </span>
            <span className="text-[10px] sm:text-[11px] font-normal tracking-normal text-slate-400 whitespace-nowrap leading-tight">
              Nghiên cứu và phát triển bởi DaraNox
            </span>
          </span>
        </button>

        {/* Zone 2: Concise single-line text nav links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm ${
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 -bottom-[21px] h-[2px] bg-cyan-400 transition-opacity duration-150 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Personal Home Corner Widget (when signed in) + Backup / Sign-in button + Mobile trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {isMemberSignedIn ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelect('profile')}
                title="Mở Trang chủ cá nhân"
                className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isProfileActive
                    ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#0E1525] border-cyan-400/35 text-slate-100 hover:border-cyan-400 hover:bg-[#131C31]'
                }`}
              >
                {memberAvatar ? (
                  <img
                    src={memberAvatar}
                    alt={displayName}
                    className="w-6 h-6 rounded-full object-cover border border-slate-700 bg-slate-900 shrink-0"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="max-w-[115px] truncate">{displayName}</span>
              </button>

              <button
                type="button"
                onClick={onOpenMemberModal}
                title="Tài khoản, Sao lưu Cloud & Quản trị"
                aria-label="Mở cài đặt tài khoản và sao lưu"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-700 bg-[#0E1525] text-cyan-300 hover:border-cyan-400/60 hover:bg-[#131C31] transition-colors cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenMemberModal}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-[#0E1525] border-slate-700 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Thành viên / Đăng nhập</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-800 bg-[#0E1525] text-slate-100 hover:border-cyan-400/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B1120] px-4 py-3">
          <nav aria-label="Menu di động" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-cyan-400/10 text-cyan-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {isMemberSignedIn ? (
              <div className="mt-2 grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelect('profile')}
                  className={`w-full inline-flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium ${
                    isProfileActive
                      ? 'bg-cyan-400/15 border-cyan-400 text-cyan-200'
                      : 'bg-[#131C31] border-slate-700 text-slate-100'
                  }`}
                >
                  {memberAvatar ? (
                    <img
                      src={memberAvatar}
                      alt={displayName}
                      className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <User className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <span className="truncate">Trang chủ cá nhân: {displayName}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenMemberModal();
                  }}
                  className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0E1525] border border-slate-800 text-xs font-medium text-cyan-300"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Cài đặt tài khoản &amp; Sao lưu Cloud</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenMemberModal();
                }}
                className="mt-2 w-full inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#131C31] border border-slate-700 text-sm font-medium text-cyan-300"
              >
                <User className="w-4 h-4" />
                <span>Thành viên / Đăng nhập</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

