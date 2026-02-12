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
  const conn = await pool.getConnection();
  try {
    // 1. Ensure users table
    const [tables] = await conn.query(
      `SELECT 1 as ok
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = 'users'
       LIMIT 1`
    );

    if (tables.length === 0) {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NULL,
          email_verified TINYINT(1) NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    const [columns] = await conn.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'email_verified'
       LIMIT 1`
    );

    if (columns.length === 0) {
      try {
        await conn.query(
          `ALTER TABLE users
           ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 1`
        );
      } catch (e) {
        console.error('Failed to add email_verified to users:', e.message);
      }
    }

    // 2. Ensure orders table
    const [orderTables] = await conn.query(
      `SELECT 1 as ok FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'orders' LIMIT 1`
    );

    if (orderTables.length === 0) {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          total_amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(10) NOT NULL DEFAULT 'USD',
          customer_email VARCHAR(255),
          payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
          shipping_address TEXT,
          shipping_city VARCHAR(255),
          shipping_state VARCHAR(255),
          shipping_zip VARCHAR(20),
          shipping_country VARCHAR(255),
          phone_number VARCHAR(20),
          shipping_fee DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      const [orderColumns] = await conn.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'orders'`
      );
      const columnNames = orderColumns.map(col => col.column_name);

      // Helper to safely add columns
      const addColumn = async (colName, query) => {
        if (!columnNames.includes(colName)) {
          try {
            await conn.query(query);
            console.log(`Successfully added column ${colName} to orders table`);
          } catch (e) {
            console.error(`Failed to add column ${colName}:`, e.message);
          }
        }
      };

      // We remove the AFTER clause if it risks failing (e.g. if the predecessor is missing).
      // However, to keep it clean, we'll try to chain them, but catch errors individually.

      // customer_email
      await addColumn('customer_email', `ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) AFTER currency`);

      // shipping_address (try AFTER customer_email, fallback to default pos if fails? No, simpler to just try)
      await addColumn('shipping_address', `ALTER TABLE orders ADD COLUMN shipping_address TEXT AFTER customer_email`);

      // shipping_city
      await addColumn('shipping_city', `ALTER TABLE orders ADD COLUMN shipping_city VARCHAR(255) AFTER shipping_address`);

      // shipping_state
      await addColumn('shipping_state', `ALTER TABLE orders ADD COLUMN shipping_state VARCHAR(255) AFTER shipping_city`);

      // shipping_zip
      await addColumn('shipping_zip', `ALTER TABLE orders ADD COLUMN shipping_zip VARCHAR(20) AFTER shipping_state`);

      // shipping_country
      await addColumn('shipping_country', `ALTER TABLE orders ADD COLUMN shipping_country VARCHAR(255) AFTER shipping_zip`);

      // phone_number
      await addColumn('phone_number', `ALTER TABLE orders ADD COLUMN phone_number VARCHAR(20) AFTER shipping_country`);

      // shipping_fee
      await addColumn('shipping_fee', `ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,2) DEFAULT 0 AFTER phone_number`);
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
  } catch (err) {
    console.error("Critical error in ensureSchema:", err);
  } finally {
    conn.release();
  }
};


module.exports = { pool, ensureSchema };
