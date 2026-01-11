const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productsRoutes = require('./productsRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const ordersRoutes = require('./ordersRoutes');
const uploadRoutes = require('./uploadRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '5mb' }));

// Serve static uploaded images
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productsRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/upload', uploadRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
