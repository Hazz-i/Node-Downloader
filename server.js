require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nexo = require('nexo-aio-downloader');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const optionalAuthenticate = require('./authenticate');

const app = express();
app.use(cors());
app.use(optionalAuthenticate);

const SECRET = process.env.JWT_SECRET || 'your_secret_key';
const PORT = process.env.PORT || 3001;

// --- YOUTUBE ---
app.get('/youtube-download', optionalAuthenticate, async (req, res) => {
	console.log('YouTube route triggered'); // Tambah ini
	const url = req.query.url;
	const quality = parseInt(req.query.quality || '3');

	if (!url) {
		return res.status(400).json({ error: 'No URL provided' });
	}

	try {
		const result = await nexo.youtube(url, quality);

		if (!result.status || !result.data?.result) {
			throw new Error('No downloadable content found');
		}

		const videoUrl = result.data.result; // ini URL, bukan buffer
		const filename = `${result.data.title || 'video'}.mp4`;

		// Download ulang video dari URL dan stream ke FE
		const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Type', 'video/mp4');
		videoStream.data.pipe(res);
	} catch (err) {
		console.error('YouTube download error:', err.message);
		res.status(500).json({ success: false, error: err.message });
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
	console.log(`Downloader running on http://localhost:${PORT}`);
});
