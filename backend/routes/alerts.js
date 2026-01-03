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

// Generate WhatsApp alert URL for verified reports
router.get('/whatsapp/:reportId', async (req, res) => {
	try {
		const Report = require('../models/Report');
		const report = await Report.findById(req.params.reportId);
		if (!report || !report.verified) {
			return res.status(404).json({ error: 'Verified report not found' });
		}

		const alertUrl = `https://wa.me/?text=${encodeURIComponent(
			`🏥 Health Alert - ${report.area}, ${report.city}\n` +
			`Issue: ${report.healthIssue}\n` +
			`Severity: ${report.severity}\n` +
			`Date: ${new Date().toLocaleDateString('en-IN')}\n\n` +
			`Take necessary precautions. Consult healthcare professionals if needed.\n` +
			`#HealthAlert #CommunityHealth`
		)}`;

		res.json({ alertUrl });
	} catch (error) {
		res.status(500).json({ error: 'Failed to generate alert' });
	}
});

module.exports = router;


