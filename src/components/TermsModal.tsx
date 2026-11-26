import { useEffect } from 'react';
import { CheckCircle2, FileText, ShieldCheck, X } from 'lucide-react';
import { ADMIN_EMAIL } from '../services/memberService';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptTerms?: () => void;
}

export function TermsModal({
  isOpen,
  onClose,
  onAcceptTerms,
}: TermsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-service-title"
    >
      <div className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto bg-[#0E1525] border border-cyan-500/35 rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-[#0B1120]/95 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="terms-service-title"
                className="font-heading text-lg font-bold text-slate-50"
              >
                Điều khoản dịch vụ
              </h2>
              <p className="text-xs text-slate-400">
                The D25B Times · Quy định sử dụng nền tảng thông tin lớp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng điều khoản dịch vụ"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              1. Giới thiệu &amp; Mục đích
            </h3>
            <p>
              The D25B Times là cổng thông tin học tập, lịch học, deadline và sinh hoạt nội bộ của lớp D25B – Trường Dược, Đại học Y Dược TP. Hồ Chí Minh. Nền tảng được xây dựng nhằm hỗ trợ sinh viên tra cứu học liệu và đồng bộ tiến độ học tập.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              2. Tài khoản thành viên &amp; Bảo mật
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập tài khoản cá nhân của mình.
              </li>
              <li>
                Nghiêm cấm sử dụng nền tảng để phát tán thông tin sai lệch, mã độc hoặc xâm phạm quyền lợi của các thành viên khác.
              </li>
            </ul>
          </section>

          <section className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              3. Quyền hạn quản trị &amp; Miễn trừ trách nhiệm
            </h3>
            <p>
              Ban cán sự và quản trị viên lớp có quyền cập nhật, chỉnh sửa lịch học, deadline và thông báo theo văn bản chính thức của Khoa / Trường. Chúng tôi nỗ lực đảm bảo độ chính xác cao nhất nhưng không chịu trách nhiệm pháp lý cho các thiệt hại phát sinh từ việc sử dụng thông tin tham khảo trên trang web.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              4. Liên hệ hỗ trợ
            </h3>
            <p>
              Mọi thắc mắc về điều khoản dịch vụ hoặc đóng góp tài liệu xin liên hệ lớp trưởng hoặc qua email quản trị:{' '}
              <span className="font-mono text-cyan-300">{ADMIN_EMAIL}</span>.
            </p>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#131C31] border border-slate-700 text-xs font-medium text-slate-200 hover:border-slate-500 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            {onAcceptTerms && (
              <button
                type="button"
                onClick={() => {
                  onAcceptTerms();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tôi đồng ý &amp; Tiếp tục</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
