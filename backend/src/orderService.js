const { pool } = require('./db');
const { sendOrderConfirmation } = require('./emailService');

/**
 * Creates an order and its items in a single transaction.
 * @param {Object} orderData - { totalAmount, currency, email, items, paymentStatus, metadata }
 * @returns {Promise<number>} - The created order ID
 */
async function createOrderInDB({ totalAmount, currency, email, items, paymentStatus, metadata = {} }) {
  if (!Array.isArray(items) || !items.length || totalAmount == null) {
    throw new Error('Invalid order payload');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const safeStatus =
      paymentStatus === 'pending' || paymentStatus === 'paid'
        ? paymentStatus
        : 'pending';

    const [orderResult] = await conn.query(
      'INSERT INTO orders (total_amount, currency, customer_email, payment_status) VALUES (?, ?, ?, ?)',
      [totalAmount, currency, email || null, safeStatus]
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

    // Send order confirmation email if email is provided
    if (email) {
      try {
        await sendOrderConfirmation({
          email,
          orderId,
          totalAmount,
          currency,
          items: items.map(item => ({
            productName: item.productName || item.name || 'Product',
            quantity: item.quantity,
            price: item.price,
          })),
        });
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }
    }

    return orderId;
  } catch (err) {
    await conn.rollback();
    console.error('Error in createOrderInDB:', err);
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  createOrderInDB
};
