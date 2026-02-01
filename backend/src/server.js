const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const loadEnv = () => {
  const baseEnvPath = path.join(__dirname, '..', '.env');
  const nodeEnv = process.env.NODE_ENV ? String(process.env.NODE_ENV).trim() : '';
  const envVariantPath = nodeEnv ? path.join(__dirname, '..', `.env.${nodeEnv}`) : null;

  // Load .env first (common for local/dev), then overlay env-specific file if present.
  if (fs.existsSync(baseEnvPath)) {
    require('dotenv').config({ path: baseEnvPath });
  }
  if (envVariantPath && fs.existsSync(envVariantPath)) {
    require('dotenv').config({ path: envVariantPath });
  }
};

loadEnv();
const { ensureSchema } = require('./db');

const productsRoutes = require('./productsRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const ordersRoutes = require('./ordersRoutes');
const uploadRoutes = require('./uploadRoutes');
const emailRoutes = require('./emailRoutes');
const authRoutes = require('./authRoutes');
const cartRoutes = require('./cartRoutes');

const app = express();

// Configure CORS to allow frontend access
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Stripe webhook needs raw body for signature verification.
// We apply this BEFORE the global express.json() middleware.
app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());


// Serve static uploaded images with CORS headers
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', cors(corsOptions), express.static(uploadsPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productsRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);

const port = process.env.PORT || 4000;

(async () => {
  try {
    await ensureSchema();
  } catch (err) {
    console.error('Failed to ensure DB schema:', err);
  }

  app.listen(port, () => {
    console.log(`Backend API listening on http://localhost:${port}`);
  });
})();
