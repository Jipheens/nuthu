/**
 * Email Test Script
 * 
 * This script tests the email functionality without needing to go through
 * the full checkout process.
 * 
 * Usage:
 * 1. Make sure backend is running (npm run dev)
 * 2. Run: node test-email.js
 */

require('dotenv').config();
const { sendOrderConfirmation, sendVerificationEmail } = require('./src/emailService');

async function testEmails() {
  console.log('🧪 Testing Email Functionality...\n');

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('❌ ERROR: Email credentials not configured!');
    console.log('\nPlease set up:');
    console.log('  EMAIL_USER=jipheensworkmail@gmail.com');
    console.log('  EMAIL_APP_PASSWORD=your_app_password_here');
    console.log('\nSee EMAIL_QUICKSTART.md for setup instructions.');
    return;
  }

  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 App Password:', process.env.EMAIL_APP_PASSWORD ? '✓ Set' : '✗ Missing');
  console.log();

  try {
    // Test 1: Verification Email
    console.log('📬 Test 1: Sending verification email...');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await sendVerificationEmail(process.env.EMAIL_USER, code);
    console.log('✅ Verification email sent successfully!');
    console.log(`   Code: ${code}`);
    console.log();

    // Test 2: Order Confirmation Email
    console.log('📦 Test 2: Sending order confirmation email...');
    await sendOrderConfirmation({
      email: process.env.EMAIL_USER,
      orderId: 'TEST-' + Date.now(),
      totalAmount: 5000,
      currency: 'kes',
      items: [
        {
          productName: 'Test Product 1',
          quantity: 2,
          price: 1500,
        },
        {
          productName: 'Test Product 2',
          quantity: 1,
          price: 2000,
        },
      ],
    });
    console.log('✅ Order confirmation email sent successfully!');
    console.log();

    console.log('🎉 All email tests passed!');
    console.log(`📬 Check your inbox: ${process.env.EMAIL_USER}`);
    console.log('💡 Tip: Check spam folder if you don\'t see the emails.');
  } catch (error) {
    console.error('❌ Error testing emails:', error.message);
    console.log('\n🔍 Common issues:');
    console.log('  • Using regular Gmail password instead of App Password');
    console.log('  • 2FA not enabled on Gmail account');
    console.log('  • Incorrect EMAIL_APP_PASSWORD in .env');
    console.log('  • Firewall blocking SMTP connections');
    console.log('\n📖 See EMAIL_QUICKSTART.md for troubleshooting.');
  }
}

// Run the test
testEmails();
