import https from 'https';
import http from 'http';

export const config = {
  maxDuration: 60, // Até 60s para arquivos de vídeo
};

export default function handler(req, res) {
  const { url, name } = req.query;

  if (!url) {
    return res.status(400).send('Missing "url" parameter');
  }

  let targetUrl = String(url).trim();

  // Se a URL inteira veio codificada como http%3A%2F%2F, decodifica apenas o protocolo e query,
  // mas preserva cuidadosamente %2F no caminho do objeto do Firebase
  if (targetUrl.startsWith('http%3A') || targetUrl.startsWith('https%3A')) {
    targetUrl = decodeURIComponent(targetUrl);
    // Garante que /o/... mantenha %2F para subpastas no Firebase Storage
    targetUrl = targetUrl.replace(/\/o\/(.+?)(\?|$)/, (match, path, rest) => {
      const reEncodedPath = path.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('%2F');
      return `/o/${reEncodedPath}${rest}`;
    });
  }

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    return res.status(400).send('Invalid protocol');
  }

  // Extrai nome limpo
  let rawName = name ? String(name).trim() : '';
  if (!rawName) {
    try {
      const match = targetUrl.match(/\/o\/([^?#]+)/);
      if (match) {
        const decoded = decodeURIComponent(match[1]);
        const parts = decoded.split('/');
        rawName = parts[parts.length - 1].replace(/^\d+_/, '');
      }
    } catch {}
  }
  if (!rawName) {
    if (targetUrl.includes('.jpg') || targetUrl.includes('.jpeg')) rawName = 'foto.jpg';
    else if (targetUrl.includes('.png')) rawName = 'foto.png';
    else if (targetUrl.includes('.webp')) rawName = 'foto.webp';
    else if (targetUrl.includes('.zip')) rawName = 'arquivo.zip';
    else rawName = 'video.mp4';
  }

  const cleanFileName = rawName
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim() || 'video.mp4';

  function fetchAndPipe(currentUrl, redirectsLeft = 5) {
    if (redirectsLeft <= 0) {
      return res.status(500).send('Too many redirects');
    }

    const client = currentUrl.startsWith('https:') ? https : http;

    const request = client.get(currentUrl, (upstreamRes) => {
      // Seguir redirecionamentos (301, 302, 307, 308)
      if (
        upstreamRes.statusCode &&
        upstreamRes.statusCode >= 300 &&
        upstreamRes.statusCode < 400 &&
        upstreamRes.headers.location
      ) {
        const redirectUrl = new URL(upstreamRes.headers.location, currentUrl).href;
        return fetchAndPipe(redirectUrl, redirectsLeft - 1);
      }

      if (upstreamRes.statusCode !== 200 && upstreamRes.statusCode !== 206) {
        return res.status(upstreamRes.statusCode || 500).send(`Failed to fetch from storage source: HTTP ${upstreamRes.statusCode}`);
      }

      let contentType = upstreamRes.headers['content-type'];
      const ext = cleanFileName.split('.').pop()?.toLowerCase();
      if (!contentType || contentType === 'application/octet-stream' || contentType === 'video/mp4') {
        if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
        else if (ext === 'png') contentType = 'image/png';
        else if (ext === 'webp') contentType = 'image/webp';
        else if (ext === 'zip') contentType = 'application/zip';
        else if (ext === 'mp4') contentType = 'video/mp4';
        else if (!contentType) contentType = 'application/octet-stream';
      }

      const contentLength = upstreamRes.headers['content-length'];

      // Headers para FORÇAR o download nativo sem abrir player de vídeo
      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${cleanFileName}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`
      );

      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      res.setHeader('Cache-Control', 'public, max-age=3600');

      upstreamRes.pipe(res);

      upstreamRes.on('error', (err) => {
        console.error('Upstream error:', err);
        if (!res.headersSent) {
          res.status(500).send('Stream error');
        }
      });
    });

    request.on('error', (err) => {
      console.error('Request error:', err);
      if (!res.headersSent) {
        res.status(500).send('Error connecting to storage source');
      }
    });
  }

  fetchAndPipe(targetUrl);
}
