import { useEffect } from 'react';
import { CheckCircle2, Lock, ShieldCheck, X } from 'lucide-react';
import { ADMIN_EMAIL } from '../services/memberService';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptPolicy?: () => void;
}

export function PrivacyPolicyModal({
  isOpen,
  onClose,
  onAcceptPolicy,
}: PrivacyPolicyModalProps) {
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
      aria-labelledby="privacy-policy-title"
    >
      <div className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto bg-[#0E1525] border border-cyan-500/35 rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-[#0B1120]/95 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="privacy-policy-title"
                className="font-heading text-lg font-bold text-slate-50"
              >
                Chính sách quyền riêng tư
              </h2>
              <p className="text-xs text-slate-400">
                The D25B Times · Cập nhật áp dụng cho tài khoản thành viên
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chính sách quyền riêng tư"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              1. Dữ liệu KHÔNG thu thập
            </h3>
            <p>
              The D25B Times <strong>không thu thập</strong> Họ và tên, Lớp học hay Mã số sinh viên (MSSV) trong quá trình đăng ký tài khoản hoặc sao lưu hoạt động.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              2. Dữ liệu được lưu trữ
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                <strong>Thông tin tài khoản:</strong> Địa chỉ email đăng nhập, mã định danh người dùng và phương thức xác thực (Email/Mật khẩu, Google hoặc Facebook).
              </li>
              <li>
                <strong>Dữ liệu sao lưu hoạt động:</strong> Các mốc deadline bạn đã đánh dấu hoàn thành, các học phần đã đánh dấu lưu và bộ lọc lịch HK2 bạn đang chọn.
              </li>
            </ul>
          </section>

          <section className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              3. Mục đích sử dụng &amp; Đồng bộ quản trị
            </h3>
            <p>
              Dữ liệu chỉ được dùng để đồng bộ và khôi phục tiến độ học tập của chính bạn giữa các thiết bị. Khi có xác nhận đồng ý của bạn, quản trị viên cổng thông tin (
              <span className="font-mono text-cyan-300">{ADMIN_EMAIL}</span>) có thể xuất danh sách email thành viên và thống kê số lượng mục đã sao lưu sang Google Sheets để phục vụ quản lý vận hành.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>4. Bảo mật &amp; Kiểm soát dữ liệu</span>
            </h3>
            <p>
              Dữ liệu của mỗi tài khoản được cô lập bằng quy tắc bảo mật Firebase và chỉ được đồng bộ sau khi địa chỉ email được xác minh. Thành viên khác không thể xem email hay tiến độ của bạn.
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
            {onAcceptPolicy && (
              <button
                type="button"
                onClick={() => {
                  onAcceptPolicy();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tôi đồng ý &amp; Quay lại</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
