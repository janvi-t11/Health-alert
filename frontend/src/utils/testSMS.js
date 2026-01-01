// Test SMS functionality directly
const testSMS = async () => {
  const SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2';
  const SMS_API_KEY = 'Yx4uiajbMeVG6vlUgz0yq5In2kfQKTEAcdRWmZHBwDC7h3XNS8is7OK41toP0u9FcedLBjEImlZGYQ6y';
  
  const testNumber = '7972754921'; // Without +91
  const testMessage = 'Test SMS from Health Alert Platform';
  
  try {
    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender_id: 'HEALTH',
        message: testMessage,
        language: 'english',
        route: 'p',
        numbers: testNumber
      })
    });
    
    const result = await response.json();
    console.log('Test SMS Response:', result);
    return result;
  } catch (error) {
    console.error('Test SMS Error:', error);
    return { error: error.message };
  }
};

// Call this function in browser console to test
window.testSMS = testSMS;

export { testSMS };