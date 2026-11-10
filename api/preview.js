function cleanText(str, maxLength = 200) {
  if (!str) return '';
  const cleaned = String(str)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength - 3).trim() + '...';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  const { id, unlock, isEval } = req.query;
  const projectId = id ? String(id).trim() : '';

  let title = 'Vídeo Pronto | Daniel Vale';
  let description = 'Assista e baixe a produção em alta resolução.';
  let thumbnail = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200&h=630';
  let version = Date.now().toString();

  if (projectId) {
    try {
      // Busca dados do projeto via Firestore REST API (público para leitura)
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/danielvalevm/databases/(default)/documents/projects/${projectId}`;
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        const fields = data.fields || {};

        if (fields.title?.stringValue) {
          title = isEval === '1'
            ? `Avaliar: ${fields.title.stringValue} | Daniel Vale`
            : `${fields.title.stringValue} | Daniel Vale`;
        }

        if (fields.description?.stringValue) {
          description = isEval === '1'
            ? `Deixe sua avaliação sobre a produção "${fields.title?.stringValue || 'Vídeo'}". Sua opinião é muito importante!`
            : cleanText(fields.description.stringValue, 220);
        }

        if (fields.thumbnail?.stringValue && fields.thumbnail.stringValue.trim() !== '') {
          thumbnail = fields.thumbnail.stringValue.trim();
        } else if (fields.images?.arrayValue?.values?.[0]?.stringValue) {
          thumbnail = fields.images.arrayValue.values[0].stringValue.trim();
        }

        version = (fields.updatedAt?.integerValue || fields.createdAt?.integerValue || Date.now()).toString();
      }
    } catch (e) {
      console.error('Error fetching project for preview:', e);
    }
  }

  const queryParams = unlock ? `?unlock=${encodeURIComponent(unlock)}` : '';
  const canonicalUrl = isEval === '1'
    ? `https://www.danielvale.com.br/avaliar/${projectId}`
    : `https://www.danielvale.com.br/projeto/${projectId}${queryParams}`;

  // URL de imagem otimizada para WhatsApp (< 100KB, JPEG 1200x630 com extensão .jpg explícita)
  let ogImageUrl = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200&h=630';

  if (thumbnail && thumbnail.startsWith('http')) {
    // wsrv.nl com terminação explícita /capa.jpg garante que o scraper do WhatsApp reconheça como imagem
    // e o Cloudflare CDN entrega em < 50ms (muito abaixo do timeout do WhatsApp de 2.5s)
    ogImageUrl = `https://wsrv.nl/capa.jpg?url=${encodeURIComponent(thumbnail)}&w=1200&h=630&fit=cover&output=jpg&q=82`;
  } else if (thumbnail && thumbnail.startsWith('data:image/')) {
    ogImageUrl = `https://www.danielvale.com.br/api/og-image?id=${encodeURIComponent(projectId)}`;
  }

  // PRÉ-AQUECIMENTO: esquenta o cache da CDN em paralelo enquanto monta a resposta.
  // Quando o scraper do WhatsApp fizer a requisição da imagem milissegundos após ler a tag,
  // a imagem já estará 100% pronta e em cache, respondendo instantaneamente.
  if (ogImageUrl.startsWith('https://wsrv.nl')) {
    try {
      await Promise.race([
        fetch(ogImageUrl),
        new Promise(resolve => setTimeout(resolve, 1200))
      ]);
    } catch {
      // Timeout do aquecimento não trava a resposta
    }
  }

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(cleanText(description, 200));

  const html = `<!DOCTYPE html>
<html lang="pt-BR" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">

  <!-- Open Graph para WhatsApp, Facebook, LinkedIn, etc. -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Daniel Vale | Videomaker">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  
  <!-- Imagem Otimizada para WhatsApp (< 100KB, JPEG 1200x630 com extensão .jpg) -->
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:secure_url" content="${ogImageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeTitle}">
  <link rel="image_src" href="${ogImageUrl}">
  <meta itemprop="image" content="${ogImageUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <!-- Redireciona humanos instantaneamente -->
  <meta http-equiv="refresh" content="0; url=${canonicalUrl}">
</head>
<body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Carregando projeto...</p>
  <script>window.location.replace("${canonicalUrl}");</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
