const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const loadEnv = () => {
  const baseEnvPath = path.join(__dirname, '..', '.env');
  const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : '';
  const envVariantPath = nodeEnv ? path.join(__dirname, '..', `.env.${nodeEnv}`) : null;

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
const debugRoutes = require('./debugRoutes');

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://173.212.221.125:3000',
  'http://archivesbybilly.com',
  'http://www.archivesbybilly.com',
  'https://archivesbybilly.com',
  'https://www.archivesbybilly.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

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
app.use('/api/debug', debugRoutes);

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
