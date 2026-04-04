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
            INSERT INTO decision_result
            (ReportID, RuleID, Outcome, Recommendation, RiskLevel, Confidence, Explanation, RequiresExpert)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                reportId,
                result.ruleId,
                result.outcome,
                result.recommendation,
                result.riskLevel,
                result.confidence,
                result.explanation,
                result.requiresExpert
            ]
        );
        return res.status(201).json({
            message: 'Diagnosis completed successfully.',
            resultId: insertResult.insertId,
            ruleId: result.ruleId,
            outcome: result.outcome,
            recommendation: result.recommendation,
            riskLevel: result.riskLevel,
            requiresExpert: result.requiresExpert,
            confidence: result.confidence,
            explanation: result.explanation,
            matchedSymptoms: result.matchedSymptoms || []
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