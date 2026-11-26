/**
 * Automated unit tests for zero-AI local search routing and daily usage limits.
 * Run: npm run test:chat
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildIndex, normalize, renderHits, routeQuestion, search } from './localSearch.ts';
import { createTtlCache, createUsageLimits } from './usageLimits.ts';

const SECTION_LABELS = {
  contacts: 'Liên hệ',
  courses: 'Học phần',
  deadlines: 'Deadline',
  campusRules: 'Quy định & tiện ích',
};

const index = buildIndex(
  {
    contacts: [
      { name: 'Nguyễn Minh Huy', role: 'Lớp trưởng D25B', zalo: '0888103145' },
      { name: 'Phòng KH-ĐT-ĐN', role: 'Phòng đào tạo', email: 'ree.sp@ump.edu.vn' },
    ],
    courses: [
      {
        name: 'Hóa Phân Tích 1',
        shortCode: 'HPT1',
        semester: 'HK2',
        category: 'Thực hành',
        summary: 'Học phần thực hành định lượng cơ bản.',
        chapters: ['Chuẩn độ acid-base', 'Chuẩn độ oxy hóa khử'],
        links: [{ label: 'Đề cương HPT1', url: 'https://example.com/hpt1.pdf' }],
      },
      {
        name: 'Hóa Lý Dược',
        shortCode: 'HLD',
        semester: 'HK2',
        category: 'Lý thuyết',
        summary: 'Nhiệt động học và động hóa học ứng dụng trong dược.',
        links: [{ label: 'Đề cương HLD', url: 'https://example.com/hld.pdf' }],
      },
      { name: 'Giải phẫu', shortCode: 'GP', semester: 'HK1', summary: 'Cấu trúc cơ thể người.' },
    ],
    deadlines: [
      { title: 'Nộp báo cáo THHPT1', date: '2026-03-20', note: 'Trong vòng 24 giờ sau buổi thực hành' },
      { title: 'Nộp học phí', date: '2026-02-10' },
    ],
    campusRules: [
      {
        title: 'Gửi xe',
        text: 'Từ 01/01/2026 miễn phí 100% gửi xe cho sinh viên khi xuất trình Thẻ SV. Dịp lễ gửi tại Diamond Plaza.',
      },
      { title: 'BHYT', text: 'BHYT đợt 9 tháng, mức đóng 473.850đ. Điền form rồi chuyển khoản.' },
      { title: 'Phúc khảo', text: 'Phúc khảo trong vòng 7 ngày kể từ ngày công bố điểm, nộp tại Phòng KH-ĐT-ĐN.' },
    ],
  },
  SECTION_LABELS
);

describe('normalize', () => {
  test('bỏ dấu tiếng Việt và đ/Đ', () => {
    assert.equal(normalize('Đề cương Hóa Lý Dược!'), 'de cuong hoa ly duoc');
  });
});

describe('routeQuestion', () => {
  test('chào hỏi → trả lời ngay, không cần AI', () => {
    const r = routeQuestion(index, 'Xin chào quản trang');
    assert.equal(r.kind, 'greeting');
  });

  test('cảm ơn → lời đáp lịch sự', () => {
    const r = routeQuestion(index, 'cảm ơn nhé');
    assert.equal(r.kind, 'greeting');
    if (r.kind === 'greeting') assert.match(r.reply, /hân hạnh/);
  });

  test('tra cứu gửi xe → trả lời cục bộ', () => {
    const r = routeQuestion(index, 'Gửi xe ở đâu vậy?');
    assert.equal(r.kind, 'local');
    if (r.kind === 'local') assert.match(r.reply, /Diamond Plaza/);
  });

  test('gõ không dấu vẫn khớp', () => {
    const r = routeQuestion(index, 'gui xe');
    assert.equal(r.kind, 'local');
  });

  test('xin link đề cương → có URL trong câu trả lời', () => {
    const r = routeQuestion(index, 'cho mình link đề cương HPT1');
    assert.equal(r.kind, 'local');
    if (r.kind === 'local') assert.match(r.reply, /https:\/\/example\.com\/hpt1\.pdf/);
  });

  test('tra cứu liên hệ → có số Zalo', () => {
    const r = routeQuestion(index, 'zalo của lớp trưởng');
    assert.equal(r.kind, 'local');
    if (r.kind === 'local') assert.match(r.reply, /0888103145/);
  });

  test('câu hỏi so sánh/tổng hợp → chuyển cho AI', () => {
    const r = routeQuestion(index, 'So sánh Hóa Phân Tích 1 và Hóa Lý Dược');
    assert.equal(r.kind, 'ai');
    if (r.kind === 'ai') assert.equal(r.reason, 'reasoning');
  });

  test('nội dung lạ, không có trong dữ liệu → chuyển cho AI', () => {
    const r = routeQuestion(index, 'quantum chromodynamics lagrangian');
    assert.equal(r.kind, 'ai');
    if (r.kind === 'ai') assert.equal(r.reason, 'no-match');
  });

  test('câu hỏi quá dài → chuyển cho AI', () => {
    const r = routeQuestion(index, 'gửi xe '.repeat(20));
    assert.equal(r.kind, 'ai');
    if (r.kind === 'ai') assert.equal(r.reason, 'long');
  });
});

describe('renderHits', () => {
  test('tiêu đề đúng nhóm, không in khóa kỹ thuật', () => {
    const out = renderHits(search(index, 'Hóa Phân Tích 1', 3));
    assert.match(out, /\*\*Hóa Phân Tích 1\*\* — Học phần/);
    assert.match(out, /Học kỳ: HK2/);
  });

  test('cắt ở ranh giới dòng khi vượt giới hạn ký tự', () => {
    const out = renderHits(search(index, 'Hóa', 5), 120);
    assert.ok(out.length <= 125);
    assert.ok(out.endsWith('…'));
  });
});

describe('usageLimits', () => {
  const T0 = Date.parse('2026-03-10T05:00:00Z');

  test('giới hạn lượt AI mỗi IP mỗi ngày', () => {
    const limits = createUsageLimits({
      aiPerIpPerDay: 2,
      aiGlobalPerDay: 100,
      requestsPerMinute: 100,
      now: () => T0,
    });
    assert.equal(limits.tryConsumeAi('1.1.1.1').ok, true);
    const second = limits.tryConsumeAi('1.1.1.1');
    assert.equal(second.ok, true);
    assert.equal(second.remaining, 0);
    const third = limits.tryConsumeAi('1.1.1.1');
    assert.equal(third.ok, false);
    if (!third.ok) assert.equal(third.reason, 'ip');
    assert.equal(limits.tryConsumeAi('2.2.2.2').ok, true);
  });

  test('trần toàn hệ thống chặn cả IP mới', () => {
    const limits = createUsageLimits({
      aiPerIpPerDay: 5,
      aiGlobalPerDay: 2,
      requestsPerMinute: 100,
      now: () => T0,
    });
    limits.tryConsumeAi('a');
    limits.tryConsumeAi('b');
    const r = limits.tryConsumeAi('c');
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, 'global');
  });

  test('hoàn lượt khi gọi AI lỗi', () => {
    const limits = createUsageLimits({
      aiPerIpPerDay: 1,
      aiGlobalPerDay: 10,
      requestsPerMinute: 100,
      now: () => T0,
    });
    assert.equal(limits.tryConsumeAi('a').ok, true);
    limits.refundAi('a');
    assert.equal(limits.tryConsumeAi('a').ok, true);
  });

  test('đổi ngày lúc 00:00 giờ Việt Nam', () => {
    let t = Date.parse('2026-03-10T16:59:00Z');
    const limits = createUsageLimits({
      aiPerIpPerDay: 1,
      aiGlobalPerDay: 10,
      requestsPerMinute: 100,
      now: () => t,
    });
    assert.equal(limits.tryConsumeAi('a').ok, true);
    assert.equal(limits.tryConsumeAi('a').ok, false);
    t = Date.parse('2026-03-10T17:01:00Z');
    assert.equal(limits.tryConsumeAi('a').ok, true);
  });

  test('giới hạn request mỗi phút', () => {
    let t = T0;
    const limits = createUsageLimits({
      aiPerIpPerDay: 5,
      aiGlobalPerDay: 10,
      requestsPerMinute: 3,
      now: () => t,
    });
    assert.equal(limits.allowRequest('a'), true);
    assert.equal(limits.allowRequest('a'), true);
    assert.equal(limits.allowRequest('a'), true);
    assert.equal(limits.allowRequest('a'), false);
    t += 61_000;
    assert.equal(limits.allowRequest('a'), true);
  });
});

describe('ttlCache', () => {
  test('hết hạn và giới hạn số mục', () => {
    let t = 0;
    const cache = createTtlCache<string>(2, 1000, () => t);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    assert.equal(cache.get('a'), undefined);
    assert.equal(cache.get('c'), '3');
    t = 2000;
    assert.equal(cache.get('c'), undefined);
  });
});
