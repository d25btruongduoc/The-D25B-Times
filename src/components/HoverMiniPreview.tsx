import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Eye, Maximize2, X } from 'lucide-react';
import { getPreviewInfo } from '../utils/previewUtils';

interface HoverPreviewCardProps {
  url: string;
  label: string;
  folderMode?: 'list' | 'grid';
  delayMs?: number;
  disabled?: boolean;
  onExpandPreview?: (url: string) => void;
  className?: string;
  children: ReactNode;
}

interface PopoverCoords {
  top: number;
  left: number;
  width: number;
}

const POPOVER_HEIGHT = 276;

export function HoverPreviewCard({
  url,
  label,
  folderMode = 'list',
  delayMs = 2000,
  disabled = false,
  onExpandPreview,
  className = '',
  children,
}: HoverPreviewCardProps) {
  const previewInfo = getPreviewInfo(url, folderMode);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const [isCharging, setIsCharging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popWidth = Math.min(400, vw - 24);

    let left = rect.left;
    if (left + popWidth > vw - 12) {
      left = Math.max(12, vw - popWidth - 12);
    }

    const spaceBelow = vh - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    let top = rect.bottom + 8;
    if (spaceBelow < POPOVER_HEIGHT && spaceAbove > spaceBelow) {
      top = Math.max(12, rect.top - POPOVER_HEIGHT - 8);
    } else if (top + POPOVER_HEIGHT > vh - 12) {
      top = Math.max(12, vh - POPOVER_HEIGHT - 12);
    }

    setCoords({ top, left, width: popWidth });
  }, []);

  const handleMouseEnter = () => {
    if (disabled || !previewInfo) return;
    if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (isOpen) return;

    setIsCharging(true);
    openTimerRef.current = window.setTimeout(() => {
      updatePosition();
      setIsOpen(true);
      setIsCharging(false);
    }, delayMs);
  };

  const scheduleClose = () => {
    setIsCharging(false);
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 240);
  };

  const handlePopoverEnter = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleCloseNow = () => {
    clearTimers();
    setIsCharging(false);
    setIsOpen(false);
  };

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseNow();
    };
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={scheduleClose}
      onClick={() => {
        if (openTimerRef.current !== null) {
          window.clearTimeout(openTimerRef.current);
          openTimerRef.current = null;
        }
        setIsCharging(false);
        setIsOpen(false);
      }}
      className={`relative ${className}`}
    >
      {children}

      {previewInfo && !disabled && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-2 right-2 bottom-0 h-[2px] rounded-full overflow-hidden"
        >
          <span
            className={`block h-full bg-cyan-400 transition-[width] ease-linear ${
              isCharging ? 'w-full duration-[2000ms]' : 'w-0 duration-150'
            }`}
          />
        </span>
      )}

      {isOpen &&
        previewInfo &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onMouseEnter={handlePopoverEnter}
            onMouseLeave={scheduleClose}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            role="dialog"
            aria-label={`Xem trước nhanh ${label}`}
            className="fixed z-50 rounded-xl border border-cyan-400/60 bg-[#0B1120] shadow-[0_18px_48px_rgba(0,0,0,0.72)] overflow-hidden"
          >
            <div className="px-3 py-2 bg-[#070B14] border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-xs font-medium text-slate-100 truncate">
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onExpandPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseNow();
                      onExpandPreview(url);
                    }}
                    title="Mở ở khung lớn"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 hover:text-cyan-200 bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Mở lớn</span>
                  </button>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở tab mới"
                  className="p-1 text-slate-400 hover:text-cyan-300 bg-[#0E1525] border border-slate-800 rounded"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={handleCloseNow}
                  aria-label="Đóng bản xem trước nhỏ"
                  className="p-1 text-slate-400 hover:text-slate-100 bg-[#0E1525] border border-slate-800 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div
              className={`w-full h-[232px] ${
                previewInfo.isVideo ? 'bg-[#070B14]' : 'bg-slate-100'
              }`}
            >
              <iframe
                src={previewInfo.embedUrl}
                title={`Xem trước nhanh ${label}`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
