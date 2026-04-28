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

// Reverse geocode proxy — Nominatim server-side (no CORS)
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