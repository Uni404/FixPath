const pool = require('../db');

const getReplacementOptions = async (req, res) => {
    const { resultId } = req.params;

    try {
        // 1. Check whether decision result exists
        const [resultRows] = await pool.query(
            `
      SELECT *
      FROM DECISION_RESULT
      WHERE ResultID = ?
      `,
            [resultId]
        );

        if (resultRows.length === 0) {
            return res.status(404).json({
                message: 'Decision result not found.'
            });
        }

        const result = resultRows[0];

        // 2. If no rule matched, replacement options should not exist
        if (!result.RuleID) {
            return res.status(404).json({
                message: 'No replacement options available because no rule was matched for this diagnosis result.'
            });
        }

        const ruleId = result.RuleID;

        // 3. Get replacement options using RuleID
        const [rows] = await pool.query(
            `
      SELECT
        r.OptionID,
        r.RuleID,
        r.ProductName,
        r.ProductType,
        r.EstimatedPrice,
        r.ProductURL,
        m.MerchantID,
        m.MerchantName,
        m.Website,
        m.ContactEmail
      FROM REPLACEMENT_OPTION r
      JOIN MERCHANT m ON r.MerchantID = m.MerchantID
      WHERE r.RuleID = ?
      `,
            [ruleId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'No replacement options found for the matched rule.'
            });
        }

        return res.json({
            message: 'Replacement options retrieved successfully.',
            resultId: Number(resultId),
            ruleId,
            options: rows
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve replacement options.',
            error: error.message
        });
    }
};

module.exports = {
    getReplacementOptions
};