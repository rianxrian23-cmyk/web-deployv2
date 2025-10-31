import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const upload = multer();

app.post('/deploy', upload.single('file'), async (req, res) => {
  try {
    const token = process.env.VERCEL_TOKEN;
    const project = req.body.name;
    if (!token) return res.status(500).json({ error: 'VERCEL_TOKEN not set on server.' });
    if (!project) return res.status(400).json({ error: 'Missing project name.' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'x-vercel-project-name': project
      },
      body: req.file.buffer
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('deploy error', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
