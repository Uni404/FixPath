const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1');

        res.status(200).json({
            status: 'ok',
            db: 'connected',
            timestamp: Date.now()
        });

    } catch (error) {
        res.status(200).json({
            status: 'degraded',
            db: 'disconnected',
            error: error.message
        });
    }
});

module.exports = router;
