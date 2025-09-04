const express = require('express');
const router = express.Router();

// POST /api/ai/analyze
router.post('/analyze', async (req, res) => {
  try {
    // Simple mock AI analysis for now
    const { diseaseType, healthIssue, description } = req.body;
    
    // Basic severity mapping
    const severityMap = {
      'dengue': 'severe',
      'malaria': 'severe',
      'covid-19': 'critical',
      'typhoid': 'moderate',
      'food poisoning': 'mild',
      'fever': 'mild'
    };
    
    const severity = severityMap[diseaseType?.toLowerCase()] || 'moderate';
    
    const analysis = {
      severity,
      riskCategory: 'infectious',
      urgencyScore: severity === 'critical' ? 9 : severity === 'severe' ? 7 : severity === 'moderate' ? 5 : 3,
      recommendedActions: [
        'Monitor symptoms closely',
        'Seek medical attention if symptoms worsen',
        'Maintain isolation if infectious'
      ],
      communityRisk: severity === 'critical' ? 'high' : 'medium',
      aiConfidence: 0.8
    };
    
    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

module.exports = router;