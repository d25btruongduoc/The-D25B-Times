# Security Specification — The D25B Times

## 1. Data Invariants
1. **Data Minimization & Strict PII Isolation**: `/members/{userId}` stores ONLY `uid`, `email`, `authProvider`, `consentAccepted`, and backed-up app activity (`completedDeadlineIds`, `bookmarkedCourseIds`, `preferredClass`). Full name, class group, and student ID (MSSV) are explicitly NOT collected and are rejected by schema rules. Only the verified owner (`request.auth.uid == userId && email_verified == true`) or verified admin (`d25b.truongduoc@gmail.com` with `email_verified == true`, or `/admins/{uid}`) may read or write a member document.
2. **Identity & Immutability**: On `/members/{userId}`, `uid` must match both `{userId}` and `request.auth.uid`, and `uid` + `createdAt` + `authProvider` are immutable after creation.
3. **Explicit Consent**: Member profiles cannot be created or updated unless `consentAccepted == true`.
4. **Verified Email Enforcement**: All authenticated writes require `request.auth.token.email_verified == true`.
5. **Temporal Integrity**: `createdAt` and `updatedAt` (and `lastSyncedAt`) must strictly equal server `request.time`.
6. **Admin Role Isolation**: Only the verified bootstrapped admin (`d25b.truongduoc@gmail.com`) may write `/admins/{userId}` or read/write `/app_config/{configId}`. Users cannot self-assign admin roles.
7. **Bounded Arrays & Strings**: Every string has strict `.size()` bounds; `completedDeadlineIds` (<= 150) and `bookmarkedCourseIds` (<= 80) are bounded and element-type-checked on index 0 when non-empty.
8. **Secure List Queries**: `allow list` on `/members` enforces `resource.data.uid == request.auth.uid || isBootstrappedAdmin()` without any `get()` or `exists()` lookups.

## 2. The "Dirty Dozen" Payloads (Must Return `PERMISSION_DENIED`)
1. **Unauthenticated Member Read/Write**: Unauthenticated user tries `get(/members/user1)` or `create(/members/user1)`.
2. **Cross-User PII Read**: Verified user `userA` tries `get(/members/userB)` to scrape another member's email.
3. **Unverified User Write**: Signed-in user with `email_verified: false` tries to `create(/members/userA)`.
4. **Email Spoofing Admin Read**: User with token `{ email: "d25b.truongduoc@gmail.com", email_verified: false }` tries `list(/members)` or `get(/app_config/sheets_sync)`.
5. **Identity Spoofing on Create**: Verified `userA` tries `create(/members/userA)` with payload `{ uid: "userB", ... }`.
6. **Shadow / Ghost Field Injection**: Verified `userA` creates or updates `/members/userA` with extra ghost fields such as `isAdmin: true`, `displayName`, `studentId`, or `classGroup`.
7. **Self-Assigned Admin Escalation**: Verified `userA` tries `create(/admins/userA)` with `{ uid: "userA", role: "admin" }`.
8. **Consent Bypass**: Verified `userA` tries `create(/members/userA)` with `consentAccepted: false`.
9. **Immutable Field Tampering**: Verified `userA` tries `update(/members/userA)` changing `createdAt`, `uid`, or `authProvider`.
10. **Client Timestamp Forgery**: Verified `userA` creates/updates `/members/userA` with `updatedAt: new Date("2020-01-01")` instead of `request.time`.
11. **Array / Resource Poisoning (Denial of Wallet)**: Verified `userA` updates `/members/userA` with `completedDeadlineIds` containing 200 items (> 150) or `email` > 150 chars, or invalid doc ID `userA$bad`.
12. **Blanket List Scraping / Config Tampering**: Verified `userA` (non-admin) executes `list(/members)` without `where('uid', '==', 'userA')` or tries `write(/app_config/sheets_sync)`.
