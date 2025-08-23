const express = require('express');
const router = express.Router();

// Simple auth for demo
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo credentials
  if ((email === 'demo@healthalerts.com' && password === 'demo123') || password === 'demo') {
    res.json({ success: true, user: { email, role: 'user' } });
  } else if ((email === 'admin@healthalerts.com' && password === 'admin123') || password === 'admin') {
    res.json({ success: true, user: { email, role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;