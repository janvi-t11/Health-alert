const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-alerts', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/reports', require('./routes/reports'));
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Health Alerts API is running' });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    if (dbState === 1) {
      // Test admin collection
      const Admin = require('./models/Admin');
      const adminCount = await Admin.countDocuments();
      res.json({ 
        status: 'OK', 
        database: states[dbState],
        adminCount: adminCount,
        message: 'Database connection working' 
      });
    } else {
      res.json({ 
        status: 'ERROR', 
        database: states[dbState],
        message: 'Database not connected' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      message: 'Database test failed' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});