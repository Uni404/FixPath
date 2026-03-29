const express = require('express');
const router = express.Router();
const pool = require('../db');

// 获取所有分类
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM device_category'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load device categories',
      error: error.message
    });
  }
});

// 根据分类获取设备
router.get('/category/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM device WHERE CategoryID = ?',
      [categoryId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load devices',
      error: error.message
    });
  }
});

module.exports = router;
