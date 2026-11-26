import { getCachedSheetsAccessToken } from '../firebase';

export interface EmailNoticeParams {
  toEmail: string;
  subject: string;
  bodyText: string;
}

function encodeMimeMessage(to: string, subject: string, body: string): string {
  const emailLines = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(body))),
  ];
  const raw = emailLines.join('\r\n');
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendGmailNotice(params: EmailNoticeParams): Promise<boolean> {
  const token = getCachedSheetsAccessToken();
  if (!token) {
    throw new Error('Chưa đăng nhập Google hoặc chưa cấp quyền Gmail. Hãy bấm "Tiếp tục với Google" trong tài khoản.');
  }

  const rawMessage = encodeMimeMessage(params.toEmail, params.subject, params.bodyText);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        raw: rawMessage,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Lỗi gửi email qua Gmail API (${res.status})`);
  }

  return true;
}
