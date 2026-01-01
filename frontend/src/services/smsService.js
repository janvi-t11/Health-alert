// SMS Alert Service using Fast2SMS (Free Indian SMS service)
// Sign up at https://www.fast2sms.com for API key

const SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2';
const SMS_API_KEY = 'Yx4uiajbMeVG6vlUgz0yq5In2kfQKTEAcdRWmZHBwDC7h3XNS8is7OK41toP0u9FcedLBjEImlZGYQ6y';

export const smsService = {
  async sendHealthAlert(phoneNumbers, message) {
    console.log('Sending SMS Alert to:', phoneNumbers);
    console.log('Message:', message);
    
    try {
      const response = await fetch(SMS_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_id: 'HEALTH',
          message: message,
          language: 'english',
          route: 'p',
          numbers: phoneNumbers.join(',')
        })
      });
      
      const result = await response.json();
      console.log('SMS API Response:', result);
      
      if (result.return === true) {
        return {
          success: true,
          message: `SMS alerts sent to ${phoneNumbers.length} users`,
          demo: false
        };
      } else {
        throw new Error(result.message || 'SMS sending failed');
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      
      // Fallback to demo mode if API fails
      return {
        success: true,
        message: `SMS alerts would be sent to ${phoneNumbers.length} users (API Error: ${error.message})`,
        demo: true
      };
    }
  },

  generateHealthAlertMessage(healthIssue, area, city, count) {
    return `🚨 HEALTH ALERT: ${count} cases of ${healthIssue} reported in ${area}, ${city}. Take precautions. Stay safe! - Health Alert Platform`;
  }
};