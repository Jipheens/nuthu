const express = require('express');
const router = express.Router();
const { pool } = require('./db');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching product', err);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  const { name, brand, description, price, category, imageUrl, inStock } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, brand, description, price, category, image_url, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, brand || null, description || null, price, category || null, imageUrl || null, inStock !== false]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating product', err);

    // Provide a clearer message when the image URL/data is too large for the column
    if (err && err.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({
        message:
          'The image data is too large to store. Please upload a smaller image or use a shorter image URL.',
      });
    }

    res.status(500).json({ message: 'Failed to create product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting product', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
