const emergencyProtocols = {
  // Critical disease types that trigger emergency protocols
  criticalDiseases: ['covid-19', 'dengue', 'malaria', 'cholera', 'plague'],
  
  // Emergency thresholds
  thresholds: {
    criticalSeverity: 'critical',
    multipleReports: 3, // Same disease in same area
    timeWindow: 24 * 60 * 60 * 1000 // 24 hours
  },

  // Check if report triggers emergency protocol
  async checkEmergencyTrigger(reportData, Report) {
    const triggers = [];
    
    // Check 1: Critical severity
    if (reportData.severity === this.thresholds.criticalSeverity) {
      triggers.push({
        type: 'CRITICAL_SEVERITY',
        message: `Critical severity report: ${reportData.diseaseType}`,
        priority: 'HIGH'
      });
    }

    // Check 2: Critical disease type
    if (this.criticalDiseases.includes(reportData.diseaseType?.toLowerCase())) {
      triggers.push({
        type: 'CRITICAL_DISEASE',
        message: `Critical disease reported: ${reportData.diseaseType}`,
        priority: 'HIGH'
      });
    }

    // Check 3: Multiple reports in same area
    const recentReports = await Report.find({
      diseaseType: reportData.diseaseType,
      city: reportData.city,
      state: reportData.state,
      createdAt: { $gte: new Date(Date.now() - this.thresholds.timeWindow) }
    });

    if (recentReports.length >= this.thresholds.multipleReports) {
      triggers.push({
        type: 'OUTBREAK_PATTERN',
        message: `${recentReports.length} cases of ${reportData.diseaseType} in ${reportData.city}`,
        priority: 'CRITICAL'
      });
    }

    return triggers;
  },

  // Generate emergency alert
  generateEmergencyAlert(triggers, reportData) {
    if (triggers.length === 0) return null;

    const highestPriority = triggers.reduce((max, trigger) => 
      trigger.priority === 'CRITICAL' ? 'CRITICAL' : 
      (trigger.priority === 'HIGH' && max !== 'CRITICAL') ? 'HIGH' : max
    , 'MEDIUM');

    return {
      type: 'EMERGENCY_ALERT',
      priority: highestPriority,
      location: `${reportData.city}, ${reportData.state}`,
      disease: reportData.diseaseType,
      triggers: triggers,
      timestamp: new Date(),
      actions: this.getRecommendedActions(highestPriority, reportData)
    };
  },

  // Get recommended emergency actions
  getRecommendedActions(priority, reportData) {
    const actions = [];

    if (priority === 'CRITICAL') {
      actions.push('Notify health authorities immediately');
      actions.push('Issue public health warning');
      actions.push('Deploy emergency response team');
      actions.push('Set up isolation protocols');
    } else if (priority === 'HIGH') {
      actions.push('Alert local health department');
      actions.push('Increase surveillance in area');
      actions.push('Prepare emergency resources');
    }

    return actions;
  },

  // Simulate notification to authorities (in real app, would send emails/SMS)
  async notifyAuthorities(emergencyAlert) {
    console.log('🚨 EMERGENCY ALERT TRIGGERED 🚨');
    console.log('Priority:', emergencyAlert.priority);
    console.log('Location:', emergencyAlert.location);
    console.log('Disease:', emergencyAlert.disease);
    console.log('Actions:', emergencyAlert.actions);
    
    // In production, implement actual notifications:
    // - Send emails to health officials
    // - Send SMS alerts
    // - Post to emergency systems
    // - Create dashboard alerts
    
    return {
      notified: true,
      timestamp: new Date(),
      channels: ['console'] // In production: ['email', 'sms', 'dashboard']
    };
  }
};

module.exports = emergencyProtocols;