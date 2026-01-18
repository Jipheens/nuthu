const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

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
      `);
      return;
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
  } finally {
    conn.release();
  }
};

module.exports = { pool, ensureSchema };

