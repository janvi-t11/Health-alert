const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { updateReportLifecycles } = require('./utils/lifecycleManager');

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
	origin: ['http://localhost:5173', 'http://localhost:5174', 'https://healthalertplatform.netlify.app', 'https://health-alert-backend.onrender.com'],
	credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRouter = require('./routes/auth');
const reportsRouter = require('./routes/reports');
const alertsRouter = require('./routes/alerts');
const usersRouter = require('./routes/users');

app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/users', usersRouter);

// Reverse geocode proxy — calls Nominatim server-side to avoid CORS
app.get('/api/geocode/reverse', async (req, res) => {
	const { lat, lng } = req.query;
	if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
			{ headers: { 'User-Agent': 'HealthAlertApp/1.0 (contact@healthalerts.com)', 'Accept-Language': 'en' } }
		);
		const data = await response.json();
		const addr = data.address || {};
		res.json({
			area:    addr.suburb || addr.neighbourhood || addr.quarter || addr.hamlet || addr.road || '',
			city:    addr.city || addr.town || addr.village || addr.county || '',
			state:   addr.state || '',
			pincode: addr.postcode || '',
			country: addr.country || 'India',
		});
	} catch (err) {
		res.status(500).json({ error: 'Geocoding failed' });
	}
});

// Root routes
app.get('/', (req, res) => {
	res.json({ message: 'Health Alerts API is running', status: 'ok' });
});

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', message: 'API is healthy' });
});

// DB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_alerts';
const PORT = process.env.PORT || 4000;

if (mongoose.connection.readyState === 0) {
	mongoose.connect(MONGODB_URI)
		.then(() => {
			console.log('Connected to MongoDB');
			// Run lifecycle update every 6 hours
			setInterval(updateReportLifecycles, 6 * 60 * 60 * 1000);
			// Run once on startup
			updateReportLifecycles();
		})
		.catch((err) => console.error('MongoDB connection error:', err.message));
}

// Start server for Render
if (require.main === module) {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel
module.exports = app;
