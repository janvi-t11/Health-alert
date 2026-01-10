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
    enum: ['low', 'moderate', 'high', 'critical'],
    required: true  // Make it required, no default
  },
  autoSeverity: {
    severity: String,
    score: Number,
    confidence: Number
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
    enum: ['pending', 'active', 'monitoring', 'resolved', 'archived', 'approved', 'rejected'],
    default: 'pending'
  },
  verified: {
    type: Boolean,
    default: false
  },
  lifecycle: {
    reportStatus: {
      type: String,
      enum: ['active', 'monitoring', 'resolved', 'archived'],
      default: 'active'
    },
    userRecovered: {
      type: Boolean,
      default: false
    },
    userRecoveredAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    resolvedAt: Date,
    resolutionNote: String,
    autoResolved: {
      type: Boolean,
      default: false
    },
    daysActive: Number
  },
  aiAnalysis: {
    severity: String,
    riskCategory: String,
    urgencyScore: Number,
    recommendedActions: [String],
    communityRisk: String,
    aiConfidence: Number
  },
  fakeDetection: {
    isFake: Boolean,
    confidence: Number,
    riskLevel: String,
    flags: [String],
    qualityScore: Number,
    recommendation: String,
    reasoning: String,
    analyzedAt: Date,
    model: String
  },
  images: [{
    url: String,
    caption: String,
    filename: String
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  emergencyAlert: {
    triggered: { type: Boolean, default: false },
    priority: String,
    notifiedAt: Date,
    actions: [String]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);