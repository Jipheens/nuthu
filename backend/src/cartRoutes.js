const express = require('express');
const { pool } = require('./db');
const { authenticateToken } = require('./authMiddleware');

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Get user's cart
router.get('/', async (req, res) => {
  try {
    const [cartItems] = await pool.query(
      `SELECT 
        ci.id as cartItemId,
        ci.quantity,
        ci.size,
        p.id,
        p.name,
        p.brand,
        p.price,
        p.image_url,
        p.in_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC`,
      [req.user.userId]
    );

    res.json({ cartItems });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1, size } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const [products] = await pool.query(
      'SELECT id, in_stock FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!products[0].in_stock) {
      return res.status(400).json({ error: 'Product is out of stock' });
    }

    // Check if item already exists in cart
    const [existingItems] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?',
      [req.user.userId, productId, size || null]
    );

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );

      res.json({ message: 'Cart updated', cartItemId: existingItems[0].id });
    } else {
      // Insert new cart item
      const [result] = await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
        [req.user.userId, productId, quantity, size || null]
      );

      res.status(201).json({ message: 'Item added to cart', cartItemId: result.insertId });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/:cartItemId', async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Verify cart item belongs to user
    const [items] = await pool.query(
      'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, req.user.userId]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, cartItemId]
    );

    res.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/:cartItemId', async (req, res) => {
  try {
    const { cartItemId } = req.params;

    // Verify cart item belongs to user
    const [items] = await pool.query(
      'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, req.user.userId]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await pool.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear entire cart
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.userId]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
