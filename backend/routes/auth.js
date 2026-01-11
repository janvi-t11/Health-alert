const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Demo credentials
const DEMO_USER = { email: 'demo@healthalerts.com', password: 'demo123' };
const DEMO_ADMIN = { email: 'admin@healthalerts.com', password: 'admin123' };

// Admin register route
router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password, organization, authCode } = req.body;
    
    // Validate authorization code
    if (authCode !== 'ADMIN2024') {
      return res.status(400).json({ error: 'Invalid authorization code' });
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }
    
    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password,
      organization
    });
    
    await newAdmin.save();
    
    // Generate token
    const token = jwt.sign(
      { id: newAdmin._id, email: newAdmin.email, role: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      user: { email: newAdmin.email, role: 'admin', name: newAdmin.name },
      token
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Admin registration failed' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, location } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user with location stored as string for easy grouping
    const newUser = new User({
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone,
      profile: { 
        phone,
        location: location || 'Unknown' // Store as string
      }
    });
    
    await newUser.save();
    
    // Generate token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: 'user' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      user: { email: newUser.email, role: 'user', name: newUser.name },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    // Check demo user FIRST
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      console.log('Demo user login successful');
      const token = jwt.sign(
        { email: DEMO_USER.email, role: 'user' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        user: { email: DEMO_USER.email, role: 'user', name: 'Demo User' },
        token
      });
    }
    
    // Check demo admin FIRST
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      console.log('Demo admin login successful');
      const token = jwt.sign(
        { email: DEMO_ADMIN.email, role: 'admin' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        user: { email: DEMO_ADMIN.email, role: 'admin', name: 'Demo Admin' },
        token
      });
    }
    
    // Check registered users in database
    const user = await User.findOne({ email });
    if (user && await user.comparePassword(password)) {
      console.log('Database user login successful');
      const token = jwt.sign(
        { id: user._id, email: user.email, role: 'user' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        user: { email: user.email, role: 'user', name: user.name },
        token
      });
    }
    
    // Check registered admins in database
    const admin = await Admin.findOne({ email, isActive: true });
    if (admin && await admin.comparePassword(password)) {
      console.log('Database admin login successful');
      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        user: { email: admin.email, role: 'admin', name: admin.name },
        token
      });
    }
    
    console.log('Login failed: Invalid credentials');
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user stats (for admin dashboard)
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const adminCount = await Admin.countDocuments();
    
    res.json({
      success: true,
      stats: {
        users: userCount,
        admins: adminCount,
        total: userCount + adminCount
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get users by location (for admin dashboard)
router.get('/users-by-location', async (req, res) => {
  try {
    const users = await User.find({}, 'name email phone profile.location createdAt').lean();
    
    // Group users by location
    const locationMap = {};
    users.forEach(user => {
      const location = user.profile?.location || 'Unknown';
      if (!locationMap[location]) {
        locationMap[location] = {
          location,
          users: [],
          count: 0
        };
      }
      locationMap[location].users.push({
        name: user.name,
        email: user.email,
        phone: user.phone,
        registeredAt: user.createdAt
      });
      locationMap[location].count++;
    });
    
    res.json({
      success: true,
      data: Object.values(locationMap)
    });
  } catch (error) {
    console.error('Users by location error:', error);
    res.status(500).json({ error: 'Failed to fetch users by location' });
  }
});

module.exports = router;