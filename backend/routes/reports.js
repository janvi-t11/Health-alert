const express = require('express');
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const { detectOutbreaks } = require('../services/outbreak');

const router = express.Router();

// Multer setup for photo uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '..', 'uploads'));
	},
	filename: (req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, `report-${unique}${ext}`);
	}
});
const upload = multer({ storage });

// POST /api/reports
router.post('/', upload.single('photo'), async (req, res) => {
	try {
		const { diseaseType, description, latitude, longitude, healthIssue, severity, country, state, city, area, pincode } = req.body;
		
		// Validate required fields
		if (!healthIssue || !severity || !state || !city || !area || !pincode) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const reportData = {
			diseaseType: diseaseType || healthIssue,
			healthIssue,
			severity,
			description: description || '',
			country: country || 'India',
			state,
			city,
			area,
			pincode,
			status: 'active', // New reports start as active (pending)
			verified: false,
			rejected: false,
			photoUrl: req.file ? `/uploads/${req.file.filename}` : undefined
		};

		// Add location if provided
		if (latitude && longitude) {
			reportData.location = { 
				type: 'Point', 
				coordinates: [Number(longitude), Number(latitude)] 
			};
		}

		const report = await Report.create(reportData);
		console.log('Report created successfully:', report._id);

		// Emit to clients
		req.io.emit('new-report', report);

		// Run outbreak detection asynchronously
		detectOutbreaks({ io: req.io }).catch(() => undefined);

		res.status(201).json(report);
	} catch (err) {
		console.error('Error creating report:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /api/reports
router.get('/', async (req, res) => {
	try {
		const { diseaseType, from, to, lat, lng, radiusKm, status } = req.query;
		const query = {};
		
		if (diseaseType) query.diseaseType = diseaseType;
		if (status) query.status = status;
		if (from || to) {
			query.createdAt = {};
			if (from) query.createdAt.$gte = new Date(from);
			if (to) query.createdAt.$lte = new Date(to);
		}

		let aggregation = [
			{ $match: query },
			{ $sort: { createdAt: -1 } }
		];

		if (lat && lng && radiusKm) {
			aggregation.unshift({
				$geoNear: {
					near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
					distanceField: 'distance',
					spherical: true,
					maxDistance: Number(radiusKm) * 1000
				}
			});
		}

		const results = await Report.aggregate(aggregation);
		res.json(results);
	} catch (err) {
		console.error('Error fetching reports:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// PATCH /api/reports/:id
router.patch('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		
		const report = await Report.findByIdAndUpdate(
			id, 
			updates, 
			{ new: true, runValidators: true }
		);
		
		if (!report) {
			return res.status(404).json({ error: 'Report not found' });
		}

		// Emit update to clients
		req.io.emit('report-updated', report);

		res.json(report);
	} catch (err) {
		console.error('Error updating report:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// PATCH /api/reports/:id/verify
router.patch('/:id/verify', async (req, res) => {
	try {
		const { id } = req.params;
		const { verified } = req.body;
		
		const updateData = {
			verified: verified,
			rejected: !verified,
			status: verified ? 'approved' : 'rejected',
			verifiedAt: verified ? new Date() : null
		};
		
		const report = await Report.findByIdAndUpdate(
			id, 
			updateData, 
			{ new: true, runValidators: true }
		);
		
		if (!report) {
			return res.status(404).json({ error: 'Report not found' });
		}

		// Emit update to clients
		req.io.emit('report-updated', report);

		res.json(report);
	} catch (err) {
		console.error('Error verifying report:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// PUT /api/reports/:id/approve
router.put('/:id/approve', async (req, res) => {
	try {
		const { id } = req.params;
		
		const report = await Report.findByIdAndUpdate(
			id,
			{ 
				status: 'approved',
				verified: true,
				rejected: false,
				verifiedAt: new Date()
			},
			{ new: true }
		);
		
		if (!report) {
			return res.status(404).json({ error: 'Report not found' });
		}

		// Emit update to clients
		req.io.emit('report-updated', report);

		res.json(report);
	} catch (err) {
		console.error('Error approving report:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// PUT /api/reports/:id/reject
router.put('/:id/reject', async (req, res) => {
	try {
		const { id } = req.params;
		
		const report = await Report.findByIdAndUpdate(
			id,
			{ 
				status: 'rejected',
				verified: false,
				rejected: true,
				verifiedAt: new Date()
			},
			{ new: true }
		);
		
		if (!report) {
			return res.status(404).json({ error: 'Report not found' });
		}

		// Emit update to clients
		req.io.emit('report-updated', report);

		res.json(report);
	} catch (err) {
		console.error('Error rejecting report:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// DELETE /api/reports/:id
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		
		const report = await Report.findByIdAndDelete(id);
		
		if (!report) {
			return res.status(404).json({ error: 'Report not found' });
		}

		// Emit deletion to clients
		req.io.emit('report-deleted', { id });

		res.json({ message: 'Report deleted successfully' });
	} catch (err) {
		console.error('Error deleting report:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

module.exports = router;


