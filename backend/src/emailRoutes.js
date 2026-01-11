const express = require('express');
const router = express.Router();
const { sendVerificationEmail } = require('./emailService');

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const verificationCode = generateVerificationCode();
    
    // Store code with expiration (10 minutes)
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await sendVerificationEmail(email, verificationCode);

    res.json({ 
      success: true, 
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ 
      error: 'Failed to send verification email',
      details: error.message,
    });
  }
});

// Verify the code
router.post('/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return res.status(400).json({ error: 'No verification code found for this email' });
    }

    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Code is valid, remove it
    verificationCodes.delete(email);

    res.json({ 
      success: true, 
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ 
      error: 'Failed to verify code',
      details: error.message,
    });
  }
});

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expires) {
      verificationCodes.delete(email);
    }
  }
}, 5 * 60 * 1000);

module.exports = router;
