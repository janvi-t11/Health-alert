const severityAnalyzer = {
  // Disease severity mapping
  diseaseSeverity: {
    'dengue': 'high',
    'malaria': 'high', 
    'covid-19': 'critical',
    'typhoid': 'moderate',
    'chikungunya': 'moderate',
    'food poisoning': 'low',
    'diarrhea': 'low',
    'fever': 'low'
  },

  // Keyword-based severity detection
  severityKeywords: {
    critical: ['death', 'died', 'fatal', 'emergency', 'icu', 'ventilator', 'outbreak'],
    high: ['hospitalized', 'severe', 'spreading', 'multiple cases', 'epidemic'],
    moderate: ['sick', 'symptoms', 'treatment', 'doctor', 'clinic'],
    low: ['mild', 'recovering', 'better', 'single case']
  },

  // Analyze severity based on report data
  analyzeSeverity(reportData) {
    const { diseaseType, description, healthIssue } = reportData;
    let severity = 'low'; // default
    let score = 0;

    // Check disease type severity
    const diseaseKey = diseaseType?.toLowerCase();
    if (this.diseaseSeverity[diseaseKey]) {
      const diseaseSev = this.diseaseSeverity[diseaseKey];
      score += this.getSeverityScore(diseaseSev);
    }

    // Analyze description for keywords
    const text = `${description} ${healthIssue}`.toLowerCase();
    
    for (const [level, keywords] of Object.entries(this.severityKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > 0) {
        score += this.getSeverityScore(level) * matches;
      }
    }

    // Determine final severity
    if (score >= 15) severity = 'critical';
    else if (score >= 10) severity = 'high';
    else if (score >= 5) severity = 'moderate';
    else severity = 'low';

    return {
      severity,
      score,
      confidence: Math.min(score / 15, 1.0)
    };
  },

  getSeverityScore(level) {
    const scores = { low: 1, moderate: 3, high: 5, critical: 8 };
    return scores[level] || 1;
  }
};

module.exports = severityAnalyzer;