const { pool } = require('./db');
const { sendOrderConfirmation } = require('./emailService');

/**
 * Creates an order and its items in a single transaction.
 * @param {Object} orderData - { totalAmount, currency, email, items, paymentStatus, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country, phone_number }
 * @returns {Promise<number>} - The created order ID
 */
async function createOrderInDB({
  totalAmount,
  currency,
  email,
  items,
  paymentStatus,
  shipping_address,
  shipping_city,
  shipping_state,
  shipping_zip,
  shipping_country,
  phone_number
}) {
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
      `INSERT INTO orders (
        total_amount, 
        currency, 
        customer_email, 
        payment_status,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_zip,
        shipping_country,
        phone_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        totalAmount,
        currency,
        email || null,
        safeStatus,
        shipping_address || null,
        shipping_city || null,
        shipping_state || null,
        shipping_zip || null,
        shipping_country || null,
        phone_number || null
      ]
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
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_zip,
          shipping_country,
          phone_number,
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
