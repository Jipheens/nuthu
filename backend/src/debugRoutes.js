const express = require('express');
const router = express.Router();
const { pool, ensureSchema } = require('./db');

// GET /api/debug/schema
// Forces schema check and returns status
router.get('/schema', async (req, res) => {
    try {
        const logs = [];
        // Override console.log momentarily to capture output (hacky but effective for remote debug)
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => logs.push(`LOG: ${args.join(' ')}`);
        console.error = (...args) => logs.push(`ERROR: ${args.join(' ')}`);

        await ensureSchema();

        console.log = originalLog;
        console.error = originalError;

        // Also fetch current columns
        const [columns] = await pool.query(
            `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_schema = DATABASE() AND table_name = 'orders'`
        );

        res.json({
            message: 'Schema check completed',
            logs,
            currentColumns: columns
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/debug/db-info
router.get('/db-info', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DATABASE() as db, USER() as user, VERSION() as version');
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
