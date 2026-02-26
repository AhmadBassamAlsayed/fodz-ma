const axios = require('axios');

const BEON_API_URL = 'https://v3.api.beon.chat/api/v3/messages/otp';
const BEON_TOKEN = process.env.BEON_TOKEN;

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phoneNumber, otpCode, name = 'test') => {
  try {
    if (!BEON_TOKEN) {
      throw new Error('BEON_TOKEN is not configured in environment variables');
    }

    const payload = {
      name: name,
      type: 'sms',
      lang: 'ar',
      custom_code: otpCode,
      phoneNumber: phoneNumber
    };

    const response = await axios.post(BEON_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEON_TOKEN}`
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('BeOn OTP Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

module.exports = {
  generateOTP,
  sendOTP
};
