const nodemailer = require('nodemailer');

const isPlaceholder = (value) => {
  if (!value) return true;
  const v = String(value).trim().toLowerCase();
  return v === 'your_app_password_here' || v === 'your_gmail_app_password';
};

// Create a transporter using Gmail SMTP (production) or Ethereal (dev fallback)
const createTransporter = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (user && pass && !isPlaceholder(pass)) {
    return {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      }),
      mode: 'gmail',
    };
  }

  // Dev-friendly fallback: Ethereal test inbox (prints preview URL in logs)
  const testAccount = await nodemailer.createTestAccount();
  return {
    transporter: nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    }),
    mode: 'ethereal',
    testAccount,
  };
};

// Send order confirmation email
const sendOrderConfirmation = async (orderDetails) => {
  const {
    email,
    orderId,
    totalAmount,
    currency,
    items,
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_zip,
    shipping_country,
    phone_number
  } = orderDetails;

  const { transporter, mode } = await createTransporter();

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
    from: `"Archivesbybilly" <${process.env.EMAIL_USER || 'no-reply@archivesbybilly'}>`,
    to: email,
    subject: `Order Confirmation #${orderId} - Archivesbybilly`,
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
            <h1>Archivesbybilly</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="content">
            <h2>Order Confirmation</h2>
            <p>Hi there,</p>
            <p>Thank you for shopping with Archivesbybilly. Your order has been received and is being processed.</p>
            
            <p><strong>Order Number:</strong> #${orderId}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone_number ? `<p><strong>Phone:</strong> ${phone_number}</p>` : ''}

            <h3>Shipping Address:</h3>
            <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #000;">
              ${shipping_address || 'N/A'}<br>
              ${shipping_city || ''}${shipping_state ? `, ${shipping_state}` : ''} ${shipping_zip || ''}<br>
              ${shipping_country || ''}
            </p>
            
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
            <p>© ${new Date().getFullYear()} Archivesbybilly. All rights reserved.</p>
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
    const previewUrl = mode === 'ethereal' ? nodemailer.getTestMessageUrl(info) : undefined;
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send email verification code
const sendVerificationEmail = async (email, verificationCode) => {
  const { transporter, mode } = await createTransporter();

  const mailOptions = {
    from: `"Archivesbybilly" <${process.env.EMAIL_USER || 'no-reply@archivesbybilly'}>`,
    to: email,
    subject: 'Email Verification - Archivesbybilly',
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
            <h1>Archivesbybilly</h1>
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
            <p>© ${new Date().getFullYear()} Archivesbybilly. All rights reserved.</p>
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
    const previewUrl = mode === 'ethereal' ? nodemailer.getTestMessageUrl(info) : undefined;
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation,
  sendVerificationEmail,
};
