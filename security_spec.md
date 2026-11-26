# Security Specification — The D25B Times

## 1. Data Invariants
1. **Strict PII Isolation & Data Minimization**: `/members/{userId}` stores member `email`, self-edited Personal Home fields (`customName`, `avatarUrl`, `bio`, `accentColor`), Google Drive backup settings (`autoDriveBackup`, `driveBackupFileId`), and backed-up activity (`completedDeadlineIds`, `bookmarkedCourseIds`, `preferredClass`). No mandatory class/MSSV fields are collected. Only the verified owner (`request.auth.uid == userId && email_verified == true`) or verified admin (`d25b.truongduoc@gmail.com` with `email_verified == true`, or `/admins/{uid}`) may read or write a member document.
2. **Auth Providers**: Only `'password'` (Email/Password) and `'google.com'` are permitted; Facebook authentication is completely disabled/removed.
3. **Forum PII Isolation & Master Gate**: `/forum_posts/{postId}`, `/forum_posts/{postId}/comments/{commentId}`, and `/forum_chat/{messageId}` store ONLY public display fields (`authorUid`, `authorName`, `authorAvatar`, content) and NEVER store user `email` or private PII. Comments enforce the Master Gate (`exists(/databases/$(database)/documents/forum_posts/$(postId))`). Only verified signed-in authors (`authorUid == request.auth.uid`) may create posts/comments/messages; only authors or admin may delete.
4. **Temporal & Immutable Integrity**: `createdAt`, `updatedAt`, and `lastSyncedAt` must strictly equal `request.time`. `uid`, `authorUid`, `postId`, `createdAt`, and `authProvider` are immutable after creation.
5. **Bounded Sizes**: All strings and arrays have strict `.size()` bounds (`avatarUrl <= 65000`, `content <= 3000`, `completedDeadlineIds <= 150`, `bookmarkedCourseIds <= 80`).

## 2. The "Dirty Dozen" Payloads (Must Return `PERMISSION_DENIED`)
1. **Unauthenticated Member Read/Write**: Unauthenticated user tries `get(/members/user1)` or `create(/members/user1)`.
2. **Cross-User PII Read**: Verified user `userA` tries `get(/members/userB)` to scrape another member's email.
3. **Unverified User Write**: Signed-in user with `email_verified: false` tries to create `/members/userA` or `/forum_posts/p1`.
4. **Email Spoofing Admin Read**: User with token `{ email: "d25b.truongduoc@gmail.com", email_verified: false }` tries `list(/members)`.
5. **Disallowed Auth Provider (`facebook.com`)**: Verified user tries `create(/members/userA)` with `authProvider: "facebook.com"`.
6. **Shadow / Ghost Field Injection**: Verified user creates `/members/userA` with `isAdmin: true` or `studentId: "123"`, or creates `/forum_posts/p1` with `email: "a@b.com"`.
7. **Self-Assigned Admin Escalation**: Verified user tries `create(/admins/userA)` with `role: "admin"`.
8. **Orphaned Forum Comment**: Verified user creates `/forum_posts/nonexistent/comments/c1` where parent post does not exist.
9. **Forum Author Impersonation**: Verified `userA` tries creating `/forum_posts/p2` or `/forum_chat/m1` with `authorUid: "userB"`.
10. **Client Timestamp Forgery**: Verified user submits `createdAt: "2020-01-01T00:00:00Z"` instead of server `request.time`.
11. **Resource Exhaustion / Oversized Payload**: Verified user submits `avatarUrl` > 65KB, `content` > 3000 chars, or `completedDeadlineIds` > 150 items.
12. **Blanket List Scraping / Config Tampering**: Non-admin user executes unfiltered `list(/members)` or writes `/app_config/sheets_sync`.
