const Report = require('../models/Report');

/**
 * Auto-update report lifecycle status based on age
 * Active (0-7 days) -> Monitoring (8-30 days) -> Archived (30+ days)
 */
async function updateReportLifecycles() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Move active reports older than 7 days to monitoring
    await Report.updateMany(
      {
        createdAt: { $lt: sevenDaysAgo },
        'lifecycle.reportStatus': 'active'
      },
      {
        $set: { 'lifecycle.reportStatus': 'monitoring' }
      }
    );

    // Auto-archive reports older than 30 days (not already resolved)
    await Report.updateMany(
      {
        createdAt: { $lt: thirtyDaysAgo },
        'lifecycle.reportStatus': { $in: ['active', 'monitoring'] }
      },
      {
        $set: { 
          'lifecycle.reportStatus': 'archived',
          'lifecycle.autoResolved': true,
          'lifecycle.resolvedAt': now,
          'lifecycle.resolutionNote': 'Auto-archived after 30 days'
        }
      }
    );

    // Calculate days active for all reports
    const allReports = await Report.find({ 'lifecycle.reportStatus': { $ne: 'archived' } });
    for (const report of allReports) {
      const daysActive = Math.floor((now - report.createdAt) / (1000 * 60 * 60 * 24));
      report.lifecycle.daysActive = daysActive;
      await report.save();
    }

    console.log('Report lifecycles updated successfully');
  } catch (error) {
    console.error('Error updating report lifecycles:', error);
  }
}

/**
 * Get lifecycle statistics
 */
async function getLifecycleStats() {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$lifecycle.reportStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const userRecoveredCount = await Report.countDocuments({ 'lifecycle.userRecovered': true });
    const adminResolvedCount = await Report.countDocuments({ 
      'lifecycle.reportStatus': 'resolved',
      'lifecycle.autoResolved': false
    });
    const autoArchivedCount = await Report.countDocuments({ 'lifecycle.autoResolved': true });

    return {
      byStatus: stats,
      userRecovered: userRecoveredCount,
      adminResolved: adminResolvedCount,
      autoArchived: autoArchivedCount
    };
  } catch (error) {
    console.error('Error getting lifecycle stats:', error);
    return null;
  }
}

module.exports = {
  updateReportLifecycles,
  getLifecycleStats
};
