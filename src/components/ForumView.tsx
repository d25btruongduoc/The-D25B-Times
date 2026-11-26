import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ExternalLink,
  MessageCircle,
  MessageSquarePlus,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import {
  createForumPost,
  createPostComment,
  deleteForumChatMessage,
  deleteForumPost,
  deletePostComment,
  ForumCategory,
  ForumChatMessage,
  ForumComment,
  ForumPost,
  sendForumChatMessage,
  subscribeForumChat,
  subscribeForumPosts,
  subscribePostComments,
} from '../services/forumService';
import {
  getMemberDisplayLabel,
  isVerifiedAdminEmail,
  MemberProfile,
} from '../services/memberService';

interface ForumViewProps {
  user: User | null;
  profile: MemberProfile | null;
  onOpenMemberModal: () => void;
}

const CATEGORY_META: Record<
  ForumCategory,
  { label: string; badge: string }
> = {
  study: {
    label: 'Hỏi đáp học tập',
    badge: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/35',
  },
  resources: {
    label: 'Chia sẻ tài liệu',
    badge: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/35',
  },
  chat: {
    label: 'Góc tâm sự D25',
    badge: 'bg-violet-400/15 text-violet-300 border-violet-400/35',
  },
  team: {
    label: 'Tìm nhóm / Thực tập',
    badge: 'bg-amber-400/15 text-amber-300 border-amber-400/35',
  },
};

function AvatarChip({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="w-8 h-8 rounded-full object-cover border border-slate-700 bg-slate-900 shrink-0"
      />
    );
  }
  return (
    <span className="w-8 h-8 rounded-full bg-cyan-400/15 border border-cyan-400/35 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function formatTime(ts?: { toDate: () => Date } | null): string {
  if (!ts) return 'Vừa xong';
  try {
    return ts.toDate().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return 'Vừa xong';
  }
}

function PostCommentThread({
  postId,
  user,
  authorName,
  authorAvatar,
  isAdmin,
  onOpenMemberModal,
}: {
  postId: string;
  user: User | null;
  authorName: string;
  authorAvatar: string;
  isAdmin: boolean;
  onOpenMemberModal: () => void;
}) {
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = subscribePostComments(postId, setComments, () => {
      // ignore transient errors
    });
    return () => unsub();
  }, [postId]);

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !user.emailVerified || !text.trim() || busy) return;
    setBusy(true);
    try {
      await createPostComment({
        postId,
        authorUid: user.uid,
        authorName,
        authorAvatar,
        content: text.trim(),
      });
      setText('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500">Chưa có bình luận nào. Hãy mở đầu cuộc trao đổi!</p>
        ) : (
          comments.map((c) => {
            const canDelete = Boolean(user && (user.uid === c.authorUid || isAdmin));
            return (
              <div
                key={c.commentId}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#0B1120] border border-slate-800/80"
              >
                <AvatarChip name={c.authorName} avatar={c.authorAvatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {c.authorName}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatTime(c.createdAt)}
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void deletePostComment(postId, c.commentId)}
                          aria-label="Xóa bình luận"
                          className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {user && user.emailVerified ? (
        <form onSubmit={handleComment} className="flex items-center gap-2">
          <input
            type="text"
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết bình luận phản hồi..."
            className="flex-1 px-3 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!text.trim() || busy}
            className="px-3 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 text-xs font-semibold cursor-pointer"
          >
            Gửi
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={onOpenMemberModal}
          className="text-xs text-cyan-400 hover:underline cursor-pointer"
        >
          Đăng nhập &amp; xác minh email để tham gia bình luận
        </button>
      )}
    </div>
  );
}

export function ForumView({
  user,
  profile,
  onOpenMemberModal,
}: ForumViewProps) {
  const [activeMode, setActiveMode] = useState<'posts' | 'chat'>('posts');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ForumCategory>('all');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [chatMessages, setChatMessages] = useState<ForumChatMessage[]>([]);
  const [expandedPostIds, setExpandedPostIds] = useState<string[]>([]);

  // Composer state
  const [showComposer, setShowComposer] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<ForumCategory>('study');
  const [postAttachmentUrl, setPostAttachmentUrl] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isAdmin = isVerifiedAdminEmail(user?.email, user?.emailVerified);
  const myDisplayName = getMemberDisplayLabel(profile, user?.email, user?.displayName);
  const myAvatar = profile?.avatarUrl || user?.photoURL || '';

  useEffect(() => {
    const unsubPosts = subscribeForumPosts(setPosts, (err) => {
      setErrorMsg(
        err instanceof Error ? err.message : 'Không thể tải danh sách bài viết.'
      );
    });
    const unsubChat = subscribeForumChat(setChatMessages, () => {
      // ignore transient error
    });
    return () => {
      unsubPosts();
      unsubChat();
    };
  }, []);

  useEffect(() => {
    if (activeMode === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeMode]);

  const visiblePosts = useMemo(() => {
    if (categoryFilter === 'all') return posts;
    return posts.filter((p) => p.category === categoryFilter);
  }, [posts, categoryFilter]);

  const toggleExpandPost = (postId: string) => {
    setExpandedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handlePublishPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !user.emailVerified) {
      setErrorMsg('Vui lòng đăng nhập và xác minh email trước khi đăng bài.');
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) return;

    setBusy(true);
    setErrorMsg(null);
    try {
      const createdId = await createForumPost({
        authorUid: user.uid,
        authorName: myDisplayName,
        authorAvatar: myAvatar,
        category: postCategory,
        title: postTitle,
        content: postContent,
        attachmentUrl: postAttachmentUrl,
      });
      setPostTitle('');
      setPostContent('');
      setPostAttachmentUrl('');
      setShowComposer(false);
      setExpandedPostIds((prev) => [createdId, ...prev]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể đăng bài viết.');
    } finally {
      setBusy(false);
    }
  };

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !user.emailVerified || !chatInput.trim() || busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      await sendForumChatMessage({
        authorUid: user.uid,
        authorName: myDisplayName,
        authorAvatar: myAvatar,
        text: chatInput,
      });
      setChatInput('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể gửi tin nhắn.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Mode Switch */}
      <div className="pb-5 border-b border-slate-800 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            Cộng đồng The D25B Times
          </p>
          <h1 className="mt-1 font-heading text-3xl sm:text-4xl font-bold text-slate-50">
            Diễn đàn &amp; Trò chuyện
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Đăng bài chia sẻ tài liệu, hỏi đáp học phần hoặc trò chuyện trực tiếp cùng các thành viên khác.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-[#0E1525] p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveMode('posts')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeMode === 'posts'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Bài viết ({posts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('chat')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeMode === 'chat'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Trò chuyện chung ({chatMessages.length})</span>
            </button>
          </div>

          {activeMode === 'posts' && (
            <button
              type="button"
              onClick={() => {
                if (!user || !user.emailVerified) {
                  onOpenMemberModal();
                  return;
                }
                setShowComposer((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{showComposer ? 'Đóng khung viết' : 'Đăng bài mới'}</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs sm:text-sm text-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Mode 1: Forum Posts */}
      {activeMode === 'posts' && (
        <div className="space-y-5">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-cyan-400/15 border-cyan-400 text-cyan-300'
                  : 'bg-[#0E1525] border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả chủ đề
            </button>
            {(Object.keys(CATEGORY_META) as ForumCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-cyan-400/15 border-cyan-400 text-cyan-300'
                    : 'bg-[#0E1525] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {CATEGORY_META[cat].label}
              </button>
            ))}
          </div>

          {/* Post Composer */}
          {showComposer && user && user.emailVerified && (
            <form
              onSubmit={handlePublishPost}
              className="bg-[#0E1525] border border-cyan-500/40 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AvatarChip name={myDisplayName} avatar={myAvatar} />
                  <div>
                    <p className="text-xs font-semibold text-slate-100">{myDisplayName}</p>
                    <p className="text-[11px] text-slate-400">Đăng bài lên Diễn đàn công khai</p>
                  </div>
                </div>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as ForumCategory)}
                  className="px-3 py-1.5 rounded-lg bg-[#0B1120] border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  {(Object.keys(CATEGORY_META) as ForumCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_META[cat].label}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                required
                maxLength={140}
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Tiêu đề bài viết..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B1120] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />

              <textarea
                rows={4}
                required
                maxLength={3000}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Nội dung chia sẻ, câu hỏi học phần hoặc thảo luận..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B1120] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />

              <input
                type="url"
                maxLength={300}
                value={postAttachmentUrl}
                onChange={(e) => setPostAttachmentUrl(e.target.value)}
                placeholder="Link tài liệu / ảnh đính kèm (tuỳ chọn, https://...)"
                className="w-full px-3.5 py-2 rounded-lg bg-[#0B1120] border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="px-4 py-2 rounded-lg bg-[#131C31] border border-slate-700 text-xs font-medium text-slate-300 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{busy ? 'Đang đăng...' : 'Đăng bài'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Posts Feed */}
          {visiblePosts.length === 0 ? (
            <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-10 text-center space-y-2">
              <p className="text-base font-semibold text-slate-200">
                Chưa có bài viết nào trong mục này
              </p>
              <p className="text-xs text-slate-400">
                Hãy là người đầu tiên đăng bài đặt câu hỏi hoặc chia sẻ tài liệu cho mọi người!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visiblePosts.map((post) => {
                const cat = CATEGORY_META[post.category] || CATEGORY_META.study;
                const isExpanded = expandedPostIds.includes(post.postId);
                const canDelete = Boolean(user && (user.uid === post.authorUid || isAdmin));

                return (
                  <article
                    key={post.postId}
                    className="bg-[#0E1525] border border-slate-800 rounded-2xl p-5 transition-colors hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarChip name={post.authorName} avatar={post.authorAvatar} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-100 truncate">
                              {post.authorName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${cat.badge}`}
                            >
                              {cat.label}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-500">
                            {formatTime(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void deleteForumPost(post.postId)}
                          aria-label="Xóa bài viết"
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <h2 className="mt-3.5 font-heading text-lg font-bold text-slate-50">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                      {post.content}
                    </p>

                    {post.attachmentUrl && (
                      <a
                        href={post.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1120] border border-slate-700 hover:border-cyan-400/60 text-xs text-cyan-300 transition-colors"
                      >
                        <span className="truncate max-w-xs sm:max-w-md">{post.attachmentUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleExpandPost(post.postId)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Thu gọn thảo luận' : 'Xem & viết bình luận'}</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <PostCommentThread
                        postId={post.postId}
                        user={user}
                        authorName={myDisplayName}
                        authorAvatar={myAvatar}
                        isAdmin={isAdmin}
                        onOpenMemberModal={onOpenMemberModal}
                      />
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Real-time Community Chat Room */}
      {activeMode === 'chat' && (
        <div className="bg-[#0E1525] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[560px]">
          <div className="px-5 py-3.5 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Phòng trò chuyện trực tiếp D25
              </h2>
              <p className="text-[11px] text-slate-400">
                Tin nhắn đồng bộ tức thời cho tất cả thành viên đang trực tuyến
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-300">Live Firestore</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#070B14]">
            {chatMessages.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">
                Phòng chat đang yên ắng. Hãy gửi lời chào mọi người!
              </p>
            ) : (
              chatMessages.map((msg) => {
                const isMine = Boolean(user && user.uid === msg.authorUid);
                const canDelete = Boolean(user && (isMine || isAdmin));
                return (
                  <div
                    key={msg.messageId}
                    className={`flex items-start gap-2.5 ${
                      isMine ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <AvatarChip name={msg.authorName} avatar={msg.authorAvatar} />
                    <div
                      className={`max-w-[78%] rounded-xl px-3.5 py-2.5 space-y-1 ${
                        isMine
                          ? 'bg-cyan-400/15 border border-cyan-400/40 text-slate-100'
                          : 'bg-[#0E1525] border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold text-cyan-300">
                          {msg.authorName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500">
                            {formatTime(msg.createdAt)}
                          </span>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => void deleteForumChatMessage(msg.messageId)}
                              aria-label="Xóa tin nhắn"
                              className="text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {user && user.emailVerified ? (
            <form
              onSubmit={handleSendChat}
              className="p-3.5 bg-[#0B1120] border-t border-slate-800 flex items-center gap-2.5"
            >
              <AvatarChip name={myDisplayName} avatar={myAvatar} />
              <input
                type="text"
                maxLength={800}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Nhắn với tư cách ${myDisplayName}...`}
                className="flex-1 px-3.5 py-2 rounded-lg bg-[#070B14] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || busy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 text-xs font-semibold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </form>
          ) : (
            <div className="p-3.5 bg-[#0B1120] border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={onOpenMemberModal}
                className="text-xs font-semibold text-cyan-400 hover:underline cursor-pointer"
              >
                Đăng nhập &amp; xác minh email để nhắn tin trong phòng trò chuyện
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
