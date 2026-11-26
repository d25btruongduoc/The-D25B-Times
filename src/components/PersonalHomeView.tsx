import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Cloud,
  CloudDownload,
  CloudUpload,
  ExternalLink,
  HardDrive,
  ImagePlus,
  MessageSquare,
  Palette,
  Save,
  Settings,
  Sparkles,
  UserCircle2,
} from 'lucide-react';
import { COURSES, DEADLINES, NavSection } from '../data/d25bData';
import {
  authorizeGoogleDriveToken,
  getCachedDriveAccessToken,
} from '../firebase';
import {
  DriveAuthExpiredError,
  restoreBackupFromGoogleDrive,
  saveBackupToGoogleDrive,
} from '../services/driveBackupService';
import {
  detectAuthProviderId,
  getMemberDisplayLabel,
  MemberProfile,
  PersonalAccentColor,
  PreferredScheduleClass,
  saveMemberProfile,
} from '../services/memberService';

interface PersonalHomeViewProps {
  user: User | null;
  profile: MemberProfile | null;
  onProfileUpdated: (profile: MemberProfile | null) => void;
  consentAccepted: boolean;
  onChangeConsent: (accepted: boolean) => void;
  onOpenPrivacyPolicy: () => void;
  onOpenMemberModal: () => void;
  completedDeadlineIds: string[];
  bookmarkedCourseIds: string[];
  preferredClass: PreferredScheduleClass;
  onRestoreActivity: (data: {
    completedDeadlineIds: string[];
    bookmarkedCourseIds: string[];
    preferredClass: PreferredScheduleClass;
  }) => void;
  onNavigate: (
    section: NavSection,
    options?: { courseId?: string }
  ) => void;
}

const ACCENT_THEMES: Record<
  PersonalAccentColor,
  { label: string; ring: string; badge: string; gradient: string; dot: string }
> = {
  cyan: {
    label: 'Xanh Cyan',
    ring: 'border-cyan-400/45',
    badge: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/35',
    gradient: 'from-cyan-500/20 via-[#0E1525] to-[#0B1120]',
    dot: 'bg-cyan-400',
  },
  emerald: {
    label: 'Ngọc Lục Bảo',
    ring: 'border-emerald-400/45',
    badge: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/35',
    gradient: 'from-emerald-500/20 via-[#0E1525] to-[#0B1120]',
    dot: 'bg-emerald-400',
  },
  violet: {
    label: 'Tím Indigo',
    ring: 'border-violet-400/45',
    badge: 'bg-violet-400/15 text-violet-300 border-violet-400/35',
    gradient: 'from-violet-500/20 via-[#0E1525] to-[#0B1120]',
    dot: 'bg-violet-400',
  },
  amber: {
    label: 'Vàng Hổ Phách',
    ring: 'border-amber-400/45',
    badge: 'bg-amber-400/15 text-amber-300 border-amber-400/35',
    gradient: 'from-amber-500/20 via-[#0E1525] to-[#0B1120]',
    dot: 'bg-amber-400',
  },
};

const AVATAR_PRESETS = [
  'https://api.dicebear.com/9.x/shapes/svg?seed=D25-Molecule',
  'https://api.dicebear.com/9.x/shapes/svg?seed=D25-Pharmacy',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=D25-Lab',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=D25-Student',
];

function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Tệp không phải hình ảnh hợp lệ.'));
      img.onload = () => {
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Trình duyệt không hỗ trợ xử lý ảnh.'));
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        if (dataUrl.length > 60000) {
          resolve(canvas.toDataURL('image/jpeg', 0.55));
        } else {
          resolve(dataUrl);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function PersonalHomeView({
  user,
  profile,
  onProfileUpdated,
  consentAccepted,
  onChangeConsent,
  onOpenPrivacyPolicy,
  onOpenMemberModal,
  completedDeadlineIds,
  bookmarkedCourseIds,
  preferredClass,
  onRestoreActivity,
  onNavigate,
}: PersonalHomeViewProps) {
  const [customName, setCustomName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [accentColor, setAccentColor] = useState<PersonalAccentColor>('cyan');
  const [autoDriveBackup, setAutoDriveBackup] = useState(false);

  const [busy, setBusy] = useState(false);
  const [driveBusy, setDriveBusy] = useState(false);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setCustomName(profile.customName || '');
      setAvatarUrl(profile.avatarUrl || '');
      setBio(profile.bio || '');
      setAccentColor(profile.accentColor || 'cyan');
      setAutoDriveBackup(Boolean(profile.autoDriveBackup));
    } else if (user) {
      setCustomName(user.displayName || user.email?.split('@')[0] || '');
      setAvatarUrl(user.photoURL || '');
    }
  }, [profile, user]);

  const bookmarkedCourses = useMemo(
    () => COURSES.filter((c) => bookmarkedCourseIds.includes(c.id)),
    [bookmarkedCourseIds]
  );

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <UserCircle2 className="w-12 h-12 text-cyan-400 mx-auto" />
          <h1 className="font-heading text-2xl font-bold text-slate-50">
            Trang chủ cá nhân của bạn
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Đăng nhập bằng Google hoặc Email để mở không gian cá nhân, tùy chỉnh tên hiển thị, hình đại diện, theo dõi học phần đã lưu và sao lưu tự động lên Cloud hoặc Google Drive.
          </p>
          <button
            type="button"
            onClick={onOpenMemberModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold transition-colors cursor-pointer"
          >
            <span>Đăng nhập / Đăng ký thành viên</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const theme = ACCENT_THEMES[accentColor] || ACCENT_THEMES.cyan;
  const effectiveName =
    customName.trim() || getMemberDisplayLabel(profile, user.email, user.displayName);

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      const compressed = await compressImageToDataUrl(file);
      setAvatarUrl(compressed);
      setStatusMsg('Đã nạp ảnh đại diện mới. Hãy bấm "Lưu trang cá nhân" để cập nhật.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể xử lý ảnh đại diện.');
    }
  };

  const handleSavePersonalHome = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    if (!user.emailVerified) {
      setErrorMsg('Vui lòng xác minh email của bạn trước khi lưu lên đám mây.');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('Vui lòng xác nhận đồng ý theo Chính sách quyền riêng tư trước khi lưu.');
      return;
    }

    setBusy(true);
    try {
      const providerId = detectAuthProviderId(
        user.providerData.map((p) => p.providerId)
      );
      const saved = await saveMemberProfile({
        uid: user.uid,
        email: user.email || '',
        authProvider: providerId,
        consentAccepted: true,
        customName: customName.trim().slice(0, 60),
        avatarUrl: avatarUrl.trim().slice(0, 65000),
        bio: bio.trim().slice(0, 240),
        accentColor,
        autoDriveBackup,
        driveBackupFileId: profile?.driveBackupFileId || '',
        completedDeadlineIds,
        bookmarkedCourseIds,
        preferredClass,
      });
      onProfileUpdated(saved);
      setStatusMsg('Đã lưu tùy chỉnh Trang chủ cá nhân và đồng bộ dữ liệu lên Cloud.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Không thể lưu trang chủ cá nhân.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleBackupNowToDrive = async () => {
    if (!user.emailVerified) {
      setErrorMsg('Vui lòng xác minh email trước khi sao lưu.');
      return;
    }
    setErrorMsg(null);
    setStatusMsg(null);
    setDriveBusy(true);
    try {
      let token = getCachedDriveAccessToken();
      if (!token) {
        token = await authorizeGoogleDriveToken();
      }
      const payload = {
        version: 1 as const,
        backedUpAt: new Date().toISOString(),
        completedDeadlineIds,
        bookmarkedCourseIds,
        preferredClass,
        personalHome: {
          customName: effectiveName,
          bio: bio.trim(),
          accentColor,
        },
      };

      let result;
      try {
        result = await saveBackupToGoogleDrive(
          token,
          payload,
          profile?.driveBackupFileId
        );
      } catch (err) {
        if (err instanceof DriveAuthExpiredError) {
          token = await authorizeGoogleDriveToken();
          result = await saveBackupToGoogleDrive(
            token,
            payload,
            profile?.driveBackupFileId
          );
        } else {
          throw err;
        }
      }

      setDriveLink(result.webViewLink);
      if (consentAccepted) {
        const providerId = detectAuthProviderId(
          user.providerData.map((p) => p.providerId)
        );
        const saved = await saveMemberProfile({
          uid: user.uid,
          email: user.email || '',
          authProvider: providerId,
          consentAccepted: true,
          customName: customName.trim(),
          avatarUrl: avatarUrl.trim(),
          bio: bio.trim(),
          accentColor,
          autoDriveBackup: true,
          driveBackupFileId: result.fileId,
          completedDeadlineIds,
          bookmarkedCourseIds,
          preferredClass,
        });
        setAutoDriveBackup(true);
        onProfileUpdated(saved);
      }
      setStatusMsg('Đã sao lưu bản dữ liệu học tập lên Google Drive cá nhân của bạn!');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Không thể sao lưu lên Google Drive.'
      );
    } finally {
      setDriveBusy(false);
    }
  };

  const handleRestoreFromDrive = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    setDriveBusy(true);
    try {
      let token = getCachedDriveAccessToken();
      if (!token) {
        token = await authorizeGoogleDriveToken();
      }
      let backup;
      try {
        backup = await restoreBackupFromGoogleDrive(token, profile?.driveBackupFileId);
      } catch (err) {
        if (err instanceof DriveAuthExpiredError) {
          token = await authorizeGoogleDriveToken();
          backup = await restoreBackupFromGoogleDrive(token, profile?.driveBackupFileId);
        } else {
          throw err;
        }
      }

      onRestoreActivity({
        completedDeadlineIds: backup.completedDeadlineIds || [],
        bookmarkedCourseIds: backup.bookmarkedCourseIds || [],
        preferredClass: backup.preferredClass || 'ALL',
      });
      if (backup.personalHome) {
        setCustomName(backup.personalHome.customName || '');
        setBio(backup.personalHome.bio || '');
        setAccentColor(backup.personalHome.accentColor || 'cyan');
      }
      setStatusMsg('Đã khôi phục toàn bộ tiến độ và tùy chỉnh từ Google Drive của bạn!');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Không thể khôi phục từ Google Drive.'
      );
    } finally {
      setDriveBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Personal Banner Card */}
      <section
        className={`rounded-2xl border ${theme.ring} bg-gradient-to-br ${theme.gradient} p-6 sm:p-8 shadow-xl`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-700 bg-[#0B1120] flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={effectiveName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading text-2xl sm:text-3xl font-bold text-cyan-300">
                  {effectiveName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-semibold ${theme.badge}`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Trang chủ cá nhân</span>
                </span>
                <span className="text-xs font-mono text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-50 truncate">
                {effectiveName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {bio.trim() ||
                  'Chưa có mô tả cá nhân — bạn có thể tự do chỉnh sửa tên, hình đại diện và mục tiêu học tập bên dưới.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('forum')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#131C31] border border-slate-700 hover:border-cyan-400/50 text-xs sm:text-sm font-medium text-slate-100 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Vào Diễn đàn</span>
            </button>
            <button
              type="button"
              onClick={onOpenMemberModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#131C31] border border-slate-700 hover:border-cyan-400/50 text-xs sm:text-sm font-medium text-slate-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Tài khoản &amp; Quản trị</span>
            </button>
          </div>
        </div>
      </section>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs sm:text-sm text-rose-200">
          {errorMsg}
        </div>
      )}
      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs sm:text-sm text-emerald-200">
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Free Customization Form */}
        <form
          onSubmit={handleSavePersonalHome}
          className="lg:col-span-7 bg-[#0E1525] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <h2 className="font-heading text-lg font-bold text-slate-50 flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>Tùy chỉnh giao diện &amp; hồ sơ hiển thị</span>
            </h2>
            <span className="text-[11px] text-slate-400">Hiển thị ở góc trên &amp; Diễn đàn</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tên hiển thị / Biệt danh
              </label>
              <input
                type="text"
                maxLength={60}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nhập tên hoặc biệt danh bạn thích..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hình đại diện (dán link ảnh HTTPS, tải ảnh từ máy hoặc chọn mẫu)
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={avatarUrl.startsWith('data:') ? '(Ảnh tải lên từ thiết bị)' : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
                <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#131C31] border border-slate-700 hover:border-cyan-400/50 text-xs font-medium text-slate-200 cursor-pointer shrink-0">
                  <ImagePlus className="w-4 h-4 text-cyan-400" />
                  <span>Chọn ảnh từ máy</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400">Mẫu nhanh:</span>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      avatarUrl === preset
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={preset}
                      alt={`Avatar mẫu ${idx + 1}`}
                      className="w-full h-full object-cover bg-slate-900"
                    />
                  </button>
                ))}
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[11px] text-slate-400 hover:text-rose-300 underline cursor-pointer ml-1"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tiểu sử ngắn / Mục tiêu học tập
              </label>
              <textarea
                rows={3}
                maxLength={240}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ghi chú mục tiêu học kỳ, sở thích hoặc khẩu hiệu cá nhân..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Màu điểm nhấn thẻ cá nhân
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(ACCENT_THEMES) as PersonalAccentColor[]).map((key) => {
                  const t = ACCENT_THEMES[key];
                  const active = accentColor === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAccentColor(key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-800 border-cyan-400 text-slate-50'
                          : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!consentAccepted && (
              <div className="p-3 rounded-xl bg-[#0B1120] border border-cyan-500/30">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => onChangeConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-400"
                  />
                  <span className="text-xs text-slate-200 leading-relaxed">
                    Tôi đồng ý lưu email và sao lưu hoạt động theo{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenPrivacyPolicy();
                      }}
                      className="text-cyan-400 underline font-semibold cursor-pointer"
                    >
                      Chính sách quyền riêng tư
                    </button>
                    .
                  </span>
                </label>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{busy ? 'Đang lưu...' : 'Lưu trang cá nhân & Đồng bộ Cloud'}</span>
          </button>
        </form>

        {/* Right: Cloud & Google Drive Auto Backup + Bookmarked Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cloud + Google Drive Backup Panel */}
          <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading text-base font-bold text-slate-50 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span>Sao lưu Cloud &amp; Google Drive</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-300">
                {profile?.consentAccepted ? 'Auto-Cloud: BẬT' : 'Chưa bật'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Khi đã xác nhận đồng ý, tiến độ ({completedDeadlineIds.length}/{DEADLINES.length} deadline,{' '}
              {bookmarkedCourseIds.length} học phần) tự động lưu về tài khoản Cloud của bạn. Bạn cũng có thể sao lưu thêm bản JSON riêng vào Google Drive cá nhân.
            </p>

            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0B1120] border border-slate-800 cursor-pointer">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-100">
                  Tự động đồng bộ sang Google Drive của tôi
                </p>
                <p className="text-[11px] text-slate-400">
                  Cập nhật tệp The_D25B_Times_Backup.json khi có thay đổi
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoDriveBackup}
                onChange={(e) => setAutoDriveBackup(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-400 shrink-0"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={driveBusy}
                onClick={handleBackupNowToDrive}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-400/15 border border-emerald-400/40 hover:bg-emerald-400/25 text-emerald-200 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{driveBusy ? 'Đang xử lý...' : 'Sao lưu lên Drive'}</span>
              </button>

              <button
                type="button"
                disabled={driveBusy}
                onClick={handleRestoreFromDrive}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#131C31] border border-slate-700 hover:border-cyan-400/50 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CloudDownload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Khôi phục từ Drive</span>
              </button>
            </div>

            {driveLink && (
              <a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Mở tệp sao lưu trên Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Bookmarked Courses & Deadlines Quick Summary */}
          <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-slate-50 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <span>Học phần đã đánh dấu ({bookmarkedCourses.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('study')}
                className="text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                Kho học phần
              </button>
            </div>

            {bookmarkedCourses.length === 0 ? (
              <p className="text-xs text-slate-400 leading-relaxed">
                Bạn chưa đánh dấu học phần nào. Hãy bấm nút &ldquo;Đánh dấu&rdquo; trong Kho học phần để ghim môn đang học tại đây.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {bookmarkedCourses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onNavigate('study', { courseId: c.id })}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-[#0B1120] border border-slate-800 hover:border-cyan-400/50 text-left transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-100 truncate">
                        {c.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {c.shortCode} · {c.semester}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Đã hoàn thành {completedDeadlineIds.length} mốc deadline</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigate('deadline')}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Xem lịch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
