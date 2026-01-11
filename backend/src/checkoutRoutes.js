const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
require('dotenv').config();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe = null;

if (stripeSecret) {
  stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
} else {
  console.warn('STRIPE_SECRET_KEY is not set. Checkout will be disabled.');
}

// POST /api/checkout/create-session (Stripe-hosted Checkout page)
router.post('/create-session', async (req, res) => {
  const { items, currency = 'kes' } = req.body;

  if (!stripe) {
    return res
      .status(500)
      .json({ message: 'Checkout is not configured. Please try again later.' });
  }

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: 'No items to checkout' });
  }

  try {
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
      success_url: `${process.env.CLIENT_URL}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session', err);
    res.status(500).json({ message: 'Failed to start checkout' });
  }
});

// POST /api/checkout/create-payment-intent (on-site card form via Stripe Elements)
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'kes' } = req.body;

  if (!stripe) {
    return res
      .status(500)
      .json({ message: 'Checkout is not configured. Please try again later.' });
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount for payment intent' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent', err);
    res.status(500).json({ message: 'Failed to start payment' });
  }
});

module.exports = router;
