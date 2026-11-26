import { useState } from 'react';
import { Cloud, Menu, User, X } from 'lucide-react';
import { NavSection } from '../data/d25bData';

interface HeaderProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  memberLabel?: string | null;
  isMemberSignedIn?: boolean;
  onOpenMemberModal: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'study', label: 'Học tập' },
  { id: 'deadline', label: 'Deadline' },
  { id: 'handbook', label: 'Cẩm nang' },
  { id: 'library', label: 'Thư viện' },
];

export function Header({
  activeSection,
  onNavigate,
  memberLabel,
  isMemberSignedIn,
  onOpenMemberModal,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id: NavSection) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070B14]/90 backdrop-blur-md border-b border-slate-800/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
        >
          The D25B Times
        </button>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400"
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

        {/* Zone 3: Member / Backup Button + Mobile menu trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenMemberModal}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              isMemberSignedIn
                ? 'bg-cyan-400/12 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/20'
                : 'bg-[#0E1525] border-slate-700 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300'
            }`}
          >
            {isMemberSignedIn ? (
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="max-w-[130px] truncate">
              {memberLabel || 'Thành viên'}
            </span>
          </button>

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

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenMemberModal();
              }}
              className="mt-2 w-full inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#131C31] border border-slate-700 text-sm font-medium text-cyan-300"
            >
              {isMemberSignedIn ? (
                <Cloud className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span>{memberLabel ? `Tài khoản: ${memberLabel}` : 'Thành viên & Sao lưu'}</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
