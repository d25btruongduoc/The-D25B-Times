import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  ensureFirebaseReady,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { ScheduleClassCode } from '../data/d25bData';

export const ADMIN_EMAIL = 'd25b.truongduoc@gmail.com';

export type AuthProviderId = 'password' | 'google.com';
export type PreferredScheduleClass = 'ALL' | ScheduleClassCode;
export type PersonalAccentColor = 'cyan' | 'emerald' | 'violet' | 'amber';

export interface MemberProfile {
  uid: string;
  email: string;
  authProvider: AuthProviderId;
  consentAccepted: boolean;
  customName: string;
  avatarUrl: string;
  bio: string;
  accentColor: PersonalAccentColor;
  autoDriveBackup: boolean;
  driveBackupFileId: string;
  completedDeadlineIds: string[];
  bookmarkedCourseIds: string[];
  preferredClass: PreferredScheduleClass;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface SheetsSyncConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastSyncedAt?: Timestamp | null;
  lastSyncedCount: number;
  updatedByUid: string;
}

export function isVerifiedAdminEmail(email?: string | null, emailVerified?: boolean): boolean {
  return Boolean(emailVerified && email?.toLowerCase() === ADMIN_EMAIL);
}

export function detectAuthProviderId(providerIds: string[]): AuthProviderId {
  if (providerIds.includes('google.com')) return 'google.com';
  return 'password';
}

export function getMemberDisplayLabel(
  profile: MemberProfile | null,
  fallbackEmail?: string | null,
  fallbackGoogleName?: string | null
): string {
  if (profile?.customName?.trim()) return profile.customName.trim();
  if (fallbackGoogleName?.trim()) return fallbackGoogleName.trim();
  if (profile?.email) return profile.email.split('@')[0];
  if (fallbackEmail) return fallbackEmail.split('@')[0];
  return 'Thành viên';
}

export async function getMemberProfile(uid: string): Promise<MemberProfile | null> {
  const { db } = await ensureFirebaseReady();
  const path = `members/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'members', uid));
    if (!snap.exists()) return null;
    const raw = snap.data() as Partial<MemberProfile>;
    return {
      uid: raw.uid || uid,
      email: raw.email || '',
      authProvider: raw.authProvider === 'google.com' ? 'google.com' : 'password',
      consentAccepted: Boolean(raw.consentAccepted),
      customName: raw.customName || '',
      avatarUrl: raw.avatarUrl || '',
      bio: raw.bio || '',
      accentColor: raw.accentColor || 'cyan',
      autoDriveBackup: Boolean(raw.autoDriveBackup),
      driveBackupFileId: raw.driveBackupFileId || '',
      completedDeadlineIds: Array.isArray(raw.completedDeadlineIds) ? raw.completedDeadlineIds : [],
      bookmarkedCourseIds: Array.isArray(raw.bookmarkedCourseIds) ? raw.bookmarkedCourseIds : [],
      preferredClass: raw.preferredClass || 'ALL',
      createdAt: raw.createdAt || null,
      updatedAt: raw.updatedAt || null,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveMemberProfile(params: {
  uid: string;
  email: string;
  authProvider: AuthProviderId;
  consentAccepted: boolean;
  customName?: string;
  avatarUrl?: string;
  bio?: string;
  accentColor?: PersonalAccentColor;
  autoDriveBackup?: boolean;
  driveBackupFileId?: string;
  completedDeadlineIds: string[];
  bookmarkedCourseIds: string[];
  preferredClass: PreferredScheduleClass;
}): Promise<MemberProfile> {
  const { db } = await ensureFirebaseReady();
  const path = `members/${params.uid}`;
  const docRef = doc(db, 'members', params.uid);

  const boundedCompleted = params.completedDeadlineIds.slice(0, 150);
  const boundedBookmarks = params.bookmarkedCourseIds.slice(0, 80);

  let existingSnap;
  try {
    existingSnap = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const prev = existingSnap.exists() ? (existingSnap.data() as Partial<MemberProfile>) : null;
  const customName = (params.customName ?? prev?.customName ?? '').trim().slice(0, 60);
  const avatarUrl = (params.avatarUrl ?? prev?.avatarUrl ?? '').trim().slice(0, 65000);
  const bio = (params.bio ?? prev?.bio ?? '').trim().slice(0, 240);
  const accentColor = params.accentColor ?? prev?.accentColor ?? 'cyan';
  const autoDriveBackup = params.autoDriveBackup ?? Boolean(prev?.autoDriveBackup);
  const driveBackupFileId = (params.driveBackupFileId ?? prev?.driveBackupFileId ?? '').slice(0, 128);

  if (!existingSnap.exists()) {
    try {
      await setDoc(docRef, {
        uid: params.uid,
        email: params.email.trim().slice(0, 150),
        authProvider: params.authProvider,
        consentAccepted: params.consentAccepted,
        customName,
        avatarUrl,
        bio,
        accentColor,
        autoDriveBackup,
        driveBackupFileId,
        completedDeadlineIds: boundedCompleted,
        bookmarkedCourseIds: boundedBookmarks,
        preferredClass: params.preferredClass,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    try {
      await updateDoc(docRef, {
        email: params.email.trim().slice(0, 150),
        customName,
        avatarUrl,
        bio,
        accentColor,
        autoDriveBackup,
        driveBackupFileId,
        completedDeadlineIds: boundedCompleted,
        bookmarkedCourseIds: boundedBookmarks,
        preferredClass: params.preferredClass,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  const updated = await getMemberProfile(params.uid);
  if (!updated) {
    throw new Error('Không thể đọc lại hồ sơ sau khi lưu.');
  }
  return updated;
}

export async function syncMemberActivityBackup(
  uid: string,
  activity: {
    completedDeadlineIds: string[];
    bookmarkedCourseIds: string[];
    preferredClass: PreferredScheduleClass;
    driveBackupFileId?: string;
    autoDriveBackup?: boolean;
  }
): Promise<void> {
  const { db } = await ensureFirebaseReady();
  const path = `members/${uid}`;
  try {
    const payload: Record<string, unknown> = {
      completedDeadlineIds: activity.completedDeadlineIds.slice(0, 150),
      bookmarkedCourseIds: activity.bookmarkedCourseIds.slice(0, 80),
      preferredClass: activity.preferredClass,
      updatedAt: serverTimestamp(),
    };
    if (typeof activity.driveBackupFileId === 'string') {
      payload.driveBackupFileId = activity.driveBackupFileId.slice(0, 128);
    }
    if (typeof activity.autoDriveBackup === 'boolean') {
      payload.autoDriveBackup = activity.autoDriveBackup;
    }
    await updateDoc(doc(db, 'members', uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function listAllMembersForAdmin(): Promise<MemberProfile[]> {
  const { db } = await ensureFirebaseReady();
  const path = 'members';
  try {
    const q = query(collection(db, 'members'), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as MemberProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getSheetsSyncConfig(): Promise<SheetsSyncConfig | null> {
  const { db } = await ensureFirebaseReady();
  const path = 'app_config/sheets_sync';
  try {
    const snap = await getDoc(doc(db, 'app_config', 'sheets_sync'));
    if (!snap.exists()) return null;
    return snap.data() as SheetsSyncConfig;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveSheetsSyncConfig(config: {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastSyncedCount: number;
}): Promise<void> {
  const { auth, db } = await ensureFirebaseReady();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Chưa đăng nhập quản trị viên.');
  const path = 'app_config/sheets_sync';
  try {
    await setDoc(doc(db, 'app_config', 'sheets_sync'), {
      spreadsheetId: config.spreadsheetId.slice(0, 128),
      spreadsheetUrl: config.spreadsheetUrl.slice(0, 300),
      spreadsheetTitle: config.spreadsheetTitle.slice(0, 150),
      lastSyncedAt: serverTimestamp(),
      lastSyncedCount: config.lastSyncedCount,
      updatedByUid: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

function formatProviderLabel(provider: AuthProviderId): string {
  return provider === 'google.com' ? 'Google' : 'Email/Mật khẩu';
}

function formatTimestampIso(ts?: Timestamp | null): string {
  if (!ts) return '';
  try {
    return ts.toDate().toLocaleString('vi-VN', { hour12: false });
  } catch {
    return '';
  }
}

export class SheetsAuthExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SheetsAuthExpiredError';
  }
}

interface SpreadsheetMetadata {
  spreadsheetId: string;
  spreadsheetUrl: string;
  properties?: { title?: string };
  sheets?: { properties?: { title?: string } }[];
}

export async function exportMembersToGoogleSheets(
  accessToken: string,
  members: MemberProfile[],
  existingSpreadsheetId?: string | null
): Promise<{
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  syncedCount: number;
}> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let spreadsheetId = existingSpreadsheetId || '';
  let spreadsheetUrl = '';
  let spreadsheetTitle = 'The D25B Times - Thành viên & Sao lưu';
  let firstSheetTitle = 'ThanhVien';

  if (spreadsheetId) {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}?fields=spreadsheetId,spreadsheetUrl,properties.title,sheets.properties.title`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (metaRes.status === 401 || metaRes.status === 403) {
      throw new SheetsAuthExpiredError('Phiên cấp quyền Google Sheets đã hết hạn hoặc thiếu quyền.');
    }
    if (metaRes.ok) {
      const meta = (await metaRes.json()) as SpreadsheetMetadata;
      spreadsheetId = meta.spreadsheetId;
      spreadsheetUrl = meta.spreadsheetUrl;
      spreadsheetTitle = meta.properties?.title || spreadsheetTitle;
      firstSheetTitle = meta.sheets?.[0]?.properties?.title || firstSheetTitle;
    } else {
      spreadsheetId = '';
    }
  }

  if (!spreadsheetId) {
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        properties: { title: spreadsheetTitle },
        sheets: [{ properties: { title: firstSheetTitle } }],
      }),
    });

    if (createRes.status === 401 || createRes.status === 403) {
      throw new SheetsAuthExpiredError('Phiên cấp quyền Google Sheets đã hết hạn hoặc bị từ chối.');
    }
    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Không thể tạo Google Sheets (${createRes.status}): ${errText}`);
    }

    const created = (await createRes.json()) as SpreadsheetMetadata;
    spreadsheetId = created.spreadsheetId;
    spreadsheetUrl = created.spreadsheetUrl;
    spreadsheetTitle = created.properties?.title || spreadsheetTitle;
    firstSheetTitle = created.sheets?.[0]?.properties?.title || firstSheetTitle;
  }

  const consentedMembers = members.filter((m) => m.consentAccepted);
  const rows: (string | number)[][] = [
    [
      'STT',
      'Email',
      'Phương thức',
      'Đã đồng ý sao lưu',
      'Số deadline hoàn thành',
      'Số học phần đánh dấu',
      'Bộ lọc lịch HK2',
      'Thời điểm đăng ký',
      'Sao lưu gần nhất',
    ],
    ...consentedMembers.map((m, idx) => [
      idx + 1,
      m.email,
      formatProviderLabel(m.authProvider),
      m.consentAccepted ? 'Đã đồng ý' : 'Chưa',
      m.completedDeadlineIds?.length ?? 0,
      m.bookmarkedCourseIds?.length ?? 0,
      m.preferredClass,
      formatTimestampIso(m.createdAt),
      formatTimestampIso(m.updatedAt),
    ]),
  ];

  const clearRange = `'${firstSheetTitle.replace(/'/g, "''")}'!A1:Z5000`;
  const clearRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(clearRange)}:clear`,
    { method: 'POST', headers }
  );
  if (clearRes.status === 401 || clearRes.status === 403) {
    throw new SheetsAuthExpiredError('Phiên cấp quyền Google Sheets đã hết hạn.');
  }

  const writeRange = `'${firstSheetTitle.replace(/'/g, "''")}'!A1`;
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(writeRange)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({ values: rows }),
    }
  );

  if (updateRes.status === 401 || updateRes.status === 403) {
    throw new SheetsAuthExpiredError('Phiên cấp quyền Google Sheets đã hết hạn.');
  }
  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Không thể ghi dữ liệu Google Sheets (${updateRes.status}): ${errText}`);
  }

  await saveSheetsSyncConfig({
    spreadsheetId,
    spreadsheetUrl,
    spreadsheetTitle,
    lastSyncedCount: consentedMembers.length,
  });

  return {
    spreadsheetId,
    spreadsheetUrl,
    spreadsheetTitle,
    syncedCount: consentedMembers.length,
  };
}
