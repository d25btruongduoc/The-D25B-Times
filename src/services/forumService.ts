import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import {
  ensureFirebaseReady,
  handleFirestoreError,
  OperationType,
} from '../firebase';

export type ForumCategory = 'study' | 'resources' | 'chat' | 'team';

export interface ForumPost {
  postId: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  category: ForumCategory;
  title: string;
  content: string;
  attachmentUrl: string;
  visibility: 'public';
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface ForumComment {
  commentId: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  visibility: 'public';
  createdAt?: Timestamp | null;
}

export interface ForumChatMessage {
  messageId: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  visibility: 'public';
  createdAt?: Timestamp | null;
}

function makeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function sanitizeHttpsUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const u = new URL(trimmed);
    if (u.protocol === 'https:' || u.protocol === 'http:') {
      return u.toString().slice(0, 300);
    }
    return '';
  } catch {
    return '';
  }
}

export function subscribeForumPosts(
  onData: (posts: ForumPost[]) => void,
  onError?: (err: unknown) => void
): () => void {
  let active = true;
  let unsubscribeInner: (() => void) | null = null;

  void ensureFirebaseReady()
    .then(({ db }) => {
      if (!active) return;
      const q = query(
        collection(db, 'forum_posts'),
        where('visibility', '==', 'public'),
        limit(100)
      );
      unsubscribeInner = onSnapshot(
        q,
        (snap) => {
          const items = snap.docs
            .map((d) => d.data() as ForumPost)
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now()));
          onData(items);
        },
        (error) => {
          if (onError) onError(error);
          else handleFirestoreError(error, OperationType.LIST, 'forum_posts');
        }
      );
    })
    .catch((err) => onError?.(err));

  return () => {
    active = false;
    if (unsubscribeInner) unsubscribeInner();
  };
}

export async function createForumPost(params: {
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  category: ForumCategory;
  title: string;
  content: string;
  attachmentUrl?: string;
}): Promise<string> {
  const { db } = await ensureFirebaseReady();
  const postId = makeDocId('post');
  const path = `forum_posts/${postId}`;
  try {
    await setDoc(doc(db, 'forum_posts', postId), {
      postId,
      authorUid: params.authorUid,
      authorName: params.authorName.trim().slice(0, 60) || 'Thành viên D25',
      authorAvatar: (params.authorAvatar || '').slice(0, 65000),
      category: params.category,
      title: params.title.trim().slice(0, 140),
      content: params.content.trim().slice(0, 3000),
      attachmentUrl: sanitizeHttpsUrl(params.attachmentUrl || ''),
      visibility: 'public',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return postId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteForumPost(postId: string): Promise<void> {
  const { db } = await ensureFirebaseReady();
  const path = `forum_posts/${postId}`;
  try {
    await deleteDoc(doc(db, 'forum_posts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribePostComments(
  postId: string,
  onData: (comments: ForumComment[]) => void,
  onError?: (err: unknown) => void
): () => void {
  let active = true;
  let unsubscribeInner: (() => void) | null = null;

  void ensureFirebaseReady()
    .then(({ db }) => {
      if (!active) return;
      const q = query(
        collection(db, 'forum_posts', postId, 'comments'),
        where('visibility', '==', 'public'),
        limit(100)
      );
      unsubscribeInner = onSnapshot(
        q,
        (snap) => {
          const items = snap.docs
            .map((d) => d.data() as ForumComment)
            .sort((a, b) => (a.createdAt?.toMillis?.() ?? Date.now()) - (b.createdAt?.toMillis?.() ?? Date.now()));
          onData(items);
        },
        (error) => {
          if (onError) onError(error);
          else handleFirestoreError(error, OperationType.LIST, `forum_posts/${postId}/comments`);
        }
      );
    })
    .catch((err) => onError?.(err));

  return () => {
    active = false;
    if (unsubscribeInner) unsubscribeInner();
  };
}

export async function createPostComment(params: {
  postId: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  content: string;
}): Promise<string> {
  const { db } = await ensureFirebaseReady();
  const commentId = makeDocId('cmt');
  const path = `forum_posts/${params.postId}/comments/${commentId}`;
  try {
    await setDoc(doc(db, 'forum_posts', params.postId, 'comments', commentId), {
      commentId,
      postId: params.postId,
      authorUid: params.authorUid,
      authorName: params.authorName.trim().slice(0, 60) || 'Thành viên D25',
      authorAvatar: (params.authorAvatar || '').slice(0, 65000),
      content: params.content.trim().slice(0, 1000),
      visibility: 'public',
      createdAt: serverTimestamp(),
    });
    return commentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deletePostComment(postId: string, commentId: string): Promise<void> {
  const { db } = await ensureFirebaseReady();
  const path = `forum_posts/${postId}/comments/${commentId}`;
  try {
    await deleteDoc(doc(db, 'forum_posts', postId, 'comments', commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeForumChat(
  onData: (messages: ForumChatMessage[]) => void,
  onError?: (err: unknown) => void
): () => void {
  let active = true;
  let unsubscribeInner: (() => void) | null = null;

  void ensureFirebaseReady()
    .then(({ db }) => {
      if (!active) return;
      const q = query(
        collection(db, 'forum_chat'),
        where('visibility', '==', 'public'),
        limit(100)
      );
      unsubscribeInner = onSnapshot(
        q,
        (snap) => {
          const items = snap.docs
            .map((d) => d.data() as ForumChatMessage)
            .sort((a, b) => (a.createdAt?.toMillis?.() ?? Date.now()) - (b.createdAt?.toMillis?.() ?? Date.now()));
          onData(items);
        },
        (error) => {
          if (onError) onError(error);
          else handleFirestoreError(error, OperationType.LIST, 'forum_chat');
        }
      );
    })
    .catch((err) => onError?.(err));

  return () => {
    active = false;
    if (unsubscribeInner) unsubscribeInner();
  };
}

export async function sendForumChatMessage(params: {
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  text: string;
}): Promise<string> {
  const { db } = await ensureFirebaseReady();
  const messageId = makeDocId('msg');
  const path = `forum_chat/${messageId}`;
  try {
    await setDoc(doc(db, 'forum_chat', messageId), {
      messageId,
      authorUid: params.authorUid,
      authorName: params.authorName.trim().slice(0, 60) || 'Thành viên D25',
      authorAvatar: (params.authorAvatar || '').slice(0, 65000),
      text: params.text.trim().slice(0, 800),
      visibility: 'public',
      createdAt: serverTimestamp(),
    });
    return messageId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteForumChatMessage(messageId: string): Promise<void> {
  const { db } = await ensureFirebaseReady();
  const path = `forum_chat/${messageId}`;
  try {
    await deleteDoc(doc(db, 'forum_chat', messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
