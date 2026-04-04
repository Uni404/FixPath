const pool = require('../db');

const getReplacementOptions = async (req, res) => {
    const { resultId } = req.params;

    try {
        // 1. Check whether decision result exists
        const [resultRows] = await pool.query(
            `
            SELECT *
            FROM decision_result
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

        // 2. First try rule-based replacement options
        if (result.RuleID) {
            const ruleId = result.RuleID;

            const [ruleRows] = await pool.query(
                `
                SELECT
                    r.OptionID,
                    r.RuleID,
                    r.DeviceID,
                    r.ProductName,
                    r.ProductType,
                    r.EstimatedPrice,
                    r.ProductURL,
                    m.MerchantID,
                    m.MerchantName,
                    m.Website,
                    m.ContactEmail
                FROM replacement_option r
                JOIN merchant m ON r.MerchantID = m.MerchantID
                WHERE r.RuleID = ?
                `,
                [ruleId]
            );

            if (ruleRows.length > 0) {
                return res.json({
                    message: 'Replacement options retrieved successfully by matched rule.',
                    resultId: Number(resultId),
                    ruleId,
                    options: ruleRows
                });
            }
        }

        // 3. Fallback: use ReportID -> DeviceID
        const [reportRows] = await pool.query(
            `
            SELECT p.ReportID, p.DeviceID
            FROM problem_report p
            JOIN decision_result d ON p.ReportID = d.ReportID
            WHERE d.ResultID = ?
            `,
            [resultId]
        );

        if (reportRows.length === 0) {
            return res.status(404).json({
                message: 'Related problem report not found.'
            });
        }

        const deviceId = reportRows[0].DeviceID;

        const [deviceRows] = await pool.query(
            `
            SELECT
                r.OptionID,
                r.RuleID,
                r.DeviceID,
                r.ProductName,
                r.ProductType,
                r.EstimatedPrice,
                r.ProductURL,
                m.MerchantID,
                m.MerchantName,
                m.Website,
                m.ContactEmail
            FROM replacement_option r
            JOIN merchant m ON r.MerchantID = m.MerchantID
            WHERE r.DeviceID = ?
            `,
            [deviceId]
        );

        if (deviceRows.length === 0) {
            return res.status(404).json({
                message: 'No replacement options found for this device.'
            });
        }

        return res.json({
            message: 'Replacement options retrieved successfully by device fallback.',
            resultId: Number(resultId),
            deviceId,
            options: deviceRows
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