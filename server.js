require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nexo = require('nexo-aio-downloader');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const optionalAuthenticate = require('./authenticate');

const fs = require('fs');
const ytdlExec = require('youtube-dl-exec');

const app = express();
app.use(cors());
app.use(optionalAuthenticate);

const SECRET = process.env.JWT_SECRET || 'your_secret_key';
const PORT = process.env.PORT || 3001;

const YT_DLP_PATH = process.env.YOUTUBE_DL_PATH || './bin/yt-dlp.exe';

// --- YOUTUBE ---
app.get('/youtube-download', optionalAuthenticate, async (req, res) => {
	console.log('[YT-DLP] Route triggered');
	const url = req.query.url;
	const quality = req.query.quality || '18'; // 18 = 360p MP4 (default)

	if (!url) {
		return res.status(400).json({ error: 'No URL provided' });
	}

	if (!fs.existsSync(YT_DLP_PATH)) {
		return res.status(500).json({ error: 'yt-dlp.exe not found on server' });
	}

	try {
		const videoInfo = await ytdlExec(YT_DLP_PATH, {
			args: [
				url,
				'--dump-single-json',
				'--no-warnings',
				'--no-check-certificates',
				'--prefer-free-formats',
				'--format',
				'best[ext=mp4]/best',
			],
		});

		if (!videoInfo || !videoInfo.formats?.length) {
			throw new Error('No downloadable formats found');
		}

		const selectedFormat =
			videoInfo.formats.find((f) => f.format_id === quality) ||
			videoInfo.formats.find((f) => f.ext === 'mp4' && f.url);

		if (!selectedFormat?.url) {
			throw new Error('Suitable download URL not found');
		}

		const filename = `${videoInfo.title || 'video'}.mp4`.replace(/[<>:"\/\\|?*]/g, '');
		const videoStream = await axios.get(selectedFormat.url, { responseType: 'stream' });

		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Type', 'video/mp4');
		videoStream.data.pipe(res);
	} catch (err) {
		console.error('[YT-DLP Error]:', err.stderr || err.message || err);
		res.status(500).json({ success: false, error: err.stderr || err.message || 'Unknown error' });
	}
});

// --- INSTAGRAM ---
app.get('/instagram-download', optionalAuthenticate, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.status(400).json({ error: 'No URL provided' });

	try {
		const result = await nexo.instagram(url);
		if (!result.status || !result.data?.url?.length) {
			throw new Error('No downloadable content found');
		}

		const videoUrl = result.data.url[0];
		const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

		res.setHeader('Content-Disposition', `attachment; filename="instagram_video.mp4"`);
		res.setHeader('Content-Type', 'video/mp4');
		videoStream.data.pipe(res);
	} catch (err) {
		console.error('Instagram download error:', err.message);
		res.status(500).json({ success: false, error: err.message });
	}
});

// --- FACEBOOK ---
app.get('/facebook-download', optionalAuthenticate, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.status(400).json({ error: 'No URL provided' });

	try {
		const result = await nexo.facebook(url);
		const videoList = result?.data?.result;

		if (!result.status || !videoList?.length) {
			throw new Error('No downloadable content found');
		}

		const videoUrl = videoList[0].url || videoList[0].hd || videoList[0].sd;
		const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

		res.setHeader('Content-Disposition', `attachment; filename="facebook_video.mp4"`);
		res.setHeader('Content-Type', 'video/mp4');
		videoStream.data.pipe(res);
	} catch (err) {
		console.error('Facebook download error:', err.message);
		res.status(500).json({ success: false, error: err.message });
	}
});

app.listen(PORT, () => {
	console.log(`Downloader running on port: ${PORT}`);
});
