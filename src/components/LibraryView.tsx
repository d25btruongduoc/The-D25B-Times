import { BookOpen, Download, ExternalLink, Mail } from 'lucide-react';
import {
  CONTACTS,
  EXTERNAL_STUDY_TOOLS,
  LIBRARY_RESOURCES,
} from '../data/d25bData';
import { HoverPreviewCard } from './HoverMiniPreview';

export function LibraryView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-800">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            Thư viện D25B – ĐHYD TP.HCM
          </p>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-slate-50">
            Kho đầu sách chính thống &amp; Góc chia sẻ học thuật
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Chào mừng quý độc giả đến với Thư viện D25B – ĐHYD TP.HCM, nơi quy tụ những đầu sách uy tín dưới sự định hướng của Thư viện Đại học Y Dược cùng các trang báo, mô phỏng và nguồn học liệu quốc tế chính thống.
          </p>
        </div>

        <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          <div className="text-xs text-slate-400">
            <p className="font-medium text-slate-100">Đóng góp đầu sách cho Thư viện D25B:</p>
            <p className="font-mono text-cyan-400 mt-0.5">{CONTACTS.libraryEmail}</p>
          </div>
          <a
            href={`mailto:${CONTACTS.libraryEmail}?subject=Dong%20gop%20tai%20lieu%20Thu%20vien%20D25B`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap shrink-0"
          >
            <Mail className="w-4 h-4" />
            <span>Quyên góp tài liệu</span>
          </a>
        </div>
      </section>

      {/* Bookshelf */}
      <section>
        <div className="pb-4 border-b border-slate-800">
          <p className="text-xs uppercase tracking-widest text-slate-400">Tài liệu lưu hành</p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-slate-50">
            Đầu sách &amp; EBook chuyên ngành
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {LIBRARY_RESOURCES.map((book) => (
            <article
              key={book.title}
              className="bg-[#0E1525] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
                  <BookOpen className="w-4 h-4" />
                  <span>{book.usage}</span>
                </div>
                <h3 className="mt-2 font-heading text-xl font-bold text-slate-50">
                  {book.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{book.author}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-4">
                <HoverPreviewCard url={book.url} label={book.title}>
                  <a
                    href={book.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    <span>Đọc / Xem trên Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </HoverPreviewCard>
                {book.downloadUrl && (
                  <HoverPreviewCard url={book.downloadUrl} label={`${book.title} (PDF)`}>
                    <a
                      href={book.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-slate-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải PDF</span>
                    </a>
                  </HoverPreviewCard>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Góc chia sẻ - tâm sự */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Góc chia sẻ – Tâm sự · Trích nguồn Thầy Nguyễn Thanh Minh
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-slate-50">
              Nền tảng mô phỏng &amp; Video tham khảo quốc tế
            </h2>
          </div>

          <div className="divide-y divide-slate-800 bg-[#0E1525] border border-slate-800 rounded-xl">
            {EXTERNAL_STUDY_TOOLS.map((tool) => (
              <div key={tool.name} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-cyan-400">{tool.tag}</p>
                  <h3 className="mt-1 text-base font-bold text-slate-50">{tool.name}</h3>
                  <p className="mt-1 text-sm text-slate-300 leading-relaxed">{tool.description}</p>
                </div>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-500/30 hover:bg-cyan-400/20 rounded-md whitespace-nowrap shrink-0 self-start sm:self-center"
                >
                  <span>Truy cập</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial Reflection Pull-Quote */}
        <aside className="lg:col-span-5 bg-[#111A2E] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4">
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            Góc suy ngẫm Y – Dược
          </p>
          <blockquote className="py-4 border-y border-slate-700 font-sans italic text-lg text-slate-100 leading-relaxed">
            &ldquo;Quy tắc &lsquo;dùng nó hoặc mất nó&rsquo; — trí nhớ hình thành do tín hiệu mạnh hoặc lặp đi lặp lại nhiều lần. Suy nghĩ tạo nên hành động, hành động tạo nên thói quen, thói quen tạo nên tính cách, tính cách tạo nên số phận.&rdquo;
          </blockquote>
          <p className="text-sm text-slate-300 leading-relaxed">
            Khi hiểu cơ chế hoạt động của não bộ dưới góc nhìn y học, các bạn sẽ tự biết cách điều chỉnh nhịp học tập và cuộc sống lành mạnh: giữ tâm trí hướng về những điều tích cực, ôn tập lặp lại có chủ đích và đồng hành cùng nhau suốt 5 năm Trường Dược.
          </p>
          <p className="text-xs font-medium text-slate-400">
            — Trích chia sẻ từ Thầy Nguyễn Thanh Minh &amp; Lớp trưởng Nguyễn Minh Huy
          </p>
        </aside>
      </section>
    </div>
  );
}
