import { useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { ExternalLink } from 'lucide-react';
import { AiChatWidget } from './components/AiChatWidget';
import { DeadlineView } from './components/DeadlineView';
import { ForumView } from './components/ForumView';
import { HandbookView } from './components/HandbookView';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { LibraryView } from './components/LibraryView';
import { MemberModal } from './components/MemberModal';
import { PersonalHomeView } from './components/PersonalHomeView';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { StudyView } from './components/StudyView';
import { TermsModal } from './components/TermsModal';
import { CONTACTS, HandbookTab, NavSection } from './data/d25bData';
import { getCachedDriveAccessToken, subscribeAuthState } from './firebase';
import { saveBackupToGoogleDrive } from './services/driveBackupService';
import {
  getMemberDisplayLabel,
  getMemberProfile,
  MemberProfile,
  PreferredScheduleClass,
  syncMemberActivityBackup,
} from './services/memberService';

const STORAGE_KEY = 'd25b_completed_deadlines_v1';
const BOOKMARKS_KEY = 'd25b_bookmarked_courses_v1';
const PREFERRED_CLASS_KEY = 'd25b_preferred_class_v1';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);
  const [selectedHandbookTab, setSelectedHandbookTab] = useState<HandbookTab>('campus');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const hasHydratedCloudRef = useRef(false);

  const [completedDeadlines, setCompletedDeadlines] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [preferredClass, setPreferredClass] = useState<PreferredScheduleClass>(() => {
    try {
      const saved = localStorage.getItem(PREFERRED_CLASS_KEY);
      if (
        saved === 'ALL' ||
        saved === 'D25A' ||
        saved === 'D25B' ||
        saved === 'D25C' ||
        saved === 'D25D'
      ) {
        return saved;
      }
      return 'ALL';
    } catch {
      return 'ALL';
    }
  });

  useEffect(() => {
    document.title = 'The D25B Times — Cổng thông tin Lớp D25B, Trường Dược ĐHYD TP.HCM';
    const setFavicon = (rel: string, href: string, type?: string) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
      if (type) link.type = type;
    };
    setFavicon('icon', '/favicon.ico', 'image/x-icon');
    setFavicon('shortcut icon', '/favicon.ico', 'image/x-icon');
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDeadlines));
    } catch {
      // ignore storage errors
    }
  }, [completedDeadlines]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarkedCourseIds));
    } catch {
      // ignore storage errors
    }
  }, [bookmarkedCourseIds]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFERRED_CLASS_KEY, preferredClass);
    } catch {
      // ignore storage errors
    }
  }, [preferredClass]);

  // Listen to Firebase Auth state & load verified member cloud profile
  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
      setCurrentUser(user);
      if (!user) {
        setMemberProfile(null);
        hasHydratedCloudRef.current = false;
        return;
      }
      if (!user.emailVerified) {
        setMemberProfile(null);
        return;
      }
      void getMemberProfile(user.uid)
        .then((loaded) => {
          setMemberProfile(loaded);
          if (loaded?.consentAccepted) {
            setConsentAccepted(true);
          }
          if (loaded && !hasHydratedCloudRef.current) {
            hasHydratedCloudRef.current = true;
            setCompletedDeadlines((prev) =>
              Array.from(new Set([...prev, ...(loaded.completedDeadlineIds || [])])).slice(0, 150)
            );
            setBookmarkedCourseIds((prev) =>
              Array.from(new Set([...prev, ...(loaded.bookmarkedCourseIds || [])])).slice(0, 80)
            );
            setPreferredClass((prev) =>
              prev === 'ALL' && loaded.preferredClass ? loaded.preferredClass : prev
            );
          }
        })
        .catch(() => {
          // Handled cleanly via handleFirestoreError logs
        });
    });
    return () => unsubscribe();
  }, []);

  // Debounced automatic activity backup to Firestore when signed in & consented
  useEffect(() => {
    if (
      !currentUser ||
      !currentUser.emailVerified ||
      !memberProfile ||
      !memberProfile.consentAccepted
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          await syncMemberActivityBackup(currentUser.uid, {
            completedDeadlineIds: completedDeadlines,
            bookmarkedCourseIds,
            preferredClass,
          });

          const driveToken = getCachedDriveAccessToken();
          if (memberProfile.autoDriveBackup && driveToken) {
            const driveRes = await saveBackupToGoogleDrive(
              driveToken,
              {
                version: 1,
                backedUpAt: new Date().toISOString(),
                completedDeadlineIds: completedDeadlines,
                bookmarkedCourseIds,
                preferredClass,
                personalHome: {
                  customName: memberProfile.customName,
                  bio: memberProfile.bio,
                  accentColor: memberProfile.accentColor,
                },
              },
              memberProfile.driveBackupFileId
            );
            if (driveRes.fileId && driveRes.fileId !== memberProfile.driveBackupFileId) {
              await syncMemberActivityBackup(currentUser.uid, {
                completedDeadlineIds: completedDeadlines,
                bookmarkedCourseIds,
                preferredClass,
                driveBackupFileId: driveRes.fileId,
              });
            }
          }
        } catch {
          // Non-blocking background sync
        }
      })();
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [currentUser, memberProfile, completedDeadlines, bookmarkedCourseIds, preferredClass]);

  const handleNavigate = (
    section: NavSection,
    options?: { courseId?: string; handbookTab?: HandbookTab }
  ) => {
    setActiveSection(section);
    if (options?.courseId) {
      setSelectedCourseId(options.courseId);
    } else if (section === 'study') {
      setSelectedCourseId(undefined);
    }
    if (options?.handbookTab) {
      setSelectedHandbookTab(options.handbookTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleDeadline = (id: string) => {
    setCompletedDeadlines((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleBookmarkCourse = (courseId: string) => {
    setBookmarkedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleRestoreCloudActivity = (data: {
    completedDeadlineIds: string[];
    bookmarkedCourseIds: string[];
    preferredClass: PreferredScheduleClass;
  }) => {
    setCompletedDeadlines(data.completedDeadlineIds);
    setBookmarkedCourseIds(data.bookmarkedCourseIds);
    setPreferredClass(data.preferredClass);
  };

  const memberLabel = currentUser
    ? getMemberDisplayLabel(memberProfile, currentUser.email, currentUser.displayName)
    : null;
  const memberAvatar = memberProfile?.avatarUrl || currentUser?.photoURL || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100 tech-grid-bg">
      <Header
        activeSection={activeSection}
        onNavigate={(section) => handleNavigate(section)}
        memberLabel={memberLabel}
        memberAvatar={memberAvatar}
        isMemberSignedIn={Boolean(currentUser)}
        onOpenMemberModal={() => setIsMemberModalOpen(true)}
      />

      <main className="flex-1">
        {activeSection === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            completedDeadlines={completedDeadlines}
          />
        )}

        {activeSection === 'study' && (
          <StudyView
            initialCourseId={selectedCourseId}
            bookmarkedCourseIds={bookmarkedCourseIds}
            onToggleBookmarkCourse={handleToggleBookmarkCourse}
          />
        )}

        {activeSection === 'deadline' && (
          <DeadlineView
            completedIds={completedDeadlines}
            onToggleComplete={handleToggleDeadline}
            preferredClass={preferredClass}
            onChangePreferredClass={setPreferredClass}
            onNavigate={handleNavigate}
          />
        )}

        {activeSection === 'handbook' && (
          <HandbookView initialTab={selectedHandbookTab} />
        )}

        {activeSection === 'library' && <LibraryView />}

        {activeSection === 'forum' && (
          <ForumView
            user={currentUser}
            profile={memberProfile}
            onOpenMemberModal={() => setIsMemberModalOpen(true)}
          />
        )}

        {activeSection === 'profile' && (
          <PersonalHomeView
            user={currentUser}
            profile={memberProfile}
            onProfileUpdated={setMemberProfile}
            consentAccepted={consentAccepted}
            onChangeConsent={setConsentAccepted}
            onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            onOpenMemberModal={() => setIsMemberModalOpen(true)}
            completedDeadlineIds={completedDeadlines}
            bookmarkedCourseIds={bookmarkedCourseIds}
            preferredClass={preferredClass}
            onRestoreActivity={handleRestoreCloudActivity}
            onNavigate={(section, opts) => handleNavigate(section, opts)}
          />
        )}
      </main>

      <AiChatWidget onNavigate={handleNavigate} />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        user={currentUser}
        profile={memberProfile}
        onProfileUpdated={setMemberProfile}
        consentAccepted={consentAccepted}
        onChangeConsent={setConsentAccepted}
        onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
        onOpenPersonalHome={() => {
          setIsMemberModalOpen(false);
          handleNavigate('profile');
        }}
        completedDeadlineIds={completedDeadlines}
        bookmarkedCourseIds={bookmarkedCourseIds}
        preferredClass={preferredClass}
        onRestoreActivity={handleRestoreCloudActivity}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAcceptPolicy={() => setConsentAccepted(true)}
      />

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAcceptTerms={() => setConsentAccepted(true)}
      />

      {/* Quiet Tech Footer */}
      <footer className="border-t border-slate-800 bg-[#0B1120] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 text-sm text-slate-400">
          <div className="md:col-span-4 space-y-2">
            <p className="font-heading text-lg font-bold text-slate-50">The D25B Times</p>
            <p className="text-xs leading-relaxed">
              Cổng thông tin học tập và sinh hoạt Lớp D25B — Trường Dược, Đại học Y Dược TP. Hồ Chí Minh. Thiết kế tối ưu trải nghiệm tra cứu cho sinh viên khóa D25B.
            </p>
            <p className="text-xs font-mono text-slate-400 pt-1">
              Lớp trưởng: {CONTACTS.classPresident.name} · Zalo {CONTACTS.classPresident.zalo}
            </p>
          </div>

          <div className="md:col-span-3 space-y-1.5 text-xs">
            <p className="font-semibold text-slate-100 uppercase tracking-wider">
              {CONTACTS.academicOffice.name}
            </p>
            <p>{CONTACTS.academicOffice.school}</p>
            <p>{CONTACTS.academicOffice.address}</p>
            <p className="font-mono text-cyan-400">{CONTACTS.academicOffice.email}</p>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs">
            <a
              href="https://www.facebook.com/daranox.lab"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-100 uppercase tracking-wider hover:text-cyan-400 transition-colors group"
            >
              <span>DaraNox Lab</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <p className="text-xs leading-relaxed">
              Nghiên cứu và phát triển phần mềm tích hợp, giải pháp số hóa trải nghiệm học tập và sinh hoạt.
            </p>
            <p className="font-mono text-cyan-400 pt-0.5">
              facebook.com/daranox.lab
            </p>
          </div>

          <div className="md:col-span-2 space-y-2 text-xs">
            <p className="font-semibold text-slate-100 uppercase tracking-wider">
              Liên kết chính thức
            </p>
            <div className="flex flex-col gap-1.5">
              <a
                href={CONTACTS.academicOffice.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
              >
                <span>Website Trường Dược (UMP SP)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={CONTACTS.studentPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
              >
                <span>Cổng thông tin Sinh viên (sv.ump.edu.vn)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={CONTACTS.originalSite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
              >
                <span>Phiên bản Google Sites gốc</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-left text-cyan-400 hover:underline transition-colors cursor-pointer"
              >
                Chính sách quyền riêng tư
              </button>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-left text-cyan-400 hover:underline transition-colors cursor-pointer"
              >
                Điều khoản dịch vụ
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
