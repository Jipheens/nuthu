# Email Setup Guide for Gmail SMTP

## Prerequisites
You need a Gmail account and an App Password (not your regular Gmail password).

## Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

## Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "Nuthu Archive Backend" as the name
5. Click **Generate**
6. Copy the 16-character password (remove spaces)

## Step 3: Update Backend .env File
Open `backend/.env` and update:

```env
EMAIL_USER=jipheensworkmail@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password_here
```

Replace `your_16_char_app_password_here` with the App Password you generated.

## Step 4: Restart Backend Server
```bash
cd backend
npm run dev
```

## Testing Email Functionality

### Test Order Confirmation Email
1. Complete a purchase on the website
2. Check jipheensworkmail@gmail.com for the order confirmation

### Test Verification Email (if implemented)
1. Enter your email during checkout
2. Check for the verification code email
3. Enter the code to verify

## Troubleshooting

### "Invalid credentials" error
- Make sure you're using the App Password, not your regular Gmail password
- Check that 2FA is enabled on your Google account
- Verify EMAIL_USER and EMAIL_APP_PASSWORD in .env are correct

### Emails not arriving
- Check spam folder
- Verify EMAIL_USER is correct in .env
- Check backend console for error messages
- Ensure your Gmail account allows less secure app access

### "Connection timeout" error
- Check your internet connection
- Verify firewall isn't blocking port 587
- Try using port 465 (SSL) instead in emailService.js

## Email Features Implemented

### 1. Order Confirmation Emails
- Sent automatically after successful payment
- Includes order details, items, and total
- Professional HTML template
- Sent to customer's email address

### 2. Email Verification (Optional)
- API endpoints available at:
  - POST `/api/email/send-verification` - Send verification code
  - POST `/api/email/verify-code` - Verify the code
- 6-digit verification codes
- 10-minute expiration
- Can be integrated into checkout flow

## Email Templates

Emails include:
- Nuthu Archive branding
- Order/verification details
- Professional HTML styling
- Responsive design
- Footer with copyright notice

## Security Notes
- Never commit .env file with real App Password to git
- App Passwords are specific to each application
- You can revoke App Passwords at any time from your Google Account
- Store .env file securely
