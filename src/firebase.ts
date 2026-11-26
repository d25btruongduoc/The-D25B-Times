import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  Firestore,
  getDocFromServer,
  getFirestore,
} from 'firebase/firestore';

interface FirebaseRuntimeConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

export const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
export const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let initPromise: Promise<{ app: FirebaseApp; auth: Auth; db: Firestore }> | null = null;

// Strictly in-memory OAuth access token caches (never persisted to localStorage/sessionStorage)
let cachedSheetsAccessToken: string | null = null;
let cachedDriveAccessToken: string | null = null;

export function getCachedSheetsAccessToken(): string | null {
  return cachedSheetsAccessToken;
}

export function clearCachedSheetsAccessToken(): void {
  cachedSheetsAccessToken = null;
}

export function getCachedDriveAccessToken(): string | null {
  return cachedDriveAccessToken;
}

export function clearCachedDriveAccessToken(): void {
  cachedDriveAccessToken = null;
}

function cleanEnvValue(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^["']|["']$/g, '').trim();
}

async function loadFirebaseRuntimeConfig(): Promise<FirebaseRuntimeConfig> {
  const envKey = cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY);
  const envProjectId = cleanEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID);
  const envAppId = cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID);
  const envAuthDomain = cleanEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);

  if (envKey && envProjectId && envAppId && envAuthDomain) {
    return {
      apiKey: envKey,
      projectId: envProjectId,
      appId: envAppId,
      authDomain: envAuthDomain,
      firestoreDatabaseId: cleanEnvValue(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID),
      storageBucket: cleanEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
      messagingSenderId: cleanEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    };
  }

  const res = await fetch('/api/firebase-config', { cache: 'no-store' });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    throw new Error(
      'Chưa có cấu hình Firebase cho bản tĩnh. Hãy thêm biến VITE_FIREBASE_* hoặc chạy kèm máy chủ.'
    );
  }
  return (await res.json()) as FirebaseRuntimeConfig;
}

async function testConnection(db: Firestore): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export async function ensureFirebaseReady(): Promise<{
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}> {
  if (appInstance && authInstance && dbInstance) {
    return { app: appInstance, auth: authInstance, db: dbInstance };
  }
  if (!initPromise) {
    initPromise = (async () => {
      const cfg = await loadFirebaseRuntimeConfig();
      const existingApps = getApps();
      const app =
        existingApps.length > 0
          ? existingApps[0]
          : initializeApp({
              apiKey: cfg.apiKey,
              authDomain: cfg.authDomain,
              projectId: cfg.projectId,
              appId: cfg.appId,
              storageBucket: cfg.storageBucket || undefined,
              messagingSenderId: cfg.messagingSenderId || undefined,
            });

      const db = cfg.firestoreDatabaseId
        ? getFirestore(app, cfg.firestoreDatabaseId)
        : getFirestore(app);
      const auth = getAuth(app);

      onAuthStateChanged(auth, (user) => {
        if (!user) {
          cachedSheetsAccessToken = null;
          cachedDriveAccessToken = null;
        }
      });

      appInstance = app;
      authInstance = auth;
      dbInstance = db;

      void testConnection(db);
      return { app, auth, db };
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    throw new Error('Firebase Auth chưa được khởi tạo.');
  }
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (!dbInstance) {
    throw new Error('Firestore chưa được khởi tạo.');
  }
  return dbInstance;
}

export function subscribeAuthState(callback: (user: User | null) => void): () => void {
  let active = true;
  let unsubscribeInner: (() => void) | null = null;

  void ensureFirebaseReady()
    .then(({ auth }) => {
      if (!active) return;
      unsubscribeInner = onAuthStateChanged(auth, callback);
    })
    .catch((err) => {
      console.error('Firebase initialization failed:', err);
    });

  return () => {
    active = false;
    if (unsubscribeInner) unsubscribeInner();
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function signInWithGoogleMember(options?: {
  requestDriveScope?: boolean;
  requestSheetsScope?: boolean;
}): Promise<User> {
  const { auth } = await ensureFirebaseReady();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  if (options?.requestDriveScope) {
    provider.addScope(DRIVE_FILE_SCOPE);
  }
  if (options?.requestSheetsScope) {
    provider.addScope(SHEETS_SCOPE);
  }
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential?.accessToken) {
    if (options?.requestDriveScope) {
      cachedDriveAccessToken = credential.accessToken;
    }
    if (options?.requestSheetsScope) {
      cachedSheetsAccessToken = credential.accessToken;
    }
  }
  return result.user;
}

export async function authorizeGoogleDriveToken(): Promise<string> {
  const { auth } = await ensureFirebaseReady();
  const provider = new GoogleAuthProvider();
  provider.addScope(DRIVE_FILE_SCOPE);
  provider.setCustomParameters({
    prompt: 'consent',
    ...(auth.currentUser?.email ? { login_hint: auth.currentUser.email } : {}),
  });
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;
  if (!token) {
    throw new Error('Không nhận được mã truy cập Google Drive. Vui lòng thử lại.');
  }
  cachedDriveAccessToken = token;
  return token;
}

export async function authorizeGoogleSheetsToken(): Promise<string> {
  const { auth } = await ensureFirebaseReady();
  const provider = new GoogleAuthProvider();
  provider.addScope(SHEETS_SCOPE);
  provider.setCustomParameters({
    prompt: 'consent',
    ...(auth.currentUser?.email ? { login_hint: auth.currentUser.email } : {}),
  });
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;
  if (!token) {
    throw new Error('Không nhận được mã truy cập Google Sheets. Vui lòng thử lại.');
  }
  cachedSheetsAccessToken = token;
  return token;
}

export async function registerWithEmailMember(
  email: string,
  password: string
): Promise<User> {
  const { auth } = await ensureFirebaseReady();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await sendEmailVerification(credential.user);
  return credential.user;
}

export async function signInWithEmailMember(email: string, password: string): Promise<User> {
  const { auth } = await ensureFirebaseReady();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function resendVerificationEmailForCurrentUser(): Promise<void> {
  const { auth } = await ensureFirebaseReady();
  if (!auth.currentUser) {
    throw new Error('Bạn chưa đăng nhập.');
  }
  await sendEmailVerification(auth.currentUser);
}

export async function refreshCurrentUserVerification(): Promise<User | null> {
  const { auth } = await ensureFirebaseReady();
  if (!auth.currentUser) return null;
  await reload(auth.currentUser);
  await auth.currentUser.getIdToken(true);
  return auth.currentUser;
}

export async function signOutMember(): Promise<void> {
  const { auth } = await ensureFirebaseReady();
  cachedSheetsAccessToken = null;
  cachedDriveAccessToken = null;
  await signOut(auth);
}

export function formatFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký. Hãy chuyển sang tab Đăng nhập hoặc dùng Google.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không hợp lệ.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu. Vui lòng nhập tối thiểu 6 ký tự.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không đúng.';
    case 'auth/popup-closed-by-user':
      return 'Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.';
    case 'auth/popup-blocked':
      return 'Trình duyệt đang chặn cửa sổ bật lên (popup). Hãy cho phép popup rồi thử lại.';
    case 'auth/account-exists-with-different-credential':
      return 'Email này đã liên kết với phương thức đăng nhập khác.';
    case 'auth/operation-not-allowed':
      return 'Phương thức đăng nhập này chưa được bật trong Firebase Console của dự án. Quản trị viên cần bật nhà cung cấp này trong Authentication > Sign-in method.';
    case 'auth/invalid-api-key':
      return 'Firebase API Key không hợp lệ hoặc đã bị thu hồi. Cần kiểm tra lại giá trị VITE_FIREBASE_API_KEY trong cài đặt triển khai hoặc tạo lại Web API Key trong Firebase / Google Cloud Console.';
    case 'auth/unauthorized-domain':
      return 'Tên miền hiện tại chưa được cấp phép đăng nhập. Cần thêm tên miền vào Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/too-many-requests':
      return 'Bạn đã thử quá nhiều lần. Vui lòng đợi ít phút rồi thử lại.';
    default:
      return error instanceof Error ? error.message : 'Đã xảy ra lỗi xác thực. Vui lòng thử lại.';
  }
}
