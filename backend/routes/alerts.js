const express = require('express');
const Alert = require('../models/Alert');

const router = express.Router();

// GET /api/alerts
router.get('/', async (req, res) => {
	try {
		const { active } = req.query;
		const query = {};
		if (typeof active !== 'undefined') query.active = active === 'true';
		const alerts = await Alert.find(query).sort({ createdAt: -1 }).lean();
		res.json(alerts);
	} catch (err) {
		console.error('Error fetching alerts:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

module.exports = router;


