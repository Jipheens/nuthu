const express = require('express');
const router = express.Router();
const pool = require('./db');

// POST /api/orders
// Expects: { totalAmount, currency, email?, items: [{ productId, quantity, price }] }
router.post('/', async (req, res) => {
  const { totalAmount, currency = 'kes', email, items } = req.body;

  if (!Array.isArray(items) || !items.length || totalAmount == null) {
    return res.status(400).json({ message: 'Invalid order payload' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      'INSERT INTO orders (total_amount, currency, customer_email, payment_status) VALUES (?, ?, ?, ?)',
      [totalAmount, currency, email || null, 'paid']
    );

    const orderId = orderResult.insertId;

    const values = items.map((item) => [
      orderId,
      item.productId,
      item.quantity,
      item.price,
    ]);

    await conn.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?;',
      [values]
    );

    await conn.commit();

    res.status(201).json({ id: orderId });
  } catch (err) {
    await conn.rollback();
    console.error('Error creating order', err);
    res.status(500).json({ message: 'Failed to create order' });
  } finally {
    conn.release();
  }
});

module.exports = router;
