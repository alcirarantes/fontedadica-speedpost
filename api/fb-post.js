export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64, caption, accessToken, pageId } = req.body;
    if (!imageBase64 || !accessToken || !pageId) {
      return res.status(400).json({ error: 'imageBase64, accessToken e pageId são obrigatórios' });
    }

    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const form = new FormData();
    form.append('source', new Blob([imageBuffer], { type: 'image/jpeg' }), 'card.jpg');
    form.append('caption', caption);
    form.append('access_token', accessToken);

    const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
      method: 'POST',
      body: form
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message, detail: data });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
