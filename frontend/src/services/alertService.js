// SMS Alert Notification Service
// Sends real SMS alerts to registered users
// Uses Fast2SMS for Indian phone numbers

import { smsService } from './smsService';

class AlertService {
  
  // Send SMS alert to users in affected area
  async triggerHealthAlert(reports, newReport) {
    const sameAreaReports = reports.filter(report => 
      report.status === 'approved' &&
      report.healthIssue === newReport.healthIssue &&
      report.area === newReport.area &&
      report.city === newReport.city
    );

    if (sameAreaReports.length >= 3) {
      // Get phone numbers of users in the same area
      const phoneNumbers = sameAreaReports
        .map(report => report.phone)
        .filter(phone => phone && phone.trim() !== '');

      if (phoneNumbers.length > 0) {
        const message = smsService.generateHealthAlertMessage(
          newReport.healthIssue,
          newReport.area,
          newReport.city,
          sameAreaReports.length
        );

        try {
          const result = await smsService.sendHealthAlert(phoneNumbers, message);
          console.log('SMS Alert Result:', result);
          
          // Show success message
          if (result.demo) {
            alert(`📱 SMS Alert Demo: Would send to ${phoneNumbers.length} users\n\nMessage: "${message}"`);
          } else {
            alert(`✅ SMS alerts sent to ${phoneNumbers.length} users in ${newReport.area}`);
          }
          
          return true;
        } catch (error) {
          console.error('Failed to send SMS alerts:', error);
          alert('❌ Failed to send SMS alerts. Please try again.');
          return false;
        }
      } else {
        alert('⚠️ No phone numbers available for SMS alerts in this area.');
        return false;
      }
    }
    
    return false;
  }
}

export const alertService = new AlertService();