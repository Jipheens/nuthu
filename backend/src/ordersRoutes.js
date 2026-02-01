const express = require('express');
const router = express.Router();
const { createOrderInDB } = require('./orderService');

// POST /api/orders
// Expects: { totalAmount, currency, email?, paymentStatus?, items: [{ productId, quantity, price }] }
router.post('/', async (req, res) => {
  try {
    const orderId = await createOrderInDB(req.body);
    res.status(201).json({ id: orderId });
  } catch (err) {
    if (err.message === 'Invalid order payload') {
      return res.status(400).json({ message: err.message });
    }
    console.error('Error creating order', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

module.exports = router;

