// backend/routes/youtube.js
import express from 'express';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { PassThrough } from 'stream';

const router = express.Router();
ffmpeg.setFfmpegPath(ffmpegPath);

router.get('/download-mp3', async (req, res) => {
  const { url } = req.query;

  if (!ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_');

    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    const stream = ytdl(url, { quality: 'highestaudio' });
    const passthrough = new PassThrough();

    ffmpeg(stream)
      .audioBitrate(128)
      .format('mp3')
      .pipe(passthrough);

    passthrough.pipe(res);
  } catch (err) {
    console.error('❌ MP3 download error:', err);
    res.status(500).json({ error: 'Failed to download' });
  }
});

export default router;
