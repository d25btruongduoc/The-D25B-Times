import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
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
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

interface FirebaseAppletConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

const firebaseConfig = firebaseConfigJson as FirebaseAppletConfig;

const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

export const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

// Strictly in-memory OAuth access token cache (never persisted to localStorage/sessionStorage)
let cachedSheetsAccessToken: string | null = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedSheetsAccessToken = null;
  }
});

export function getCachedSheetsAccessToken(): string | null {
  return cachedSheetsAccessToken;
}

export function clearCachedSheetsAccessToken(): void {
  cachedSheetsAccessToken = null;
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
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

export async function signInWithGoogleMember(requestSheetsScope = false): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  if (requestSheetsScope) {
    provider.addScope(SHEETS_SCOPE);
  }
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential?.accessToken && requestSheetsScope) {
    cachedSheetsAccessToken = credential.accessToken;
  }
  return result.user;
}

export async function authorizeGoogleSheetsToken(): Promise<string> {
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

export async function signInWithFacebookMember(): Promise<User> {
  const provider = new FacebookAuthProvider();
  provider.addScope('email');
  provider.addScope('public_profile');
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function registerWithEmailMember(
  email: string,
  password: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await sendEmailVerification(credential.user);
  return credential.user;
}

export async function signInWithEmailMember(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function resendVerificationEmailForCurrentUser(): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Bạn chưa đăng nhập.');
  }
  await sendEmailVerification(auth.currentUser);
}

export async function refreshCurrentUserVerification(): Promise<User | null> {
  if (!auth.currentUser) return null;
  await reload(auth.currentUser);
  await auth.currentUser.getIdToken(true);
  return auth.currentUser;
}

export async function signOutMember(): Promise<void> {
  cachedSheetsAccessToken = null;
  await signOut(auth);
}

export function formatFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký. Hãy chuyển sang tab Đăng nhập hoặc dùng Google/Facebook.';
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
      return 'Email này đã liên kết với phương thức đăng nhập khác (ví dụ Google hoặc Email/Mật khẩu).';
    case 'auth/operation-not-allowed':
      return 'Phương thức đăng nhập này chưa được bật trong Firebase Console của dự án. Quản trị viên cần bật nhà cung cấp này trong Authentication > Sign-in method.';
    case 'auth/too-many-requests':
      return 'Bạn đã thử quá nhiều lần. Vui lòng đợi ít phút rồi thử lại.';
    default:
      return error instanceof Error ? error.message : 'Đã xảy ra lỗi xác thực. Vui lòng thử lại.';
  }
}
