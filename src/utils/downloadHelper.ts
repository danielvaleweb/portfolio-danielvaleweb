/**
 * Download helper utilities for handling cloud storage URLs (Firebase Storage, Google Drive, Dropbox, etc.)
 * Gives absolute priority to Firebase Storage for ultra-fast, direct single-system downloads
 * while preserving optional Google Drive / Dropbox external link support.
 */

export interface DownloadUrlInfo {
  url: string;
  type: 'firebase' | 'google-drive-file' | 'google-drive-folder' | 'dropbox' | 'direct';
  label?: string;
  fileName?: string;
}

/**
 * Parses and converts cloud storage URLs into direct download or proper access URLs.
 */
export function parseDownloadUrl(rawUrl: string): DownloadUrlInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { url: '', type: 'direct' };
  }

  const trimmed = rawUrl.trim();

  // 1. Firebase Storage (Prioridade Máxima - Sistema Unificado)
  if (trimmed.includes('firebasestorage.googleapis.com') || trimmed.includes('firebasestorage.app')) {
    let firebaseUrl = trimmed;
    let extractedName = '';
    try {
      const match = firebaseUrl.match(/\/o\/([^?#]+)/);
      if (match) {
        const decoded = decodeURIComponent(match[1]);
        const parts = decoded.split('/');
        extractedName = parts[parts.length - 1];
        // Remove prefixo timestamp ex: 1731234567_
        extractedName = extractedName.replace(/^\d+_/, '');
      }
    } catch {}

    const cleanFilename = extractedName || 'arquivo_alta_resolucao.mp4';
    if (!firebaseUrl.includes('response-content-disposition')) {
      const sep = firebaseUrl.includes('?') ? '&' : '?';
      firebaseUrl += `${sep}response-content-disposition=attachment%3B%20filename%3D"${encodeURIComponent(cleanFilename)}"`;
    }

    return {
      url: firebaseUrl,
      type: 'firebase',
      label: 'Arquivo Firebase Storage (Download Direto)',
      fileName: cleanFilename
    };
  }

  // 2. Google Drive Folder
  const isGoogleDriveFolder = /drive\.google\.com\/(?:drive\/)?(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/i.test(trimmed);
  if (isGoogleDriveFolder) {
    return {
      url: trimmed,
      type: 'google-drive-folder',
      label: 'Pasta do Google Drive'
    };
  }

  // 3. Google Drive File
  const fileDMatch = trimmed.match(/(?:drive|docs)\.google\.com\/file\/d\/([a-zA-Z0-9_-]{15,})/i);
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i);
  const fileId = fileDMatch ? fileDMatch[1] : (idParamMatch && /google\.com/i.test(trimmed) ? idParamMatch[1] : null);

  if (fileId) {
    return {
      url: `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
      type: 'google-drive-file',
      label: 'Arquivo do Google Drive'
    };
  }

  // 4. Dropbox
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

  // 5. Direct file / other URL
  return {
    url: trimmed,
    type: 'direct'
  };
}

/**
 * Triggers download of a file reliably across Desktop (Windows/Mac) and Mobile (iOS Safari / Android).
 */
export async function triggerDownload(rawUrl: string, suggestedFilename?: string): Promise<void> {
  if (!rawUrl) return;

  const info = parseDownloadUrl(rawUrl);

  // Se for pasta do Google Drive: abre em nova aba
  if (info.type === 'google-drive-folder') {
    window.open(info.url, '_blank', 'noopener,noreferrer');
    return;
  }

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // 1. Firebase Storage (Download Direto Prioritário)
  if (info.type === 'firebase') {
    let directUrl = info.url;
    if (!directUrl.includes('response-content-disposition')) {
      const cleanName = suggestedFilename || info.fileName || 'arquivo_alta_resolucao.mp4';
      const sep = directUrl.includes('?') ? '&' : '?';
      directUrl += `${sep}response-content-disposition=attachment%3B%20filename%3D"${encodeURIComponent(cleanName)}"`;
    }

    if (isMobile) {
      // No Mobile (iOS Safari / Android Chrome): navega direto para a URL com cabeçalho de anexo
      // O navegador aciona a folha/notificação nativa de download sem abrir telas em branco
      window.location.assign(directUrl);
    } else {
      // No PC Desktop: link programático oculto dispara direto para o download manager
      const a = document.createElement('a');
      a.href = directUrl;
      a.style.display = 'none';
      if (suggestedFilename || info.fileName) {
        a.setAttribute('download', suggestedFilename || info.fileName || '');
      }
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 2000);
    }
    return;
  }

  // 2. Google Drive / Dropbox
  if (info.type === 'google-drive-file' || info.type === 'dropbox') {
    if (isMobile) {
      window.location.assign(info.url);
    } else {
      const a = document.createElement('a');
      a.href = info.url;
      a.style.display = 'none';
      if (suggestedFilename) {
        a.setAttribute('download', suggestedFilename);
      }
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 2000);
    }
    return;
  }

  // Se for YouTube / Vimeo
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(info.url)) {
    window.open(info.url, '_blank', 'noopener,noreferrer');
    return;
  }

  // 3. Outros arquivos diretos (Blob fetch se suportado, senão navegação direta)
  try {
    const response = await fetch(info.url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Response is HTML');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    let filename = suggestedFilename || 'download';
    if (!suggestedFilename) {
      try {
        const urlObj = new URL(info.url);
        const parts = urlObj.pathname.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart) {
          filename = decodeURIComponent(lastPart).split('?')[0];
        }
      } catch {}
    }

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 30000);
  } catch {
    if (isMobile) {
      window.location.assign(info.url);
    } else {
      const a = document.createElement('a');
      a.href = info.url;
      a.style.display = 'none';
      if (suggestedFilename) a.setAttribute('download', suggestedFilename);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 2000);
    }
  }
}
