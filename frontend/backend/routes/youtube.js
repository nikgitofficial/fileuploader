// routes/youtube.js
import express from 'express';
import ytdl from 'ytdl-core';

const router = express.Router();

router.get('/download-audio', async (req, res) => {
  const { url } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_');
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    if (!format || !format.url) {
      return res.status(500).json({ error: 'Audio format unavailable' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
      .on('error', (err) => {
        console.error('❌ YTDL stream error:', err.message || err);
        res.status(500).json({ error: 'Audio stream failed' });
      })
      .pipe(res);

  } catch (err) {
    console.error('❌ ytdl.getInfo error:', err.message || err);
    res.status(500).json({ error: 'Failed to download audio' });
  }
});

export default router;
