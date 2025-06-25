// downloader/authenticate.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your_secret_key'; // HARUS sama dengan FastAPI saat membuat token

const optionalAuthenticate = (req, res, next) => {
	const auth = req.headers.authorization;

	if (!auth || !auth.startsWith('Bearer ')) {
		req.user = null; // Guest (tidak login)
		return next();
	}

	const token = auth.split(' ')[1];
	try {
		const decoded = jwt.verify(token, SECRET);
		req.user = decoded;
	} catch (err) {
		req.user = null;
	}
	next();
};

module.exports = optionalAuthenticate;
