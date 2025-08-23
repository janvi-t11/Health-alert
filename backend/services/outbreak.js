const geolib = require('geolib');
const Report = require('../models/Report');
const Alert = require('../models/Alert');

// Tunable thresholds
const DEFAULT_THRESHOLD_COUNT = Number(process.env.OUTBREAK_COUNT || 10);
const DEFAULT_RADIUS_KM = Number(process.env.OUTBREAK_RADIUS_KM || 2);
const DEFAULT_WINDOW_HOURS = Number(process.env.OUTBREAK_WINDOW_HOURS || 24);

async function detectOutbreaks({ io }) {
	const since = new Date(Date.now() - DEFAULT_WINDOW_HOURS * 60 * 60 * 1000);
	// Fetch recent reports
	const recentReports = await Report.find({ createdAt: { $gte: since } }).lean();
	if (!recentReports.length) return;

	// Group by diseaseType and location (city level)
	const byDiseaseAndLocation = recentReports.reduce((acc, r) => {
		const key = `${r.diseaseType}-${r.city}-${r.state}`;
		(acc[key] = acc[key] || []).push(r);
		return acc;
	}, {});

	for (const [key, reports] of Object.entries(byDiseaseAndLocation)) {
		if (reports.length >= DEFAULT_THRESHOLD_COUNT) {
			const diseaseType = reports[0].diseaseType;
			const location = `${reports[0].city}, ${reports[0].state}`;
			
			// Check if alert already exists for this disease and location
			const existing = await Alert.findOne({
				diseaseType,
				active: true,
				createdAt: { $gte: since },
				'meta.location': location
			});
			
			if (!existing) {
				const message = `Potential ${diseaseType} outbreak in ${location}: ${reports.length} cases reported in last ${DEFAULT_WINDOW_HOURS}h`;
				const alert = await Alert.create({
					diseaseType,
					message,
					meta: {
						count: reports.length,
						location: location,
						windowHours: DEFAULT_WINDOW_HOURS
					}
				});
				io.emit('new-alert', alert);
			}
		}
	}
}

module.exports = { detectOutbreaks };


