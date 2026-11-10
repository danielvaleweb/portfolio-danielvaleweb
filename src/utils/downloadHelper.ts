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
 * Auxiliar para efetuar o streaming dos bytes com tracking de progresso e geração de Blob local.
 * Garante que o navegador dispare o download nativo do arquivo no disco.
 */
async function streamFetchBlob(
  targetUrl: string,
  cleanName: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const response = await fetch(targetUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentLength = response.headers.get('content-length');
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
  let blob: Blob;

  if (response.body && totalBytes > 0 && onProgress) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
        const currentPct = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
        onProgress(currentPct);
      }
    }
    blob = new Blob(chunks, { type: response.headers.get('content-type') || 'video/mp4' });
    onProgress(100);
  } else {
    // Se não há stream de progresso nativo com tamanho prévio, simula avanços suaves
    if (onProgress) onProgress(20);
    let simulatedPct = 20;
    const progressTimer = setInterval(() => {
      simulatedPct = Math.min(95, simulatedPct + 15);
      if (onProgress) onProgress(simulatedPct);
    }, 350);

    try {
      blob = await response.blob();
    } finally {
      clearInterval(progressTimer);
    }
    if (onProgress) onProgress(100);
  }

  // Cria URL de blob local (mesma origem, 100% download nativo)
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = cleanName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
    if (document.body.contains(a)) document.body.removeChild(a);
  }, 5000);
}

/**
 * Triggers download of a file reliably across Desktop (Windows/Mac) and Mobile (iOS Safari / Android).
 * Forces 100% direct file download without opening the browser's video player.
 */
export async function triggerDownload(
  rawUrl: string, 
  suggestedFilename?: string, 
  onProgress?: (percent: number) => void
): Promise<void> {
  if (!rawUrl) return;

  const info = parseDownloadUrl(rawUrl);

  // Se for pasta do Google Drive: abre em nova aba
  if (info.type === 'google-drive-folder') {
    window.open(info.url, '_blank', 'noopener,noreferrer');
    return;
  }

  // 1. Firebase Storage (Download Direto 100% Garantido via Blob Local ou /api/download)
  // Fazemos o fetch dos bytes do arquivo e geramos uma URL de blob local (mesma origem).
  // URLs blob locais NUNCA abrem player de vídeo e FORÇAM o download direto no PC e Mobile.
  if (info.type === 'firebase') {
    const cleanName = suggestedFilename || info.fileName || 'producao_original.mp4';
    const proxyUrl = `/api/download?url=${encodeURIComponent(info.url)}&name=${encodeURIComponent(cleanName)}`;

    try {
      // 1. Tenta direto na URL do Firebase (se CORS estiver ativo no bucket)
      await streamFetchBlob(info.url, cleanName, onProgress);
      return;
    } catch (corsErr) {
      console.warn('Fetch direto no Firebase bloqueado por CORS, usando rota local /api/download com streaming e progresso:', corsErr);
      try {
        // 2. Tenta via /api/download (mesma origem na Vercel, sem bloqueio de CORS e com progresso em tempo real)
        await streamFetchBlob(proxyUrl, cleanName, onProgress);
        return;
      } catch (proxyErr) {
        console.warn('Fallback para navegação da rota de download:', proxyErr);
        // 3. Fallback garantido: link direto na rota de download que força o Content-Disposition
        if (onProgress) onProgress(100);
        const a = document.createElement('a');
        a.href = proxyUrl;
        a.setAttribute('download', cleanName);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
        }, 3000);
        return;
      }
    }
  }

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

  // 3. Outros arquivos diretos (tentativa via blob)
  try {
    const res = await fetch(info.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const b = await res.blob();
    const bUrl = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = bUrl;
    a.download = suggestedFilename || 'arquivo.mp4';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(bUrl);
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 4000);
  } catch {
    const fallbackName = suggestedFilename || 'arquivo.mp4';
    const proxyUrl = `/api/download?url=${encodeURIComponent(info.url)}&name=${encodeURIComponent(fallbackName)}`;
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.setAttribute('download', fallbackName);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 3000);
  }
}
