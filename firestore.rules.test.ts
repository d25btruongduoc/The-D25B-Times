/**
 * Adversarial Security Rules Test Suite ("Dirty Dozen" Verification)
 * Verifies that all 12 attack vectors against /members, /admins, and /app_config fail with PERMISSION_DENIED.
 * Intended for execution with @firebase/rules-unit-testing against the Firestore Emulator.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated user attempts to read member PII',
    collectionPath: 'members/student_1',
    operation: 'get',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Verified student A attempts to read student B PII',
    collectionPath: 'members/student_b',
    operation: 'get',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified email user attempts to create member document',
    collectionPath: 'members/student_unverified',
    operation: 'create',
    auth: { uid: 'student_unverified', email: 'u@ump.edu.vn', email_verified: false },
    payload: {
      uid: 'student_unverified',
      email: 'u@ump.edu.vn',
      authProvider: 'password',
      consentAccepted: true,
      completedDeadlineIds: [],
      bookmarkedCourseIds: [],
      preferredClass: 'D25B',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Spoofed admin email with email_verified=false attempts to list members',
    collectionPath: 'members',
    operation: 'list',
    auth: { uid: 'attacker', email: 'd25b.truongduoc@gmail.com', email_verified: false },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Student A attempts identity spoofing (uid mismatch on create)',
    collectionPath: 'members/student_a',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      uid: 'student_b',
      email: 'a@ump.edu.vn',
      authProvider: 'google.com',
      consentAccepted: true,
      completedDeadlineIds: [],
      bookmarkedCourseIds: [],
      preferredClass: 'ALL',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Shadow ghost field injection (isAdmin / displayName / studentId) on member profile',
    collectionPath: 'members/student_a',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      uid: 'student_a',
      email: 'a@ump.edu.vn',
      authProvider: 'google.com',
      consentAccepted: true,
      completedDeadlineIds: [],
      bookmarkedCourseIds: [],
      preferredClass: 'D25B',
      displayName: 'Should be rejected',
      isAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Student A attempts self-assigned admin escalation in /admins',
    collectionPath: 'admins/student_a',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      uid: 'student_a',
      email: 'a@ump.edu.vn',
      role: 'admin',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Member registration without explicit consentAccepted=true',
    collectionPath: 'members/student_a',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      uid: 'student_a',
      email: 'a@ump.edu.vn',
      authProvider: 'password',
      consentAccepted: false,
      completedDeadlineIds: [],
      bookmarkedCourseIds: [],
      preferredClass: 'D25A',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Student A attempts to mutate immutable authProvider or createdAt',
    collectionPath: 'members/student_a',
    operation: 'update',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      authProvider: 'google.com',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Student A attempts client-forged updatedAt timestamp',
    collectionPath: 'members/student_a',
    operation: 'update',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      completedDeadlineIds: ['dl-1'],
      updatedAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Resource exhaustion: oversized completedDeadlineIds (>150) or invalid ID',
    collectionPath: 'members/student_a$invalid',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      completedDeadlineIds: Array.from({ length: 160 }, (_, i) => `dl-${i}`),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Non-admin student attempts blanket list on /members or write on /app_config',
    collectionPath: 'app_config/sheets_sync',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      spreadsheetId: 'evil-sheet',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/evil',
      spreadsheetTitle: 'Hijacked',
      lastSyncedCount: 99,
      updatedByUid: 'student_a',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
