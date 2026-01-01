const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// In-memory user storage for demo (replace with database in production)
const users = [
  { email: 'demo@healthalerts.com', password: 'demo123', role: 'user' }
];

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
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const newUser = {
      email,
      password, // In production, hash this password
      role: 'user',
      firstName,
      lastName,
      phone,
      location
    };
    
    users.push(newUser);
    
    // Generate token
    const token = jwt.sign(
      { email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      user: { email: newUser.email, role: newUser.role },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check in-memory users first (for demo users)
    const demoUser = users.find(u => u.email === email && u.password === password);
    if (demoUser) {
      const token = jwt.sign(
        { email: demoUser.email, role: demoUser.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        user: { email: demoUser.email, role: demoUser.role },
        token
      });
    }
    
    // Check registered admins in database
    const admin = await Admin.findOne({ email, isActive: true });
    if (admin && await admin.comparePassword(password)) {
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
    
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;