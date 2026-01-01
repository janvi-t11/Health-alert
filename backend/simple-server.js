const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_alerts';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import models
const Report = require('./models/Report');
const Admin = require('./models/Admin');
const User = require('./models/User');

// Reports routes
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      status: 'active',
      verified: false
    };
    const report = new Report(reportData);
    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/reports/:id/approve', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', verified: true },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/reports/:id/reject', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', verified: false },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted successfully', deletedReport: report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Auth routes
app.post('/api/auth/admin/register', async (req, res) => {
  try {
    const { email, password, authCode, name, organization } = req.body;
    
    console.log('Admin registration attempt:', email);
    
    const validAuthCodes = ['HEALTH_ADMIN_2024', 'MEDICAL_AUTH_2024', 'GOVT_HEALTH_2024', 'ADMIN2024'];
    if (!validAuthCodes.includes(authCode)) {
      return res.status(401).json({ error: 'Invalid authorization code' });
    }
    
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin already exists:', email);
      return res.status(400).json({ error: 'Admin already exists. Please login instead.' });
    }
    
    const newAdmin = new Admin({ name, email, password, organization });
    await newAdmin.save();
    console.log('Admin registered successfully:', email);
    
    const token = 'jwt_token_' + newAdmin._id;
    res.status(201).json({
      success: true,
      user: { email: newAdmin.email, role: 'admin', name: newAdmin.name },
      token
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: error.message || 'Admin registration failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, location } = req.body;
    
    console.log('User registration attempt:', email);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists. Please login instead.' });
    }
    
    const newUser = new User({ 
      name: `${firstName} ${lastName}`,
      email, 
      password, 
      phone
    });
    await newUser.save();
    console.log('User registered successfully:', email);
    
    const token = 'jwt_token_' + newUser._id;
    res.json({
      success: true,
      user: { email: newUser.email, role: 'user', name: newUser.name },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    // Check demo users
    if (email === 'demo@healthalerts.com' && password === 'demo123') {
      return res.json({
        success: true,
        user: { email, role: 'user', name: 'Demo User' },
        token: 'jwt_token_demo'
      });
    }
    if (email === 'admin@healthalerts.com' && password === 'admin123') {
      return res.json({
        success: true,
        user: { email, role: 'admin', name: 'System Admin' },
        token: 'jwt_token_admin'
      });
    }
    
    // Check admin in database
    const admin = await Admin.findOne({ email });
    console.log('Admin found:', admin ? 'Yes' : 'No');
    if (admin) {
      console.log('Admin isActive:', admin.isActive);
      try {
        const isMatch = await admin.comparePassword(password);
        console.log('Admin password match:', isMatch);
        if (isMatch) {
          return res.json({
            success: true,
            user: { email: admin.email, role: 'admin', name: admin.name },
            token: 'jwt_token_' + admin._id
          });
        }
      } catch (err) {
        console.error('Admin password comparison error:', err);
      }
    }
    
    // Check user in database
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      try {
        const isMatch = await user.comparePassword(password);
        console.log('User password match:', isMatch);
        if (isMatch) {
          return res.json({
            success: true,
            user: { email: user.email, role: 'user', name: user.name },
            token: 'jwt_token_' + user._id
          });
        }
      } catch (err) {
        console.error('User password comparison error:', err);
      }
    }
    
    console.log('Login failed - invalid credentials');
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Health Alerts API is running', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB: ${MONGODB_URI}`);
});