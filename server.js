const express = require('express');
const cors = require('cors');
const nexo = require('nexo-aio-downloader');
const axios = require('axios');

const app = express();
app.use(cors());

// YouTube Download (buffer langsung)
app.get('/youtube-download', async (req, res) => {
	const url = req.query.url;
	const quality = parseInt(req.query.quality || '3');

	if (!url) {
		return res.status(400).json({ error: 'No URL provided' });
	}

	try {
		const result = await nexo.youtube(url, quality);
		const filename = `${result.data.title || 'video'}.mp4`;
		const buffer = result.data.result;

		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Type', 'video/mp4');
		res.send(buffer);
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

// Instagram Download (stream URL)
app.get('/instagram-download', async (req, res) => {
	const url = req.query.url;
	if (!url) return res.status(400).json({ error: 'No URL provided' });

	try {
		const result = await nexo.instagram(url);
		if (!result.status || !result.data.url?.length) {
			throw new Error('No downloadable content found');
		}

		const videoUrl = result.data.url[0];
		const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

		res.setHeader('Content-Disposition', `attachment; filename="instagram_video.mp4"`);
		res.setHeader('Content-Type', 'video/mp4');
		videoStream.data.pipe(res);
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

// Facebook Download (stream URL)
app.get('/facebook-download', async (req, res) => {
	const url = req.query.url;
	if (!url) return res.status(400).json({ error: 'No URL provided' });

	try {
		const result = await nexo.facebook(url);
		const videoList = result?.data?.result;

		if (!result.status || !videoList || videoList.length === 0) {
			throw new Error('No downloadable content found');
		}

		const videoUrl = videoList[0].url || videoList[0].hd || videoList[0].sd;
		const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

		res.setHeader('Content-Disposition', `attachment; filename="facebook_video.mp4"`);
		res.setHeader('Content-Type', 'video/mp4');
		videoStream.data.pipe(res);
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

app.listen(3001, () => {
	console.log('Server running on http://localhost:3001');
});
