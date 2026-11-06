/**
 * Download helper utilities for handling cloud storage URLs (Google Drive, Dropbox, Firebase Storage, etc.)
 * Prevents saving HTML preview pages (like view.htm) and ensures direct file downloads.
 */

export interface DownloadUrlInfo {
  url: string;
  type: 'google-drive-file' | 'google-drive-folder' | 'dropbox' | 'direct';
  label?: string;
}

/**
 * Parses and converts cloud storage URLs into direct download or proper access URLs.
 */
export function parseDownloadUrl(rawUrl: string): DownloadUrlInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { url: '', type: 'direct' };
  }

  const trimmed = rawUrl.trim();

  // 1. Google Drive Folder
  const isGoogleDriveFolder = /drive\.google\.com\/(?:drive\/)?(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/i.test(trimmed);
  if (isGoogleDriveFolder) {
    return {
      url: trimmed,
      type: 'google-drive-folder',
      label: 'Pasta do Google Drive'
    };
  }

  // 2. Google Drive File
  // Examples:
  // drive.google.com/file/d/FILE_ID/view?usp=sharing
  // drive.google.com/open?id=FILE_ID
  // drive.google.com/uc?id=FILE_ID
  // docs.google.com/file/d/FILE_ID
  const fileDMatch = trimmed.match(/(?:drive|docs)\.google\.com\/file\/d\/([a-zA-Z0-9_-]{15,})/i);
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i);
  const fileId = fileDMatch ? fileDMatch[1] : (idParamMatch && /drive\.google\.com/i.test(trimmed) ? idParamMatch[1] : null);

  if (fileId) {
    return {
      url: `https://drive.google.com/uc?export=download&id=${fileId}`,
      type: 'google-drive-file',
      label: 'Arquivo do Google Drive'
    };
  }

  // 3. Dropbox
  if (/dropbox\.com\//i.test(trimmed)) {
    let dropboxUrl = trimmed;
    if (dropboxUrl.includes('dl=0')) {
      dropboxUrl = dropboxUrl.replace('dl=0', 'dl=1');
    } else if (!dropboxUrl.includes('dl=1')) {
      dropboxUrl += (dropboxUrl.includes('?') ? '&' : '?') + 'dl=1';
    }
    return {
      url: dropboxUrl,
      type: 'dropbox',
      label: 'Arquivo do Dropbox'
    };
  }

  // 4. Direct file / Firebase Storage / other URL
  return {
    url: trimmed,
    type: 'direct'
  };
}

/**
 * Triggers download of a file safely without forcing HTML downloads (like view.htm)
 */
export async function triggerDownload(rawUrl: string): Promise<void> {
  if (!rawUrl) return;

  const info = parseDownloadUrl(rawUrl);

  // If it's a Google Drive folder:
  // Open the folder directly in a new tab so user can browse/download all items.
  if (info.type === 'google-drive-folder') {
    window.open(info.url, '_blank', 'noopener,noreferrer');
    return;
  }

  // If it's a Google Drive file:
  // Use Google Drive's direct download endpoint.
  // CRITICAL: NEVER use a.download attribute here, because a.download will override
  // the server's Content-Disposition attachment header and cause Chrome to save view.htm / uc.htm!
  if (info.type === 'google-drive-file') {
    const a = document.createElement('a');
    a.href = info.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // If it's Dropbox:
  if (info.type === 'dropbox') {
    const a = document.createElement('a');
    a.href = info.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // For Firebase Storage or direct media URLs:
  try {
    const response = await fetch(info.url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    // If server returned HTML, do NOT download it as a file (it's likely an error page or viewer)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Response is HTML, opening as link');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    let filename = 'download';
    try {
      const urlObj = new URL(info.url);
      const parts = urlObj.pathname.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        filename = decodeURIComponent(lastPart).split('?')[0];
      }
    } catch {}

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    // Safe Fallback: Open in a new tab WITHOUT setting a.download = 'download'.
    // If it's a file, the browser will download it using the server's filename.
    // If it's a webpage, it will display the webpage instead of saving view.htm!
    const a = document.createElement('a');
    a.href = info.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
