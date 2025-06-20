// backend/routes/youtube.js
import express from 'express';
import ytdl from 'ytdl-core';

const router = express.Router();

router.get('/download-audio', async (req, res) => {
  const { url } = req.query;

  if (!ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_');

    res.setHeader('Content-Disposition', `attachment; filename="${title}.m4a"`);
    res.setHeader('Content-Type', 'audio/mp4');

    ytdl(url, {
      quality: 'highestaudio',
      filter: 'audioonly',
    }).pipe(res);
  } catch (err) {
    console.error('❌ Audio-only download error:', err);
    res.status(500).json({ error: 'Failed to download audio' });
  }
});

export default router;
