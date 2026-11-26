import { PreferredScheduleClass, PersonalAccentColor } from './memberService';

const BACKUP_FILE_NAME = 'The_D25B_Times_Backup.json';

export interface DriveBackupPayload {
  version: 1;
  backedUpAt: string;
  completedDeadlineIds: string[];
  bookmarkedCourseIds: string[];
  preferredClass: PreferredScheduleClass;
  personalHome?: {
    customName: string;
    bio: string;
    accentColor: PersonalAccentColor;
  };
}

export class DriveAuthExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DriveAuthExpiredError';
  }
}

async function findExistingBackupFileId(
  accessToken: string,
  knownFileId?: string
): Promise<string | null> {
  if (knownFileId) {
    const checkRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(knownFileId)}?fields=id,trashed`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (checkRes.status === 401 || checkRes.status === 403) {
      throw new DriveAuthExpiredError('Phiên kết nối Google Drive đã hết hạn.');
    }
    if (checkRes.ok) {
      const meta = (await checkRes.json()) as { id: string; trashed?: boolean };
      if (!meta.trashed) return meta.id;
    }
  }

  const query = encodeURIComponent(`name = '${BACKUP_FILE_NAME}' and trashed = false`);
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive&fields=files(id,name,modifiedTime)&pageSize=5`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (listRes.status === 401 || listRes.status === 403) {
    throw new DriveAuthExpiredError('Phiên kết nối Google Drive đã hết hạn hoặc chưa được cấp quyền.');
  }
  if (!listRes.ok) {
    throw new Error(`Không thể tìm tệp sao lưu trên Google Drive (${listRes.status}).`);
  }

  const data = (await listRes.json()) as { files?: { id: string }[] };
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

export async function saveBackupToGoogleDrive(
  accessToken: string,
  payload: DriveBackupPayload,
  knownFileId?: string
): Promise<{ fileId: string; webViewLink: string }> {
  const existingId = await findExistingBackupFileId(accessToken, knownFileId);

  const boundary = 'thed25b_backup_boundary_' + Date.now();
  const metadata = existingId
    ? { name: BACKUP_FILE_NAME, mimeType: 'application/json' }
    : { name: BACKUP_FILE_NAME, mimeType: 'application/json' };

  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(payload, null, 2)}\r\n` +
    `--${boundary}--`;

  const uploadUrl = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingId)}?uploadType=multipart&fields=id,webViewLink`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink`;

  const res = await fetch(uploadUrl, {
    method: existingId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (res.status === 401 || res.status === 403) {
    throw new DriveAuthExpiredError('Phiên cấp quyền Google Drive đã hết hạn.');
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Không thể ghi tệp sao lưu lên Google Drive (${res.status}): ${errText}`);
  }

  const saved = (await res.json()) as { id: string; webViewLink?: string };
  return {
    fileId: saved.id,
    webViewLink:
      saved.webViewLink || `https://drive.google.com/file/d/${saved.id}/view`,
  };
}

export async function restoreBackupFromGoogleDrive(
  accessToken: string,
  knownFileId?: string
): Promise<DriveBackupPayload> {
  const fileId = await findExistingBackupFileId(accessToken, knownFileId);
  if (!fileId) {
    throw new Error('Chưa tìm thấy tệp sao lưu The_D25B_Times_Backup.json trên Google Drive của bạn.');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (res.status === 401 || res.status === 403) {
    throw new DriveAuthExpiredError('Phiên cấp quyền Google Drive đã hết hạn.');
  }
  if (!res.ok) {
    throw new Error(`Không thể tải tệp sao lưu từ Google Drive (${res.status}).`);
  }

  return (await res.json()) as DriveBackupPayload;
}
