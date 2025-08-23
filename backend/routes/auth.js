const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Check if email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password endpoint
router.post('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email not found. Please sign up first.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password. Please try again.' });
    }

    if (user.userType !== userType) {
      return res.status(400).json({ error: `This email is registered as ${user.userType}. Please select the correct user type.` });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        name: user.name
      },
      token: 'jwt-token-' + user._id
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email not found in our records' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Temporary password generated',
      tempPassword: tempPassword // In production, this should be sent via email
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, userType, name } = req.body;
    
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists. Please login instead.' });
    }

    const user = await User.create({
      email,
      password,
      userType,
      name
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        name: user.name
      },
      token: 'jwt-token-' + user._id
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists. Please login instead.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;