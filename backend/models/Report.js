const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  diseaseType: {
    type: String,
    required: false
  },
  healthIssue: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'critical'],
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'India'
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'approved', 'rejected'],
    default: 'active'
  },
  verified: {
    type: Boolean,
    default: false
  },
  aiAnalysis: {
    severity: String,
    riskCategory: String,
    urgencyScore: Number,
    recommendedActions: [String],
    communityRisk: String,
    aiConfidence: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);