const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

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
app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
