const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  });
};

// Send order confirmation email
const sendOrderConfirmation = async (orderDetails) => {
  const { email, orderId, totalAmount, currency, items } = orderDetails;

  const transporter = createTransporter();

  // Build items list HTML
  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName || 'Product'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${currency === 'kes' ? 'KES' : currency.toUpperCase()} ${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('');

  const mailOptions = {
    from: `"Nuthu Archive" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation #${orderId} - Nuthu Archive`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; }
          .content { background: #fff; padding: 30px 20px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .total-row { font-weight: bold; font-size: 18px; padding-top: 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuthu Archive</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="content">
            <h2>Order Confirmation</h2>
            <p>Hi there,</p>
            <p>Thank you for shopping with Nuthu Archive. Your order has been received and is being processed.</p>
            
            <p><strong>Order Number:</strong> #${orderId}</p>
            <p><strong>Email:</strong> ${email}</p>
            
            <h3>Order Details:</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr class="total-row">
                  <td colspan="2" style="padding: 15px 10px; text-align: right;">Total:</td>
                  <td style="padding: 15px 10px; text-align: right;">
                    ${currency === 'kes' ? 'KES' : currency.toUpperCase()} ${totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <p>We'll send you another email once your order has been shipped.</p>
            
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/shop" class="button">Continue Shopping</a>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Nuthu Archive. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send email verification code
const sendVerificationEmail = async (email, verificationCode) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Nuthu Archive" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification - Nuthu Archive',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; }
          .content { background: #fff; padding: 30px 20px; text-align: center; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000; margin: 30px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuthu Archive</h1>
            <p>Email Verification</p>
          </div>
          
          <div class="content">
            <h2>Verify Your Email</h2>
            <p>Please use the following verification code to complete your checkout:</p>
            
            <div class="code">${verificationCode}</div>
            
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Nuthu Archive. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation,
  sendVerificationEmail,
};
