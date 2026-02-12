const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const loadEnv = () => {
  const baseEnvPath = path.join(__dirname, '..', '.env');
  const nodeEnv = process.env.NODE_ENV ? String(process.env.NODE_ENV).trim() : '';
  const envVariantPath = nodeEnv ? path.join(__dirname, '..', `.env.${nodeEnv}`) : null;

  if (fs.existsSync(baseEnvPath)) {
    require('dotenv').config({ path: baseEnvPath });
  }
  if (envVariantPath && fs.existsSync(envVariantPath)) {
    require('dotenv').config({ path: envVariantPath });
  }
};

loadEnv();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const ensureSchema = async () => {
  // Ensure `users.email_verified` exists.
  // If we add it to an existing table, we default it to 1 so existing users aren't locked out.
  const conn = await pool.getConnection();
  try {
    const [tables] = await conn.query(
      `SELECT 1 as ok
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = 'users'
       LIMIT 1`
    );

    if (tables.length === 0) {
      // Minimal users table if it doesn't exist yet.
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NULL,
          email_verified TINYINT(1) NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        )
      `);
    }

    const [columns] = await conn.query(

      `SELECT 1 as ok
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'email_verified'
       LIMIT 1`
    );

    if (columns.length === 0) {
      await conn.query(
        `ALTER TABLE users
         ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 1`
      );
    }
    // 2. Ensure orders table and customer_email column
    const [orderTables] = await conn.query(
      `SELECT 1 as ok FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'orders' LIMIT 1`
    );

    if (orderTables.length === 0) {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          total_amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(10) NOT NULL DEFAULT 'KES',
          customer_email VARCHAR(255),
          payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      const [orderColumns] = await conn.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'orders'`
      );
      const columnNames = orderColumns.map(col => col.column_name);

      if (!columnNames.includes('customer_email')) {
        await conn.query(`ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) AFTER currency`);
      }
      if (!columnNames.includes('shipping_address')) {
        await conn.query(`ALTER TABLE orders ADD COLUMN shipping_address TEXT AFTER customer_email`);
      }
      if (!columnNames.includes('shipping_city')) {
        await conn.query(`ALTER TABLE orders ADD COLUMN shipping_city VARCHAR(255) AFTER shipping_address`);
      }
      if (!columnNames.includes('shipping_state')) {
        await conn.query(`ALTER TABLE orders ADD COLUMN shipping_state VARCHAR(255) AFTER shipping_city`);
      }
      if (!columnNames.includes('shipping_zip')) {
        await conn.query(`ALTER TABLE orders ADD COLUMN shipping_zip VARCHAR(20) AFTER shipping_state`);
      }
      if (!columnNames.includes('shipping_country')) {
        await conn.query(`ALTER TABLE orders ADD COLUMN shipping_country VARCHAR(255) AFTER shipping_zip`);
      }
      if (!columnNames.includes('phone_number')) {
        await conn.query(`ALTER TABLE orders ADD COLUMN phone_number VARCHAR(20) AFTER shipping_country`);
      }
    }

    // 3. Ensure order_items table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id INT UNSIGNED NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        quantity INT UNSIGNED NOT NULL,
        price_at_purchase DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
  } finally {
    conn.release();
  }
};


module.exports = { pool, ensureSchema };

