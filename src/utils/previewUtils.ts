export interface PreviewInfo {
  embedUrl: string;
  isFolder: boolean;
  isVideo: boolean;
  kindLabel: string;
}

export function getPreviewInfo(
  rawUrl: string,
  folderMode: 'list' | 'grid' = 'list'
): PreviewInfo | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return null;

    const host = parsed.hostname;
    const path = parsed.pathname;

    if (host === 'drive.google.com') {
      const fileMatch = path.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch) {
        return {
          embedUrl: `https://drive.google.com/file/d/${fileMatch[1]}/preview`,
          isFolder: false,
          isVideo: false,
          kindLabel: 'Google Drive',
        };
      }
      const folderMatch = path.match(/^\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
      if (folderMatch) {
        return {
          embedUrl: `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#${folderMode}`,
          isFolder: true,
          isVideo: false,
          kindLabel: 'Thư mục Drive',
        };
      }
      if (path === '/open') {
        const id = parsed.searchParams.get('id');
        if (id && /^[a-zA-Z0-9_-]+$/.test(id)) {
          return {
            embedUrl: `https://drive.google.com/file/d/${id}/preview`,
            isFolder: false,
            isVideo: false,
            kindLabel: 'Google Drive',
          };
        }
      }
    }

    if (host === 'docs.google.com') {
      if (path === '/folderview') {
        const id = parsed.searchParams.get('id');
        if (id && /^[a-zA-Z0-9_-]+$/.test(id)) {
          return {
            embedUrl: `https://drive.google.com/embeddedfolderview?id=${id}#${folderMode}`,
            isFolder: true,
            isVideo: false,
            kindLabel: 'Thư mục Drive',
          };
        }
      }
      const docMatch = path.match(/^\/document\/d\/([a-zA-Z0-9_-]+)/);
      if (docMatch) {
        return {
          embedUrl: `https://docs.google.com/document/d/${docMatch[1]}/preview`,
          isFolder: false,
          isVideo: false,
          kindLabel: 'Google Docs',
        };
      }
      const sheetMatch = path.match(/^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (sheetMatch) {
        return {
          embedUrl: `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/htmlembed`,
          isFolder: false,
          isVideo: false,
          kindLabel: 'Google Sheets',
        };
      }
      const slideMatch = path.match(/^\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      if (slideMatch) {
        return {
          embedUrl: `https://docs.google.com/presentation/d/${slideMatch[1]}/embed`,
          isFolder: false,
          isVideo: false,
          kindLabel: 'Google Slides',
        };
      }
    }

    if (host === 'www.youtube.com' || host === 'youtube.com') {
      const videoId = parsed.searchParams.get('v');
      if (path === '/watch' && videoId && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
        return {
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          isFolder: false,
          isVideo: true,
          kindLabel: 'Video YouTube',
        };
      }
    }

    if (host === 'youtu.be') {
      const videoId = path.replace(/^\/+/, '').split('/')[0];
      if (videoId && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
        return {
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          isFolder: false,
          isVideo: true,
          kindLabel: 'Video YouTube',
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
