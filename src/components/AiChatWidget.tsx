import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  MessageCircle,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { HandbookTab, NavSection, SearchIndexItem } from '../data/d25bData';
import {
  findRelatedLinks,
  isReasoningQuery,
  tryResolveQueryLocally,
} from '../utils/localKnowledgeSearch';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: 'local' | 'ai';
  originalQuery?: string;
  relatedItems?: SearchIndexItem[];
}

interface QuotaInfo {
  remaining: number;
  limit: number;
}

interface AiChatWidgetProps {
  onNavigate: (
    section: NavSection,
    options?: { courseId?: string; handbookTab?: HandbookTab }
  ) => void;
}

const STARTER_PROMPTS = [
  'Quy trình phúc khảo điểm thi & chỗ nộp đơn?',
  'Cú pháp chuyển khoản BHYT 9 tháng và số TK?',
  'So sánh quy định nộp bài HPT1 và PTN 2?',
  'Lịch học HK2 lớp D25B & gửi xe UMPSP?',
];

function renderFormattedLines(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const urlMatch = line.match(/(https?:\/\/[^\s)]+)/g);
    if (!urlMatch) {
      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>
          {line}
        </p>
      );
    }

    const parts = line.split(/(https?:\/\/[^\s)]+)/g);
    return (
      <p key={idx} className="leading-relaxed break-words">
        {parts.map((part, pIdx) => {
          if (part.startsWith('http://') || part.startsWith('https://')) {
            return (
              <a
                key={pIdx}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium text-cyan-300 hover:text-cyan-200 break-all"
              >
                {part}
              </a>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </p>
    );
  });
}

export function AiChatWidget({ onNavigate }: AiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus(), 60);
    fetch('/api/ai-quota')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { remaining?: number; limit?: number } | null) => {
        if (
          data &&
          typeof data.remaining === 'number' &&
          typeof data.limit === 'number'
        ) {
          setQuota({ remaining: data.remaining, limit: data.limit });
        }
      })
      .catch(() => {
        // non-blocking
      });
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (rawText: string, forceAi = false) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: forceAi ? `Phân tích sâu bằng AI: ${trimmed}` : trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!forceAi) {
      setInput('');
    }
    setErrorMsg(null);

    // Try zero-token local search first; only auto-call AI if query explicitly asks for reasoning
    if (!forceAi) {
      const localRes = tryResolveQueryLocally(trimmed);
      if (localRes.handledLocally) {
        const localMsg: ChatMessage = {
          id: `l-${Date.now()}`,
          role: 'assistant',
          source: 'local',
          originalQuery: trimmed,
          text: localRes.answerText,
          relatedItems: localRes.relatedItems,
        };
        setMessages((prev) => [...prev, localMsg]);
        return;
      }

      if (!isReasoningQuery(trimmed)) {
        const fallbackMsg: ChatMessage = {
          id: `l-${Date.now()}`,
          role: 'assistant',
          source: 'local',
          originalQuery: trimmed,
          text:
            localRes.relatedItems.length > 0
              ? 'Hệ thống đã tự dò các mục gần khớp bên dưới mà **chưa tốn lượt AI**. Nếu vẫn cần phân tích sâu hơn, bạn bấm nút **Hỏi AI phân tích thêm** bên dưới.'
              : 'Chưa thấy từ khóa khớp chính xác trong kho nội bộ (không tốn lượt AI). Bạn có thể thử từ khóa ngắn gọn hơn (VD: `BHYT`, `phúc khảo`, `D25B`, `gửi xe`, `HPT1`) hoặc bấm **Hỏi AI phân tích thêm**.',
          relatedItems: localRes.relatedItems,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          'Trang đang chạy ở chế độ tĩnh (như GitHub Pages) nên chưa có máy chủ backend cho Gemini AI. Bộ tìm kiếm nội bộ không tốn lượt vẫn hoạt động bình thường!'
        );
      }

      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        quota?: QuotaInfo;
      };

      if (data.quota) {
        setQuota({
          remaining: data.quota.remaining,
          limit: data.quota.limit,
        });
      }

      if (!res.ok || !data.reply) {
        throw new Error(
          data.error || 'Không thể kết nối Quản trang AI lúc này. Vui lòng thử lại.'
        );
      }

      const relatedItems = findRelatedLinks(`${trimmed} ${data.reply}`);
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        source: 'ai',
        text: data.reply,
        relatedItems,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Đã có lỗi khi phân tích yêu cầu. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input, false);
  };

  const quickLocalSuggestions = useMemo(() => {
    if (!input.trim()) return [];
    return findRelatedLinks(input);
  }, [input]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <section
          aria-label="Quản trang AI của The D25B Times"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[410px] h-[520px] max-h-[75vh] bg-[#0B1120] border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Chat Header */}
          <div className="px-4 py-3 bg-[#0E172A] border-b border-slate-800 text-slate-50 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-sm font-bold leading-tight truncate text-slate-50">
                  Quản trang AI · The D25B Times
                </h2>
                <p className="text-[11px] text-slate-400 truncate">
                  {quota
                    ? `Tự dò nhanh miễn phí · Còn ${quota.remaining}/${quota.limit} lượt AI hôm nay`
                    : 'Tự dò tìm thông tin · AI cho câu hỏi tư duy'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setErrorMsg(null);
                  }}
                  title="Làm mới cuộc trò chuyện"
                  aria-label="Làm mới cuộc trò chuyện"
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng khung chat AI"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#070B14]"
          >
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-[#0E1525] border border-slate-800 rounded-lg p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1.5">
                  <p>
                    Kính chào quý ngài! Tôi là <strong className="text-cyan-300">Quản trang AI của The D25B Times</strong>.
                  </p>
                  <p className="text-xs text-slate-400">
                    Các câu hỏi tra cứu thông tin, lịch học hay quy chế sẽ được hệ thống <strong>tự dò nội bộ (không tốn lượt AI)</strong>. Gemini AI chỉ kích hoạt cho câu hỏi so sánh, phân tích hoặc lập kế hoạch.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    Gợi ý tra cứu nhanh
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendMessage(prompt, false)}
                        className="text-left px-3 py-2 text-xs font-medium text-slate-200 bg-[#0E1525] hover:bg-[#131C31] border border-slate-800 hover:border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <span
                      className={`mb-1 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                        msg.source === 'local'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      }`}
                    >
                      {msg.source === 'local' ? (
                        <>
                          <Search className="w-2.5 h-2.5" />
                          <span>Tra cứu nội bộ · 0 lượt AI</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Phân tích AI</span>
                        </>
                      )}
                    </span>
                  )}

                  <div
                    className={`max-w-[88%] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm space-y-1 ${
                      msg.role === 'user'
                        ? 'bg-cyan-400 text-slate-950 font-medium'
                        : 'bg-[#0E1525] border border-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="leading-relaxed">{msg.text}</p>
                    ) : (
                      renderFormattedLines(msg.text)
                    )}
                  </div>

                  {msg.role === 'assistant' &&
                    msg.source === 'local' &&
                    msg.originalQuery && (
                      <button
                        type="button"
                        disabled={isLoading || (quota !== null && quota.remaining <= 0)}
                        onClick={() => void sendMessage(msg.originalQuery!, true)}
                        className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#131C31] border border-slate-700 hover:border-cyan-400/50 text-[11px] font-medium text-cyan-300 disabled:opacity-40 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Hỏi AI phân tích thêm</span>
                      </button>
                    )}

                  {msg.role === 'assistant' &&
                    msg.relatedItems &&
                    msg.relatedItems.length > 0 && (
                      <div className="mt-2 max-w-[88%] flex flex-col gap-1">
                        <span className="text-[11px] text-slate-400">
                          Mục liên quan trên hệ thống:
                        </span>
                        {msg.relatedItems.map((rel) => (
                          <button
                            key={rel.id}
                            type="button"
                            onClick={() => onNavigate(rel.target.section, rel.target)}
                            className="inline-flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-500/25 hover:bg-cyan-400/20 rounded-md transition-colors text-left cursor-pointer"
                          >
                            <span className="truncate">{rel.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-[#0E1525] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-cyan-300">
                  Đang phân tích bằng Quản trang AI...
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-lg text-xs text-rose-200">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Live Quick Match Strip while typing */}
          {quickLocalSuggestions.length > 0 && (
            <div className="px-3 py-2 bg-[#0E1525] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
              <span className="text-[11px] text-slate-400 shrink-0">Đi tới:</span>
              {quickLocalSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.target.section, item.target)}
                  className="px-2 py-1 text-[11px] font-medium bg-[#131C31] border border-slate-700 rounded text-cyan-300 hover:border-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#0E1525] border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tìm thông tin hoặc hỏi AI tư duy..."
              aria-label="Nhập câu hỏi cho Quản trang AI"
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-[#070B14] border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Gửi tin nhắn"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}

      {/* Bottom-Right Floating Chat Launcher */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Thu gọn Quản trang AI' : 'Mở Quản trang AI D25B'}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14] focus-visible:ring-cyan-400"
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4 shrink-0" />
            <span>Đóng Quản trang AI</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Quản trang AI D25B</span>
          </>
        )}
      </button>
    </div>
  );
}
