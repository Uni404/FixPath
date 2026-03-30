const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

// User login
router.post('/user-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.'
    });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT UserID, Name, Email, PasswordHash
      FROM USER
      WHERE Email = ?
      LIMIT 1
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const user = rows[0];
    const matched = await bcrypt.compare(password, user.PasswordHash);

    if (!matched) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    return res.json({
      message: 'User login successful.',
      role: 'user',
      profile: {
        id: user.UserID,
        name: user.Name,
        email: user.Email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'User login failed.',
      error: error.message
    });
  }
});

// Expert login
router.post('/expert-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.'
    });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT ExpertID, ExpertName, ExpertEmail, PasswordHash, ServiceType, ExpertRating, Phone, AvailabilityStatus
      FROM EXPERT
      WHERE ExpertEmail = ?
      LIMIT 1
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const expert = rows[0];
    const matched = await bcrypt.compare(password, expert.PasswordHash);

    if (!matched) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    return res.json({
      message: 'Expert login successful.',
      role: 'expert',
      profile: {
        id: expert.ExpertID,
        name: expert.ExpertName,
        email: expert.ExpertEmail,
        serviceType: expert.ServiceType,
        rating: expert.ExpertRating,
        phone: expert.Phone,
        availabilityStatus: expert.AvailabilityStatus
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Expert login failed.',
      error: error.message
    });
  }
});

module.exports = router;
