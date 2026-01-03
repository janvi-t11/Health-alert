const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
	origin: ['http://localhost:5173', 'http://localhost:5174', 'https://healthalertplatform.netlify.app', 'https://health-alert.vercel.app'],
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
		.then(() => console.log('Connected to MongoDB'))
		.catch((err) => console.error('MongoDB connection error:', err.message));
}

// Start server for Render
if (require.main === module) {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel
module.exports = app;
