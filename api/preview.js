export default async function handler(req, res) {
  const { id, unlock } = req.query;
  const projectId = id ? String(id).trim() : '';

  let title = 'Vídeo Pronto | Daniel Vale';
  let description = 'Assista e baixe a produção em alta resolução.';
  let thumbnail = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200&h=630';

  if (projectId) {
    try {
      // Busca dados do projeto via Firestore REST API (público para leitura)
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/danielvalevm/databases/(default)/documents/projects/${projectId}`;
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        const fields = data.fields || {};
        if (fields.title?.stringValue) title = `${fields.title.stringValue} | Daniel Vale`;
        if (fields.description?.stringValue) description = fields.description.stringValue;
        if (fields.thumbnail?.stringValue) thumbnail = fields.thumbnail.stringValue;
      }
    } catch (e) {
      console.error('Error fetching project for preview:', e);
    }
  }

  const queryParams = unlock ? `?unlock=${encodeURIComponent(unlock)}` : '';
  const canonicalUrl = `https://www.danielvale.com.br/projeto/${projectId}${queryParams}`;

  // Garante que a URL da imagem seja absoluta e segura
  if (thumbnail.startsWith('/')) {
    thumbnail = `https://www.danielvale.com.br${thumbnail}`;
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <!-- Open Graph para WhatsApp, Facebook, LinkedIn, etc. -->
  <meta property="og:type" content="video.other">
  <meta property="og:site_name" content="Daniel Vale | Videomaker">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${thumbnail}">
  <meta property="og:image:secure_url" content="${thumbnail}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${thumbnail}">

  <!-- Redireciona humanos instantaneamente -->
  <meta http-equiv="refresh" content="0; url=${canonicalUrl}">
</head>
<body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Carregando projeto...</p>
  <script>window.location.replace("${canonicalUrl}");</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(html);
}

