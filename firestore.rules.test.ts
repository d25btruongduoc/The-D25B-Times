/**
 * Adversarial Security Rules Test Suite ("Dirty Dozen" Verification)
 * Verifies that all 12 attack vectors against /members, /forum_posts, /forum_chat, /admins, and /app_config fail with PERMISSION_DENIED.
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
    name: 'Verified user A attempts to read user B PII',
    collectionPath: 'members/student_b',
    operation: 'get',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified user attempts to create forum post',
    collectionPath: 'forum_posts/post_1',
    operation: 'create',
    auth: { uid: 'student_unverified', email: 'u@ump.edu.vn', email_verified: false },
    payload: {
      postId: 'post_1',
      authorUid: 'student_unverified',
      authorName: 'Unverified',
      authorAvatar: '',
      category: 'study',
      title: 'Test',
      content: 'Hello',
      attachmentUrl: '',
      visibility: 'public',
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
    name: 'Removed Facebook authProvider rejected on member create',
    collectionPath: 'members/student_a',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      uid: 'student_a',
      email: 'a@ump.edu.vn',
      authProvider: 'facebook.com',
      consentAccepted: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Shadow ghost field injection (isAdmin / studentId) on member profile',
    collectionPath: 'members/student_a',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      uid: 'student_a',
      email: 'a@ump.edu.vn',
      authProvider: 'google.com',
      consentAccepted: true,
      isAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'User A attempts self-assigned admin escalation in /admins',
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
    name: 'Orphaned comment write without existing parent forum_post',
    collectionPath: 'forum_posts/missing_post/comments/c1',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      commentId: 'c1',
      postId: 'missing_post',
      authorUid: 'student_a',
      authorName: 'Student A',
      authorAvatar: '',
      content: 'Orphan comment',
      visibility: 'public',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'User A attempts authorUid impersonation in /forum_chat',
    collectionPath: 'forum_chat/msg_1',
    operation: 'create',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      messageId: 'msg_1',
      authorUid: 'student_b',
      authorName: 'Impersonator',
      authorAvatar: '',
      text: 'Fake message',
      visibility: 'public',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Client-forged updatedAt timestamp rejected',
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
    name: 'Resource exhaustion: oversized completedDeadlineIds (>150)',
    collectionPath: 'members/student_a',
    operation: 'update',
    auth: { uid: 'student_a', email: 'a@ump.edu.vn', email_verified: true },
    payload: {
      completedDeadlineIds: Array.from({ length: 160 }, (_, i) => `dl-${i}`),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Non-admin student attempts write on /app_config/sheets_sync',
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
