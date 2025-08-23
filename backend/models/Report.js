const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
	{
		healthIssue: { type: String, required: true, index: true },
		severity: { type: String, required: true, enum: ['mild', 'moderate', 'severe'] },
		description: { type: String, default: '' },
		photoUrl: { type: String },
		country: { type: String, required: true, default: 'India' },
		state: { type: String, required: true },
		city: { type: String, required: true },
		area: { type: String, required: true },
		pincode: { type: String, required: true },
		status: { type: String, default: 'active', enum: ['active', 'critical', 'resolved', 'approved', 'rejected'] },
		verified: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

// Add index for location-based queries
ReportSchema.index({ country: 1, state: 1, city: 1 });
ReportSchema.index({ pincode: 1 });

module.exports = mongoose.model('Report', ReportSchema);


