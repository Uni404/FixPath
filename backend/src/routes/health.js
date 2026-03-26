const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({
      message: 'Backend and database connection are working.',
      database: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed.',
      error: error.message
    });
  }
});

module.exports = router;
