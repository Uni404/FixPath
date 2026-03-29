const pool = require('../db');

const isSubset = (ruleSymptoms, reportSymptoms) => {
  return ruleSymptoms.every((symptomId) => reportSymptoms.includes(symptomId));
};

const analyzeReport = async (reportId) => {
  // 1. Get report
  const [reportRows] = await pool.query(
    `
    SELECT *
    FROM PROBLEM_REPORT
    WHERE ReportID = ?
    `,
    [reportId]
  );

  if (reportRows.length === 0) {
    throw new Error('Problem report not found.');
  }

  const report = reportRows[0];
  const deviceId = report.DeviceID;

  // 2. Get report symptoms
  const [reportSymptomRows] = await pool.query(
    `
    SELECT SymptomID
    FROM PROBLEM_REPORT_SYMPTOM
    WHERE ReportID = ?
    `,
    [reportId]
  );

  const reportSymptoms = reportSymptomRows.map((row) => row.SymptomID);

  // 3. Get applicable rules for device
  const [ruleRows] = await pool.query(
    `
    SELECT *
    FROM DECISION_RULE
    WHERE DeviceID = ? AND IsActive = TRUE
    ORDER BY Priority ASC
    `,
    [deviceId]
  );

  let matchedRule = null;

  // 4. Check each rule
  for (const rule of ruleRows) {
    const [ruleSymptomRows] = await pool.query(
      `
      SELECT SymptomID
      FROM RULE_SYMPTOM
      WHERE RuleID = ?
      `,
      [rule.RuleID]
    );

    const ruleSymptoms = ruleSymptomRows.map((row) => row.SymptomID);

    if (ruleSymptoms.length > 0 && isSubset(ruleSymptoms, reportSymptoms)) {
      matchedRule = rule;
      break;
    }
  }

  // 5. Default fallback if no rule matched
  if (!matchedRule) {
    return {
      ruleId: null,
      outcome: 'expert consultation',
      recommendation: 'No exact rule matched. Please consult an expert for further support.',
      riskLevel: 'Uncertain'
    };
  }

  return {
    ruleId: matchedRule.RuleID,
    outcome: matchedRule.OutcomeType,
    recommendation: matchedRule.GuidanceText,
    riskLevel: matchedRule.RiskLevel
  };
};

module.exports = {
  analyzeReport
};
