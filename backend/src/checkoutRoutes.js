const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { pool } = require('./db');
const { createOrderInDB } = require('./orderService');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
let stripe = null;

// ... (ALL_COUNTRIES and helper functions remain same)

const normalizeStripeSecret = (key) => {
  if (!key) return '';
  return String(key).trim().replace(/^['"]|['"]$/g, '');
};

const isStripeSecretKeyPlaceholderOrRedacted = (key) => {
  if (!key) return true;
  const v = normalizeStripeSecret(key);
  if (!v) return true;
  if (v.includes('your_key_here') || v.includes('your_stripe_secret_key')) return true;
  if (v === 'sk_test_your_key_here' || v === 'sk_live_your_key_here') return true;
  if (v.includes('*') || v.includes('…') || v.toLowerCase().includes('redacted')) return true;
  return false;
};

const isValidStripeSecretKeyFormat = (key) => {
  const v = normalizeStripeSecret(key);
  return /^sk_(test|live)_[A-Za-z0-9]+$/.test(v);
};

const stripeSecretNormalized = normalizeStripeSecret(stripeSecret);

if (
  stripeSecretNormalized &&
  !isStripeSecretKeyPlaceholderOrRedacted(stripeSecretNormalized) &&
  isValidStripeSecretKeyFormat(stripeSecretNormalized)
) {
  stripe = new Stripe(stripeSecretNormalized, { apiVersion: '2024-06-20' });
} else {
  console.warn(
    'Stripe is not configured (missing/placeholder/invalid STRIPE_SECRET_KEY). Checkout will be disabled.'
  );
}

// POST /api/checkout/create-session
router.post('/create-session', async (req, res) => {
  const { items, currency = 'kes', customerEmail, orderData } = req.body;

  if (!stripe) {
    return res.status(503).json({ message: 'Checkout is not configured on the server.' });
  }

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: 'No items to checkout' });
  }

  try {
    // 1. Create a pending order in our database first
    // This ensures we have a record even before they pay.
    let orderId = null;
    if (orderData) {
      try {
        orderId = await createOrderInDB({
          ...orderData,
          paymentStatus: 'pending'
        });
      } catch (dbErr) {
        console.error('Failed to pre-create order:', dbErr);
        // We continue anyway, the webhook might still work with metadata
      }
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      customer_email: customerEmail || undefined,
      metadata: {
        order_id: orderId ? String(orderId) : '',
        customer_email: customerEmail || ''
      },
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ['KE', 'US', 'GB', 'CA'], // Adjust as needed
      },
    });

    res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('Error creating checkout session', err);
    res.status(500).json({ message: 'Failed to start checkout' });
  }
});

// POST /api/checkout/webhook
// This is called by Stripe when the payment is successful
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (!webhookSecret) {
    console.error('Webhook secret is not configured.');
    return res.status(400).send('Webhook Error: Secret missing');
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.order_id;

    console.log(`Payment confirmed for session ${session.id}, order ${orderId}`);

    if (orderId) {
      try {
        // Update order status in database
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

  res.json({ received: true });
});

// GET /api/checkout/session/:id (retrieve status after redirect)
router.get('/session/:id', async (req, res) => {
  const { id } = req.params;

  if (!stripe) return res.status(503).json({ message: 'Checkout is not configured.' });

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    res.json({
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      customerEmail: session.customer_details?.email || session.metadata.customer_email || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve checkout session' });
  }
});

module.exports = router;

