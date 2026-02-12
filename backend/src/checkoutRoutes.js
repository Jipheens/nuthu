const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { pool } = require('./db');
const { createOrderInDB } = require('./orderService');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;

// POST /api/checkout/create-session
router.post('/create-session', async (req, res) => {
  const { items, currency = 'KES', customerEmail, orderData } = req.body;

  if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === 'your_paystack_secret_key_here') {
    return res.status(503).json({ message: 'Payment gateway is not configured on the server.' });
  }

  if (!Array.isArray(items) || !items.length) {

    return res.status(400).json({ message: 'No items to checkout' });
  }

  try {
    // 1. Create a pending order in our database first
    let orderId = null;
    if (orderData) {
      try {
        orderId = await createOrderInDB({
          ...orderData,
          paymentStatus: 'pending'
        });
      } catch (dbErr) {
        console.error('Failed to pre-create order:', dbErr);
      }
    }

    // Paystack takes amount in subunits (e.g., KES cents equivalent)
    // For KES, it's usually 1:100 (cents), but double check Paystack KES docs. 
    // Most Paystack currencies use subunits.
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const paystackData = {
      email: customerEmail,
      amount: Math.round(totalAmount * 100), // Amount in cents/shilling subunits
      currency: currency.toUpperCase(),
      callback_url: `${process.env.CLIENT_URL}/checkout/success`,
      metadata: {
        order_id: orderId ? String(orderId) : '',
        customer_email: customerEmail || '',
        shipping_address: orderData?.shipping_address || '',
        shipping_city: orderData?.shipping_city || '',
        phone_number: orderData?.phone_number || '',
        custom_fields: items.map(item => ({
          display_name: item.name,
          variable_name: item.name.toLowerCase().replace(/ /g, '_'),
          value: item.quantity
        }))
      }
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      // Paystack returns { status: true, data: { authorization_url, access_code, reference } }
      res.json({
        url: response.data.data.authorization_url,
        id: response.data.data.reference
      });
    } else {
      throw new Error(response.data.message || 'Paystack initialization failed');
    }

  } catch (err) {
    console.error('Error creating Paystack session', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to start checkout' });
  }
});

// POST /api/checkout/webhook
router.post('/webhook', async (req, res) => {
  // If we are using express.raw, req.body is a Buffer
  const body = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);

  const hash = crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET).update(body).digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    console.error('Paystack webhook signature mismatch');
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(body);

  // Handle the charge.success event
  if (event.event === 'charge.success') {
    const data = event.data;
    const orderId = data.metadata.order_id;

    console.log(`Payment confirmed for reference ${data.reference}, order ${orderId}`);

    if (orderId) {
      try {
        await pool.query(
          'UPDATE orders SET payment_status = "paid" WHERE id = ?',
          [orderId]
        );
        console.log(`Order ${orderId} marked as paid.`);
      } catch (dbErr) {
        console.error(`Failed to update order ${orderId}:`, dbErr);
      }
    }
  }

  res.status(200).send('Webhook Received');
});

// GET /api/checkout/session/:id (Verify transaction status)
router.get('/session/:id', async (req, res) => {
  const { id } = req.params; // This will be the Paystack reference

  if (!PAYSTACK_SECRET_KEY) return res.status(503).json({ message: 'Payment gateway not configured.' });

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${id}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.status) {
      const data = response.data.data;
      res.json({
        id: data.reference,
        status: data.status, // 'success', 'failed', etc.
        paymentStatus: data.status === 'success' ? 'paid' : 'unpaid',
        amountTotal: data.amount / 100,
        customerEmail: data.customer.email,
      });
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (err) {
    console.error('Error verifying Paystack transaction', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to retrieve checkout session' });
  }
});

module.exports = router;
