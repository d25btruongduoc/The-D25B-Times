import { FormEvent, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudDownload,
  CloudUpload,
  Download,
  ExternalLink,
  FileSpreadsheet,
  HardDrive,
  KeyRound,
  LogOut,
  MailCheck,
  RefreshCw,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import {
  authorizeGoogleDriveToken,
  authorizeGoogleSheetsToken,
  formatFirebaseAuthError,
  getCachedDriveAccessToken,
  getCachedSheetsAccessToken,
  refreshCurrentUserVerification,
  registerWithEmailMember,
  resendVerificationEmailForCurrentUser,
  signInWithEmailMember,
  signInWithGoogleMember,
  signOutMember,
} from '../firebase';
import {
  DriveAuthExpiredError,
  saveBackupToGoogleDrive,
} from '../services/driveBackupService';
import {
  ADMIN_EMAIL,
  detectAuthProviderId,
  exportMembersToGoogleSheets,
  getMemberDisplayLabel,
  getSheetsSyncConfig,
  isVerifiedAdminEmail,
  listAllMembersForAdmin,
  MemberProfile,
  PreferredScheduleClass,
  saveMemberProfile,
  SheetsAuthExpiredError,
  SheetsSyncConfig,
} from '../services/memberService';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: MemberProfile | null;
  onProfileUpdated: (profile: MemberProfile | null) => void;
  consentAccepted: boolean;
  onChangeConsent: (accepted: boolean) => void;
  onOpenPrivacyPolicy: () => void;
  onOpenPersonalHome?: () => void;
  completedDeadlineIds: string[];
  bookmarkedCourseIds: string[];
  preferredClass: PreferredScheduleClass;
  onRestoreActivity: (data: {
    completedDeadlineIds: string[];
    bookmarkedCourseIds: string[];
    preferredClass: PreferredScheduleClass;
  }) => void;
}

function GoogleLogoSvg() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.99-2.19-6.97-5.14H1.03v3.14C3.05 21.14 7.21 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.03 14.01c-.25-.72-.39-1.49-.39-2.29s.14-1.57.39-2.29V6.29H1.03A11.98 11.98 0 0 0 0 11.72c0 1.93.46 3.76 1.03 5.43l4-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.79 0 3.4.62 4.67 1.82l3.5-3.5C18.07 1.19 15.3 0 12 0 7.21 0 3.05 2.86 1.03 7.01l4 3.14c.98-2.95 3.73-5.4 6.97-5.4Z"
      />
    </svg>
  );
}

export function MemberModal({
  isOpen,
  onClose,
  user,
  profile,
  onProfileUpdated,
  consentAccepted,
  onChangeConsent,
  onOpenPrivacyPolicy,
  onOpenPersonalHome,
  completedDeadlineIds,
  bookmarkedCourseIds,
  preferredClass,
  onRestoreActivity,
}: MemberModalProps) {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [activeTab, setActiveTab] = useState<'account' | 'admin'>('account');

  // Auth form fields (Email & Password only — no name, class, or MSSV collected)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Status & feedback
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Admin state
  const [adminMembers, setAdminMembers] = useState<MemberProfile[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [sheetsConfig, setSheetsConfig] = useState<SheetsSyncConfig | null>(null);
  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [sheetsSyncBusy, setSheetsSyncBusy] = useState(false);

  const isAdmin = isVerifiedAdminEmail(user?.email, user?.emailVerified);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (profile?.consentAccepted) {
      onChangeConsent(true);
    }
  }, [profile, onChangeConsent]);

  useEffect(() => {
    if (!isOpen || !isAdmin || activeTab !== 'admin') return;
    let cancelled = false;
    const loadAdminData = async () => {
      setAdminLoading(true);
      setErrorMsg(null);
      try {
        const [members, config] = await Promise.all([
          listAllMembersForAdmin(),
          getSheetsSyncConfig(),
        ]);
        if (!cancelled) {
          setAdminMembers(members);
          setSheetsConfig(config);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(
            err instanceof Error ? err.message : 'Không thể tải danh sách thành viên.'
          );
        }
      } finally {
        if (!cancelled) setAdminLoading(false);
      }
    };
    void loadAdminData();
    return () => {
      cancelled = true;
    };
  }, [isOpen, isAdmin, activeTab]);

  const filteredAdminMembers = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return adminMembers;
    return adminMembers.filter(
      (m) =>
        m.email.toLowerCase().includes(q) ||
        m.authProvider.toLowerCase().includes(q)
    );
  }, [adminMembers, adminSearch]);

  if (!isOpen) return null;

  const persistVerifiedProfile = async (
    targetUser: User,
    overrideConsent?: boolean
  ): Promise<MemberProfile | null> => {
    const finalConsent = overrideConsent ?? consentAccepted;
    if (!targetUser.emailVerified || !finalConsent) {
      return null;
    }
    const providerId = detectAuthProviderId(
      targetUser.providerData.map((p) => p.providerId)
    );
    const saved = await saveMemberProfile({
      uid: targetUser.uid,
      email: targetUser.email || '',
      authProvider: providerId,
      consentAccepted: true,
      completedDeadlineIds,
      bookmarkedCourseIds,
      preferredClass,
    });
    onProfileUpdated(saved);
    return saved;
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (authMode === 'register' && !consentAccepted) {
      setErrorMsg('Vui lòng đánh dấu đồng ý theo Chính sách quyền riêng tư trước khi đăng ký.');
      return;
    }

    setBusy(true);
    try {
      if (authMode === 'register') {
        await registerWithEmailMember(emailInput, passwordInput);
        setSuccessMsg(
          'Đăng ký tài khoản thành công! Một email xác minh đã được gửi tới hộp thư của bạn. Hãy mở email và bấm liên kết xác minh để kích hoạt sao lưu đám mây.'
        );
      } else {
        const loggedIn = await signInWithEmailMember(emailInput, passwordInput);
        if (loggedIn.emailVerified) {
          setSuccessMsg('Đăng nhập thành công.');
        } else {
          setSuccessMsg(
            'Đăng nhập thành công, nhưng email chưa được xác minh. Hãy kiểm tra hộp thư để kích hoạt sao lưu.'
          );
        }
      }
    } catch (err) {
      setErrorMsg(formatFirebaseAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      const requestDrive = consentAccepted;
      const signedIn = await signInWithGoogleMember({
        requestDriveScope: requestDrive,
      });
      if (signedIn.emailVerified && consentAccepted) {
        let driveFileId = '';
        if (requestDrive) {
          const driveToken = getCachedDriveAccessToken();
          if (driveToken) {
            try {
              const driveRes = await saveBackupToGoogleDrive(driveToken, {
                version: 1,
                backedUpAt: new Date().toISOString(),
                completedDeadlineIds,
                bookmarkedCourseIds,
                preferredClass,
                personalHome: {
                  customName: signedIn.displayName || signedIn.email?.split('@')[0] || '',
                  bio: '',
                  accentColor: 'cyan',
                },
              });
              driveFileId = driveRes.fileId;
            } catch {
              // Drive upload optional if user declined Drive scope
            }
          }
        }
        const providerId = detectAuthProviderId(
          signedIn.providerData.map((p) => p.providerId)
        );
        const saved = await saveMemberProfile({
          uid: signedIn.uid,
          email: signedIn.email || '',
          authProvider: providerId,
          consentAccepted: true,
          autoDriveBackup: Boolean(driveFileId),
          driveBackupFileId: driveFileId || undefined,
          completedDeadlineIds,
          bookmarkedCourseIds,
          preferredClass,
        });
        onProfileUpdated(saved);
        setSuccessMsg(
          driveFileId
            ? 'Đã đăng nhập bằng Google, đồng bộ Cloud và sao lưu lên Google Drive của bạn.'
            : 'Đã đăng nhập bằng Google và đồng bộ bản sao lưu lên Cloud.'
        );
      } else {
        setSuccessMsg(
          'Đã đăng nhập bằng Google. Hãy đánh dấu đồng ý theo Chính sách quyền riêng tư bên trên để bật sao lưu đám mây.'
        );
      }
    } catch (err) {
      setErrorMsg(formatFirebaseAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleBackupToGoogleDrive = async () => {
    if (!user || !user.emailVerified) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
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
          customName: getMemberDisplayLabel(profile, user.email, user.displayName),
          bio: profile?.bio || '',
          accentColor: profile?.accentColor || 'cyan',
        },
      };

      let driveRes;
      try {
        driveRes = await saveBackupToGoogleDrive(
          token,
          payload,
          profile?.driveBackupFileId
        );
      } catch (err) {
        if (err instanceof DriveAuthExpiredError) {
          token = await authorizeGoogleDriveToken();
          driveRes = await saveBackupToGoogleDrive(
            token,
            payload,
            profile?.driveBackupFileId
          );
        } else {
          throw err;
        }
      }

      if (consentAccepted) {
        const providerId = detectAuthProviderId(
          user.providerData.map((p) => p.providerId)
        );
        const saved = await saveMemberProfile({
          uid: user.uid,
          email: user.email || '',
          authProvider: providerId,
          consentAccepted: true,
          autoDriveBackup: true,
          driveBackupFileId: driveRes.fileId,
          completedDeadlineIds,
          bookmarkedCourseIds,
          preferredClass,
        });
        onProfileUpdated(saved);
      }
      setSuccessMsg('Đã sao lưu bản dữ liệu (The_D25B_Times_Backup.json) vào Google Drive của bạn.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Không thể sao lưu lên Google Drive.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResendVerification = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      await resendVerificationEmailForCurrentUser();
      setSuccessMsg('Đã gửi lại email xác minh. Vui lòng kiểm tra hộp thư đến hoặc thư rác.');
    } catch (err) {
      setErrorMsg(formatFirebaseAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRefreshVerification = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      const refreshed = await refreshCurrentUserVerification();
      if (refreshed?.emailVerified) {
        if (consentAccepted) {
          await persistVerifiedProfile(refreshed, true);
        }
        setSuccessMsg('Email đã được xác minh! Tính năng sao lưu đám mây đã sẵn sàng.');
      } else {
        setErrorMsg('Email vẫn chưa được xác minh. Hãy bấm vào đường link trong email của bạn rồi kiểm tra lại.');
      }
    } catch (err) {
      setErrorMsg(formatFirebaseAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAndBackup = async () => {
    if (!user) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!consentAccepted) {
      setErrorMsg('Bạn cần đánh dấu đồng ý theo Chính sách quyền riêng tư trước khi bật sao lưu.');
      return;
    }
    if (!user.emailVerified) {
      setErrorMsg('Vui lòng xác minh email trước khi sao lưu lên đám mây.');
      return;
    }

    setBusy(true);
    try {
      await persistVerifiedProfile(user, true);
      setSuccessMsg('Đã sao lưu toàn bộ hoạt động hiện tại lên đám mây.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Không thể sao lưu hoạt động lên đám mây.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRestoreFromCloud = () => {
    if (!profile) return;
    onRestoreActivity({
      completedDeadlineIds: profile.completedDeadlineIds || [],
      bookmarkedCourseIds: profile.bookmarkedCourseIds || [],
      preferredClass: profile.preferredClass || 'ALL',
    });
    setSuccessMsg('Đã khôi phục tiến độ deadline, học phần đánh dấu và bộ lọc lớp từ đám mây.');
  };

  const handleSignOut = async () => {
    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await signOutMember();
      onProfileUpdated(null);
      setActiveTab('account');
    } catch (err) {
      setErrorMsg(formatFirebaseAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmSheetsExport = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSheetsSyncBusy(true);
    try {
      let token = getCachedSheetsAccessToken();
      if (!token) {
        token = await authorizeGoogleSheetsToken();
      }

      let result;
      try {
        result = await exportMembersToGoogleSheets(
          token,
          adminMembers,
          sheetsConfig?.spreadsheetId
        );
      } catch (err) {
        if (err instanceof SheetsAuthExpiredError) {
          token = await authorizeGoogleSheetsToken();
          result = await exportMembersToGoogleSheets(
            token,
            adminMembers,
            sheetsConfig?.spreadsheetId
          );
        } else {
          throw err;
        }
      }

      setShowSheetsConfirm(false);
      const freshConfig = await getSheetsSyncConfig();
      setSheetsConfig(freshConfig);
      setSuccessMsg(
        `Đã đồng bộ ${result.syncedCount} thành viên vào Google Sheets "${result.spreadsheetTitle}".`
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Không thể đồng bộ Google Sheets.'
      );
    } finally {
      setSheetsSyncBusy(false);
    }
  };

  const handleDownloadCsv = () => {
    const consented = adminMembers.filter((m) => m.consentAccepted);
    const header = [
      'STT',
      'Email',
      'Phương thức',
      'Deadline đã xong',
      'Học phần đánh dấu',
      'Lớp lịch ưu tiên',
    ];
    const escapeCell = (val: string | number) =>
      `"${String(val).replace(/"/g, '""')}"`;
    const lines = [
      header.map(escapeCell).join(','),
      ...consented.map((m, idx) =>
        [
          idx + 1,
          m.email,
          m.authProvider,
          m.completedDeadlineIds?.length ?? 0,
          m.bookmarkedCourseIds?.length ?? 0,
          m.preferredClass,
        ]
          .map(escapeCell)
          .join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'thed25btimes-thanh-vien.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0E1525] border border-slate-700/80 rounded-2xl shadow-2xl">
        {/* Top Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-[#0B1120]/95 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-lg bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 shrink-0">
              <Cloud className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2
                id="member-modal-title"
                className="font-heading text-lg font-bold text-slate-50 truncate"
              >
                Thành viên &amp; Sao lưu hoạt động
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Đồng bộ tiến độ deadline, học phần đánh dấu và bộ lọc lịch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Tab Switcher */}
        {isAdmin && (
          <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 bg-[#0B1120]/60">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'account'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Tài khoản &amp; Sao lưu cá nhân
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Quản trị &amp; Google Sheets</span>
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {/* Error / Success Banners */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs sm:text-sm text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs sm:text-sm text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* Compact Consent Checkbox with linked standalone Privacy Policy */}
          {(!user || !profile) && activeTab === 'account' && (
            <div className="p-3.5 rounded-xl bg-[#0B1120] border border-cyan-500/25">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => onChangeConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                />
                <span className="text-xs text-slate-200 leading-relaxed">
                  Tôi đồng ý lưu email tài khoản và sao lưu hoạt động học tập trong ứng dụng theo{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenPrivacyPolicy();
                    }}
                    className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
                  >
                    Chính sách quyền riêng tư
                  </button>
                  .
                </span>
              </label>
            </div>
          )}

          {/* Case 1: Not signed in */}
          {!user && (
            <div className="space-y-5">
              {/* Google Sign-In Button (Official Light Style) */}
              <div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#FFFFFF] text-[#1F1F1F] border border-[#747775] hover:bg-slate-100 text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <GoogleLogoSvg />
                  <span>Tiếp tục với Google</span>
                </button>
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-800" />
                <span className="px-3 text-[11px] uppercase tracking-wider text-slate-500">
                  hoặc bằng Email &amp; Mật khẩu
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              {/* Email / Password Toggle */}
              <div className="flex rounded-lg bg-[#0B1120] p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Đăng ký thành viên mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Đã có tài khoản · Đăng nhập
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Mật khẩu <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {busy
                      ? 'Đang xử lý...'
                      : authMode === 'register'
                      ? 'Đăng ký & Gửi email xác minh'
                      : 'Đăng nhập bằng Email'}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* Case 2: Signed in — Account & Cloud Backup Tab */}
          {user && activeTab === 'account' && (
            <div className="space-y-5">
              {/* Signed-in user header card */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0B1120] border border-slate-800">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-mono font-semibold text-slate-50 truncate">
                      {user.email || 'Tài khoản thành viên'}
                    </p>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <MailCheck className="w-3 h-3" />
                        Đã xác minh
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Chờ xác minh email
                      </span>
                    )}
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                        Quản trị viên
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onOpenPrivacyPolicy}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Xem Chính sách quyền riêng tư
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onOpenPersonalHome && (
                    <button
                      type="button"
                      onClick={onOpenPersonalHome}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400/15 border border-cyan-400/40 hover:bg-cyan-400/25 text-xs font-semibold text-cyan-200 transition-colors cursor-pointer"
                    >
                      <UserCircle2 className="w-3.5 h-3.5" />
                      <span>Trang chủ cá nhân</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131C31] border border-slate-700 hover:border-rose-400/50 text-xs font-medium text-slate-200 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>

              {/* Email verification prompt if unverified */}
              {!user.emailVerified && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-3">
                  <p className="text-xs sm:text-sm text-amber-200 leading-relaxed">
                    Tài khoản của bạn cần xác minh email trước khi bật đồng bộ &amp; sao lưu lên đám mây Firebase. Hãy kiểm tra hộp thư <span className="font-mono font-semibold">{user.email}</span> (kể cả mục Spam).
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleRefreshVerification}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-400 text-slate-950 text-xs font-semibold hover:bg-amber-300 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Tôi đã xác minh — Kiểm tra lại</span>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleResendVerification}
                      className="px-3.5 py-2 rounded-lg bg-[#0B1120] border border-amber-400/40 text-amber-200 text-xs font-medium hover:bg-amber-500/15 transition-colors cursor-pointer"
                    >
                      Gửi lại email xác minh
                    </button>
                  </div>
                </div>
              )}

              {/* Activity Backup Stats & Restore */}
              <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Trạng thái sao lưu hoạt động trong app
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {profile ? 'Đã kết nối đám mây' : 'Chưa kích hoạt sao lưu'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2.5 rounded-lg bg-[#131C31] border border-slate-800">
                    <p className="text-lg font-bold font-mono text-slate-50">
                      {completedDeadlineIds.length}
                    </p>
                    <p className="text-[11px] text-slate-400">Deadline hoàn thành</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#131C31] border border-slate-800">
                    <p className="text-lg font-bold font-mono text-slate-50">
                      {bookmarkedCourseIds.length}
                    </p>
                    <p className="text-[11px] text-slate-400">Học phần đánh dấu</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#131C31] border border-slate-800">
                    <p className="text-lg font-bold font-mono text-cyan-300">
                      {preferredClass === 'ALL' ? '4 lớp' : preferredClass}
                    </p>
                    <p className="text-[11px] text-slate-400">Bộ lọc lịch HK2</p>
                  </div>
                </div>

                {profile && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                    <span>
                      Bản sao lưu gần nhất: {profile.completedDeadlineIds?.length ?? 0} deadline ·{' '}
                      {profile.bookmarkedCourseIds?.length ?? 0} học phần · Bộ lọc {profile.preferredClass}
                    </span>
                    <button
                      type="button"
                      onClick={handleRestoreFromCloud}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131C31] border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10 font-medium transition-colors cursor-pointer"
                    >
                      <CloudDownload className="w-3.5 h-3.5" />
                      <span>Khôi phục về máy này</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={busy || !user.emailVerified || !consentAccepted}
                  onClick={handleSaveAndBackup}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>
                    {busy
                      ? 'Đang sao lưu...'
                      : profile
                      ? 'Sao lưu Cloud ngay'
                      : 'Kích hoạt sao lưu Cloud'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={busy || !user.emailVerified || !consentAccepted}
                  onClick={handleBackupToGoogleDrive}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-400/15 border border-emerald-400/40 hover:bg-emerald-400/25 text-emerald-200 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Sao lưu lên Google Drive</span>
                </button>
              </div>
            </div>
          )}

          {/* Case 3: Admin Google Sheets Tab */}
          {isAdmin && activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Danh sách thành viên đã đồng ý ({adminMembers.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Đồng bộ danh sách email và tiến độ sao lưu sang Google Sheets của tài khoản{' '}
                      <span className="font-mono text-cyan-300">{ADMIN_EMAIL}</span>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={adminLoading || adminMembers.length === 0}
                      onClick={handleDownloadCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#131C31] border border-slate-700 hover:border-cyan-400/50 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải CSV</span>
                    </button>

                    <button
                      type="button"
                      disabled={adminLoading || sheetsSyncBusy}
                      onClick={() => setShowSheetsConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Đồng bộ sang Google Sheets</span>
                    </button>
                  </div>
                </div>

                {sheetsConfig?.spreadsheetUrl && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-300">
                      Bảng tính hiện tại: <strong className="text-slate-100">{sheetsConfig.spreadsheetTitle}</strong>{' '}
                      ({sheetsConfig.lastSyncedCount} thành viên)
                    </span>
                    <a
                      href={sheetsConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-medium"
                    >
                      <span>Mở Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Explicit Confirmation Dialog before modifying Google Sheets */}
              {showSheetsConfirm && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/40 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-200">
                    Xác nhận ghi dữ liệu sang Google Sheets
                  </h4>
                  <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                    <li>
                      Hành động:{' '}
                      {sheetsConfig?.spreadsheetId
                        ? `Cập nhật bảng tính "${sheetsConfig.spreadsheetTitle}"`
                        : 'Tạo mới bảng tính "The D25B Times - Thành viên & Sao lưu"'}
                    </li>
                    <li>
                      Số hồ sơ sẽ ghi:{' '}
                      <strong>
                        {adminMembers.filter((m) => m.consentAccepted).length} thành viên đã xác nhận đồng ý
                      </strong>
                    </li>
                    <li>
                      Tài khoản Google thực hiện:{' '}
                      <span className="font-mono text-emerald-300">{user?.email}</span>
                    </li>
                  </ul>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={sheetsSyncBusy}
                      onClick={handleConfirmSheetsExport}
                      className="px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {sheetsSyncBusy ? 'Đang ghi vào Google Sheets...' : 'Xác nhận đồng bộ'}
                    </button>
                    <button
                      type="button"
                      disabled={sheetsSyncBusy}
                      onClick={() => setShowSheetsConfirm(false)}
                      className="px-3.5 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-xs font-medium text-slate-300 hover:text-slate-100 cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Search & Member List */}
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Tìm nhanh theo email hoặc phương thức đăng nhập..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />

              {adminLoading ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Đang tải danh sách thành viên...
                </p>
              ) : filteredAdminMembers.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Chưa có thành viên nào đăng ký phù hợp.
                </p>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B1120] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Email thành viên</th>
                        <th className="px-3 py-2.5 font-semibold">Phương thức</th>
                        <th className="px-3 py-2.5 font-semibold text-right">Sao lưu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-[#0E1525]">
                      {filteredAdminMembers.map((m) => (
                        <tr key={m.uid} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2.5 font-mono text-[11px] text-slate-100">
                            {m.email}
                          </td>
                          <td className="px-3 py-2.5 text-slate-300">
                            {m.authProvider === 'google.com' ? 'Google' : 'Email'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                            {m.completedDeadlineIds?.length ?? 0} DL ·{' '}
                            {m.bookmarkedCourseIds?.length ?? 0} HP
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
