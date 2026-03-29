const pool = require('../db');
const { analyzeReport } = require('../services/diagnosisEngine');

const diagnoseReport = async (req, res) => {
  const { reportId } = req.params;

  if (!reportId) {
    return res.status(400).json({
      message: 'reportId is required.'
    });
  }

  try {
    const result = await analyzeReport(reportId);

    const [insertResult] = await pool.query(
      `
      INSERT INTO DECISION_RESULT
      (ReportID, RuleID, Outcome, Recommendation, RiskLevel)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        reportId,
        result.ruleId,
        result.outcome,
        result.recommendation,
        result.riskLevel
      ]
    );

    return res.status(201).json({
      message: 'Diagnosis completed successfully.',
      resultId: insertResult.insertId,
      outcome: result.outcome,
      recommendation: result.recommendation,
      riskLevel: result.riskLevel
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to diagnose report.',
      error: error.message
    });
  }
};

module.exports = {
  diagnoseReport
};
