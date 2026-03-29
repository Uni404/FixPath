const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /symptoms/suggest
router.post('/suggest', async (req, res) => {
  const { deviceId, problemDescription } = req.body;

  if (!deviceId) {
    return res.status(400).json({
      message: 'deviceId is required.'
    });
  }

  try {
    // 1. 先找该设备相关的所有 symptom（通过 decision_rule + rule_symptom）
    const [rows] = await pool.query(
      `
      SELECT DISTINCT
        s.SymptomID,
        s.SymptomName,
        s.SymptomDescription,
        s.SeverityLevel
      FROM DECISION_RULE dr
      JOIN RULE_SYMPTOM rs ON dr.RuleID = rs.RuleID
      JOIN SYMPTOM s ON rs.SymptomID = s.SymptomID
      WHERE dr.DeviceID = ?
      ORDER BY s.SymptomName
      `,
      [deviceId]
    );

    const description = (problemDescription || '').toLowerCase();

    // 2. 简单关键词打分
    const scoredSymptoms = rows.map((symptom) => {
      let score = 0;

      const name = (symptom.SymptomName || '').toLowerCase();
      const desc = (symptom.SymptomDescription || '').toLowerCase();

      if (description && name && description.includes(name)) {
        score += 2;
      }

      const nameWords = name.split(/\s+/).filter(Boolean);
      for (const word of nameWords) {
        if (word.length > 2 && description.includes(word)) {
          score += 1;
        }
      }

      const descWords = desc.split(/\s+/).filter(Boolean);
      for (const word of descWords) {
        if (word.length > 3 && description.includes(word)) {
          score += 0.5;
        }
      }

      return {
        ...symptom,
        score
      };
    });

    scoredSymptoms.sort((a, b) => b.score - a.score);

    return res.json({
      message: 'Symptoms suggested successfully.',
      symptoms: scoredSymptoms
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to suggest symptoms.',
      error: error.message
    });
  }
});

module.exports = router;
