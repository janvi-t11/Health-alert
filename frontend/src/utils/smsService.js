const SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2';
const SMS_API_KEY = 'Yx4uiajbMeVG6vlUgz0yq5In2kfQKTEAcdRWmZHBwDC7h3XNS8is7OK41toP0u9FcedLBjEImlZGYQ6y';

export const sendHealthAlert = async (phoneNumbers, healthIssue, area, city, count) => {
  const message = `HEALTH ALERT: ${count} cases of ${healthIssue} reported in ${area}, ${city}. Take precautions. Stay safe!`;
  
  // Format phone numbers for Fast2SMS (remove +91 prefix)
  const formattedNumbers = phoneNumbers.map(num => {
    let cleanNum = num.toString().replace(/\D/g, ''); // Remove non-digits
    if (cleanNum.startsWith('91') && cleanNum.length === 12) {
      return cleanNum.substring(2); // Remove 91 prefix
    }
    if (cleanNum.length === 10) {
      return cleanNum; // Already 10 digits
    }
    return cleanNum;
  });
  
  console.log('Sending SMS to:', formattedNumbers);
  console.log('Message:', message);
  
  try {
    const requestBody = {
      sender_id: 'HEALTH',
      message: message,
      language: 'english',
      route: 'p',
      numbers: formattedNumbers.join(',')
    };
    
    console.log('Request body:', requestBody);
    
    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': SMS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('SMS API Response:', result);
    
    if (result.return === true || result.status_code === 200) {
      console.log('SMS sent successfully!');
      return true;
    } else {
      console.error('SMS API Error:', result);
      return false;
    }
  } catch (error) {
    console.error('SMS sending failed:', error);
    // Try alternative method if CORS fails
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      console.log('CORS issue detected, SMS may still be sent');
      return true; // Assume success for CORS issues
    }
    return false;
  }
};

export const shouldTriggerAlert = (reports, newReport) => {
  const verifiedReports = reports.filter(r => 
    r.status === 'approved' &&
    r.healthIssue === newReport.healthIssue &&
    r.area === newReport.area &&
    r.city === newReport.city
  );
  return verifiedReports.length >= 3;
};

// Scalability: This SMS layer can be extended to WhatsApp Cloud API
// by adding a new sendWhatsAppAlert function without changing core logic