const express = require('express');
const cors = require('cors');
const nexo = require('nexo-aio-downloader');

const app = express();
app.use(cors());

app.get('/youtube-download', async (req, res) => {
	const url = req.query.url;
	const quality = parseInt(req.query.quality || '3');

	if (!url) {
		return res.status(400).json({ error: 'No URL provided' });
	}

	try {
		const result = await nexo.youtube(url, quality);

		// Tentukan nama file
		const filename = `${result.data.title || 'video'}.mp4`;
		const buffer = result.data.result;

		// Set header supaya browser download file
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Type', 'video/mp4');
		res.send(buffer);
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

app.get('/youtube-download', async (req, res) => {
	const url = req.query.url;
	const quality = parseInt(req.query.quality || '3');

	if (!url) {
		return res.status(400).json({ error: 'No URL provided' });
	}

	try {
		const result = await nexo.youtube(url, quality);

		// Tentukan nama file
		const filename = `${result.data.title || 'video'}.mp4`;
		const buffer = result.data.result;

		// Set header supaya browser download file
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Type', 'video/mp4');
		res.send(buffer);
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

app.get('/youtube-download', async (req, res) => {
	const url = req.query.url;
	const quality = parseInt(req.query.quality || '3');

	if (!url) {
		return res.status(400).json({ error: 'No URL provided' });
	}

	try {
		const result = await nexo.youtube(url, quality);

		// Tentukan nama file
		const filename = `${result.data.title || 'video'}.mp4`;
		const buffer = result.data.result;

		// Set header supaya browser download file
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Type', 'video/mp4');
		res.send(buffer);
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

app.listen(3001, () => {
	console.log('Server running on http://localhost:3001');
});
