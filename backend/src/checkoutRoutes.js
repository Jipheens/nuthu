const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe = null;

// ISO 3166-1 alpha-2 country codes (used by Stripe for allowed shipping countries).
// Stripe requires an explicit list; we support STRIPE_ALLOWED_COUNTRIES=ALL to enable a broad set.
const ALL_COUNTRIES = [
  'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
  'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ',
  'CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ',
  'DE','DJ','DK','DM','DO','DZ',
  'EC','EE','EG','EH','ER','ES','ET',
  'FI','FJ','FK','FM','FO','FR',
  'GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY',
  'HK','HM','HN','HR','HT','HU',
  'ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT',
  'JE','JM','JO','JP',
  'KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ',
  'LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY',
  'MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ',
  'NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ',
  'OM',
  'PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY',
  'QA',
  'RE','RO','RS','RU','RW',
  'SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ',
  'TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ',
  'UA','UG','UM','US','UY','UZ',
  'VA','VC','VE','VG','VI','VN','VU',
  'WF','WS',
  'YE','YT',
  'ZA','ZM','ZW'
];

const normalizeStripeSecret = (key) => {
  if (!key) return '';
  return String(key).trim().replace(/^['"]|['"]$/g, '');
};

const isStripeSecretKeyPlaceholderOrRedacted = (key) => {
  if (!key) return true;
  const v = normalizeStripeSecret(key);
  if (!v) return true;
  // Common placeholders
  if (v.includes('your_key_here') || v.includes('your_stripe_secret_key')) return true;
  if (v === 'sk_test_your_key_here' || v === 'sk_live_your_key_here') return true;
  // Common redaction formats that will never work with Stripe
  if (v.includes('*') || v.includes('…') || v.toLowerCase().includes('redacted')) return true;
  return false;
};

const isValidStripeSecretKeyFormat = (key) => {
  const v = normalizeStripeSecret(key);
  // Stripe secret keys are generally `sk_(test|live)_...` (and should not contain spaces)
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

// POST /api/checkout/create-session (Stripe-hosted Checkout page)
router.post('/create-session', async (req, res) => {
  const { items, currency = 'kes', customerEmail } = req.body;

  if (!stripe) {
    return res
      .status(503)
      .json({ message: 'Checkout is not configured on the server (Stripe key missing/invalid).' });
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

    const allowedCountriesRaw = process.env.STRIPE_ALLOWED_COUNTRIES;
    const allowedCountriesValue = allowedCountriesRaw
      ? String(allowedCountriesRaw).trim().toUpperCase()
      : 'ALL';

    const allowedCountries =
      allowedCountriesValue === 'ALL' || allowedCountriesValue === '*'
        ? ALL_COUNTRIES
        : allowedCountriesValue
            .split(',')
            .map((c) => c.trim().toUpperCase())
            .filter(Boolean);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      customer_email:
        typeof customerEmail === 'string' && customerEmail.trim()
          ? customerEmail.trim().toLowerCase()
          : undefined,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: allowedCountries,
      },
    });

    res.json({ url: session.url, id: session.id });
  } catch (err) {
    const safeErr =
      err && typeof err === 'object'
        ? {
            type: err.type,
            code: err.code,
            statusCode: err.statusCode,
            requestId: err.requestId,
            rawType: err.rawType,
          }
        : err;
    console.error('Error creating checkout session', safeErr);
    res.status(500).json({ message: 'Failed to start checkout' });
  }
});

// GET /api/checkout/session/:id (retrieve status after redirect)
router.get('/session/:id', async (req, res) => {
  const { id } = req.params;

  if (!stripe) {
    return res
      .status(503)
      .json({ message: 'Checkout is not configured on the server (Stripe key missing/invalid).' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Missing session id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    res.json({
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email || session.customer_email || null,
    });
  } catch (err) {
    const safeErr =
      err && typeof err === 'object'
        ? {
            type: err.type,
            code: err.code,
            statusCode: err.statusCode,
            requestId: err.requestId,
            rawType: err.rawType,
          }
        : err;
    console.error('Error retrieving checkout session', safeErr);
    res.status(500).json({ message: 'Failed to retrieve checkout session' });
  }
});

// POST /api/checkout/create-payment-intent (on-site card form via Stripe Elements)
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'kes' } = req.body;

  if (!stripe) {
    return res
      .status(503)
      .json({ message: 'Checkout is not configured on the server (Stripe key missing/invalid).' });
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
    const safeErr =
      err && typeof err === 'object'
        ? {
            type: err.type,
            code: err.code,
            statusCode: err.statusCode,
            requestId: err.requestId,
            rawType: err.rawType,
          }
        : err;
    console.error('Error creating payment intent', safeErr);
    res.status(500).json({ message: 'Failed to start payment' });
  }
});

module.exports = router;
