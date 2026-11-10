export default async function handler(req, res) {
  const { id, u } = req.query;
  const projectId = id ? String(id).trim() : '';

  let targetUrl = u ? String(u).trim() : 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200&h=630';

  if (!u && projectId) {
    try {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/danielvalevm/databases/(default)/documents/projects/${projectId}`;
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        const fields = data.fields || {};
        if (fields.thumbnail?.stringValue) {
          targetUrl = fields.thumbnail.stringValue.trim();
        } else if (fields.images?.arrayValue?.values?.[0]?.stringValue) {
          targetUrl = fields.images.arrayValue.values[0].stringValue.trim();
        }
      }
    } catch (e) {
      console.error('Error fetching project thumbnail in og-image:', e);
    }
  }

  // Se a URL for base64:
  if (targetUrl.startsWith('data:image/')) {
    const match = targetUrl.match(/^data:(image\/[a-zA-Z0-9+]+);base64,(.+)$/);
    if (match) {
      const mime = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
      return res.status(200).send(buffer);
    }
  }

  // Otimização para WhatsApp / Redes Sociais (< 100KB, formato JPEG 1200x630 proporção ideal 1.91:1)
  try {
    const optimizedUrl = `https://wsrv.nl/capa.jpg?url=${encodeURIComponent(targetUrl)}&w=1200&h=630&fit=cover&output=jpg&q=82`;
    const imageRes = await fetch(optimizedUrl);
    if (imageRes.ok) {
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
      return res.status(200).send(buffer);
    }
  } catch (err) {
    console.error('Error optimizing image via wsrv:', err);
  }

  // Fallback: redireciona para a URL original
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.redirect(302, targetUrl);
}

