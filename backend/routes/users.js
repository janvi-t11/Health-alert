const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('reports');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user profile
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Handle avatar upload
    if (req.file) {
      updates['profile.avatar'] = `/uploads/${req.file.filename}`;
    }
    
    // Handle nested profile updates
    if (req.body.bio) updates['profile.bio'] = req.body.bio;
    if (req.body.city) updates['profile.location.city'] = req.body.city;
    if (req.body.state) updates['profile.location.state'] = req.body.state;
    if (req.body.pincode) updates['profile.location.pincode'] = req.body.pincode;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET user reports
router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { notifications, emailAlerts } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'profile.preferences.notifications': notifications,
          'profile.preferences.emailAlerts': emailAlerts
        }
      },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;