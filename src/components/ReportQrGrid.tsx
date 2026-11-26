import { useEffect, useState } from 'react';
import { ExternalLink, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';
import { ResourceLink } from '../data/d25bData';

interface ReportQrGridProps {
  links: ResourceLink[];
  title?: string;
  subtitle?: string;
}

function extractInstructorName(label: string): string {
  const parts = label.split(/\s*[–-]\s*/);
  if (parts.length >= 2) {
    return parts.slice(1).join(' – ').trim();
  }
  return label.trim();
}

export function ReportQrGrid({
  links,
  title = 'Danh mục các link nộp bài báo cáo THHPT1 lớp D25',
  subtitle = 'Quét mã QR bằng điện thoại hoặc bấm nút bên dưới để mở Form nộp bài trong vòng 24 giờ',
}: ReportQrGridProps) {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [zoomedItem, setZoomedItem] = useState<{
    instructor: string;
    url: string;
    qrSrc: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function generateAll() {
      const entries = await Promise.all(
        links.map(async (link) => {
          try {
            const dataUrl = await QRCode.toDataURL(link.url, {
              width: 240,
              margin: 1,
              errorCorrectionLevel: 'M',
              color: {
                dark: '#0f172a',
                light: '#ffffff',
              },
            });
            return [link.url, dataUrl] as const;
          } catch {
            return [link.url, ''] as const;
          }
        })
      );

      if (!cancelled) {
        setQrMap(Object.fromEntries(entries));
      }
    }

    void generateAll();
    return () => {
      cancelled = true;
    };
  }, [links]);

  useEffect(() => {
    if (!zoomedItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedItem(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomedItem]);

  if (links.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-cyan-400 shrink-0" />
          <h3 className="font-heading text-base sm:text-lg font-bold text-slate-50">
            {title}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">{subtitle}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {links.map((link) => {
          const instructor = extractInstructorName(link.label);
          const qrSrc = qrMap[link.url];

          return (
            <div key={link.url + link.label} className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() =>
                  qrSrc &&
                  setZoomedItem({
                    instructor,
                    url: link.url,
                    qrSrc,
                  })
                }
                title={`Phóng to mã QR – ${instructor}`}
                className="group relative w-full rounded-xl p-3.5 bg-gradient-to-br from-[#23c4b3] via-[#1ea4e0] to-[#1e7ee6] text-white shadow-md hover:shadow-[0_10px_28px_rgba(30,164,224,0.35)] transition-all flex flex-col items-center justify-between gap-3 cursor-pointer text-center overflow-hidden"
              >
                <div className="space-y-0.5 px-1">
                  <p className="text-[11px] font-bold leading-snug tracking-tight drop-shadow-sm">
                    Nộp bài báo cáo TH HPT1 lớp D25
                  </p>
                  <p className="text-xs font-extrabold leading-snug drop-shadow-sm">
                    – {instructor}
                  </p>
                </div>

                <div className="w-36 h-36 sm:w-40 sm:h-40 bg-white rounded-xl p-2 shadow-sm flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                  {qrSrc ? (
                    <img
                      src={qrSrc}
                      alt={`Mã QR nộp báo cáo THHPT1 – ${instructor}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">
                      Đang tạo QR...
                    </span>
                  )}
                </div>
              </button>

              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-300 hover:text-slate-950 bg-[#0B1120] hover:bg-cyan-400 border border-cyan-500/45 hover:border-cyan-400 rounded-lg transition-colors text-center"
              >
                <span className="truncate">{instructor} - Link</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          );
        })}
      </div>

      {zoomedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomedItem(null)}
        >
          <div
            role="dialog"
            aria-label={`Mã QR nộp báo cáo THHPT1 – ${zoomedItem.instructor}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#0B1120] border border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                  Nộp báo cáo THHPT1 · D25
                </p>
                <h4 className="font-heading text-lg font-bold text-slate-50 truncate">
                  {zoomedItem.instructor}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setZoomedItem(null)}
                aria-label="Đóng mã QR"
                className="p-1.5 text-slate-400 hover:text-slate-100 bg-[#0E1525] border border-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl p-5 bg-gradient-to-br from-[#23c4b3] via-[#1ea4e0] to-[#1e7ee6] flex flex-col items-center gap-3">
              <p className="text-xs font-bold text-white text-center">
                Nộp bài báo cáo TH HPT1 lớp D25 – {zoomedItem.instructor}
              </p>
              <div className="w-56 h-56 bg-white rounded-xl p-3 shadow-md flex items-center justify-center">
                <img
                  src={zoomedItem.qrSrc}
                  alt={`Mã QR nộp báo cáo THHPT1 – ${zoomedItem.instructor}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <a
              href={zoomedItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              <span>Mở Form nộp bài ({zoomedItem.instructor})</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
