const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
	cors: {
		origin: ['http://localhost:5173', 'http://localhost:5174'],
		methods: ['GET', 'POST']
	}
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir);
}

// Middlewares
app.use(cors({
	origin: ['http://localhost:5173', 'http://localhost:5174']
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadsDir));

// Socket.io on connection
io.on('connection', (socket) => {
	console.log('Client connected:', socket.id);
	socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Inject io in request for routes to emit events
app.use((req, res, next) => {
	req.io = io;
	next();
});

// Routes
const reportsRouter = require('./routes/reports');
const alertsRouter = require('./routes/alerts');
const authRouter = require('./routes/auth');
app.use('/api/reports', reportsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/auth', authRouter);

// Root routes
app.get('/', (req, res) => {
	res.json({ message: 'Health Alerts API is running', status: 'ok' });
});

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

// DB connection and server start
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_alerts';

mongoose.connect(MONGODB_URI)
	.then(() => {
		console.log('Connected to MongoDB');
		server.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
	})
	.catch((err) => {
		console.error('MongoDB connection error:', err.message);
		process.exit(1);
	});


