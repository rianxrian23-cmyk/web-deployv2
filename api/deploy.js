export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = process.env.VERCEL_TOKEN;
    const project = req.headers['x-project-name'];

    if (!token) {
      return res.status(500).json({ error: 'VERCEL_TOKEN environment variable not set on server.' });
    }
    if (!project) {
      return res.status(400).json({ error: 'Missing x-project-name header.' });
    }

    // Read raw request body into a Buffer
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Forward raw ZIP bytes to Vercel Deployments API
    const resp = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'x-vercel-project-name': project
      },
      body: buffer
    });

    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    console.error('deploy error', err);
    res.status(500).json({ error: err.message });
  }
};
