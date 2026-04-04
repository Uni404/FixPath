const pool = require('../db');

const SEVERITY_WEIGHT = {
    Low: 1,
    Medium: 2,
    High: 4
};


const calculateRuleScore = ({
    ruleSymptoms,
    reportSymptoms,
    symptomSeverityMap,
    priority
}) => {
    const reportSet = new Set(reportSymptoms);

    let totalWeight = 0;
    let matchedWeight = 0;
    let matchedSymptoms = [];

    for (const symptomId of ruleSymptoms) {
        const severity = symptomSeverityMap[symptomId] || 'Low';
        const weight = SEVERITY_WEIGHT[severity] || 1;

        totalWeight += weight;

        if (reportSet.has(symptomId)) {
            matchedWeight += weight;
            matchedSymptoms.push(symptomId);
        }
    }

    if (totalWeight === 0) {
        return {
            matchedSymptoms,
            matchedWeight: 0,
            totalWeight: 0,
            coverage: 0,
            score: 0,
            exactMatch: false
        };
    }

    const coverage = matchedWeight / totalWeight;

    const exactMatch =
        matchedSymptoms.length === ruleSymptoms.length &&
        ruleSymptoms.length === reportSymptoms.length;

    const exactMatchBonus = exactMatch ? 15 : 0;

    // The lower the Priority, the higher the priority
    const priorityBonus = Math.max(10 - (priority || 99), 0);

    // Apply a minor penalty for extra symptoms in the report to avoid over-matching
    const extraSymptomsCount = Math.max(reportSymptoms.length - matchedSymptoms.length, 0);
    const extraPenalty = extraSymptomsCount * 1.5;

    const score = coverage * 100 + exactMatchBonus + priorityBonus - extraPenalty;

    return {
        matchedSymptoms,
        matchedWeight,
        totalWeight,
        coverage,
        score,
        exactMatch
    };
};

const analyzeReport = async (reportId) => {
    // 1. Get report
    const [reportRows] = await pool.query(
        `
        SELECT *
        FROM problem_report
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
        FROM problem_report_symptom
        WHERE ReportID = ?
        `,
        [reportId]
    );

    const reportSymptoms = reportSymptomRows.map((row) => row.SymptomID);

    if (reportSymptoms.length === 0) {
        return {
            ruleId: null,
            outcome: 'expert consultation',
            recommendation: 'No symptoms were selected. Please provide more symptom details or consult an expert.',
            riskLevel: 'Uncertain',
            requiresExpert: 1,
            confidence: 0,
            matchedSymptoms: [],
            explanation: 'No symptoms were attached to this report.'
        };
    }

    // 3. Load all symptom severities
    const [symptomRows] = await pool.query(
        `
        SELECT SymptomID, SeverityLevel, SymptomName
        FROM symptom
        `
    );

    const symptomSeverityMap = {};
    const symptomNameMap = {};

    for (const row of symptomRows) {
        symptomSeverityMap[row.SymptomID] = row.SeverityLevel;
        symptomNameMap[row.SymptomID] = row.SymptomName;
    }

    // 4. Safety override layer
    const highRiskSymptoms = reportSymptoms.filter(
        (symptomId) => symptomSeverityMap[symptomId] === 'High'
    );

    const criticalSymptomNames = ['Smoke', 'Burning smell'];
    const hasCriticalSymptom = reportSymptoms.some(
        (symptomId) => criticalSymptomNames.includes(symptomNameMap[symptomId])
    );

   
    if (hasCriticalSymptom) {
        return {
            ruleId: null,
            outcome: 'emergency stop',
            recommendation: 'Critical symptom detected (smoke or burning smell). Stop using the device immediately and contact a professional expert.',
            riskLevel: 'High',
            requiresExpert: 1,
            confidence: 95,
            matchedSymptoms: reportSymptoms.map((id) => symptomNameMap[id]),
            explanation: 'Critical safety override triggered because a severe fire-related symptom was detected.'
        };
    }

    
    if (highRiskSymptoms.length >= 2) {
        return {
            ruleId: null,
            outcome: 'emergency stop',
            recommendation: 'Multiple high-risk symptoms were detected. Stop using the device immediately and contact a professional expert.',
            riskLevel: 'High',
            requiresExpert: 1,
            confidence: 100,
            matchedSymptoms: highRiskSymptoms.map((id) => symptomNameMap[id]),
            explanation: `Safety override triggered because ${highRiskSymptoms.length} high-risk symptoms were reported: ${highRiskSymptoms
                .map((id) => symptomNameMap[id])
                .join(', ')}.`
        };
    }

    // 5. Get active rules for this device
    const [ruleRows] = await pool.query(
        `
        SELECT
            RuleID,
            DeviceID,
            OutcomeType,
            GuidanceText,
            RiskLevel,
            Priority,
            RequiresExpert,
            IsActive
        FROM decision_rule
        WHERE DeviceID = ? AND IsActive = TRUE
        ORDER BY Priority ASC
        `,
        [deviceId]
    );

    if (ruleRows.length === 0) {
        return {
            ruleId: null,
            outcome: 'expert consultation',
            recommendation: 'No active decision rules are configured for this device. Please consult an expert.',
            riskLevel: 'Uncertain',
            requiresExpert: 1,
            confidence: 0,
            matchedSymptoms: [],
            explanation: 'No active rules found for this device.'
        };
    }

    // 6. Get all rule symptoms in one query
    const ruleIds = ruleRows.map((rule) => rule.RuleID);

    const [ruleSymptomRows] = await pool.query(
        `
        SELECT RuleID, SymptomID
        FROM rule_symptom
        WHERE RuleID IN (?)
        `,
        [ruleIds]
    );

    const ruleSymptomMap = {};

    for (const row of ruleSymptomRows) {
        if (!ruleSymptomMap[row.RuleID]) {
            ruleSymptomMap[row.RuleID] = [];
        }
        ruleSymptomMap[row.RuleID].push(row.SymptomID);
    }

    // 7. Evaluate all rule candidates
    const candidates = [];

    for (const rule of ruleRows) {
        const ruleSymptoms = ruleSymptomMap[rule.RuleID] || [];

        if (ruleSymptoms.length === 0) {
            continue;
        }

        const scoreInfo = calculateRuleScore({
            ruleSymptoms,
            reportSymptoms,
            symptomSeverityMap,
            priority: rule.Priority
        });

        candidates.push({
            rule,
            ruleSymptoms,
            ...scoreInfo
        });
    }

    if (candidates.length === 0) {
        return {
            ruleId: null,
            outcome: 'expert consultation',
            recommendation: 'No valid rule candidates were found. Please consult an expert.',
            riskLevel: 'Uncertain',
            requiresExpert: 1,
            confidence: 0,
            matchedSymptoms: [],
            explanation: 'No rules contained symptom mappings for evaluation.'
        };
    }

    // 8. Sort candidates by score, then coverage, then priority
    candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.coverage !== a.coverage) return b.coverage - a.coverage;
        return (a.rule.Priority || 99) - (b.rule.Priority || 99);
    });

    const best = candidates[0];
    const second = candidates[1] || null;

    const MIN_COVERAGE = 0.6;
    const MIN_SCORE = 60;

    // 9. Ambiguity check
    if (second && Math.abs(best.score - second.score) < 8) {
        return {
            ruleId: null,
            outcome: 'expert consultation',
            recommendation: 'The system found multiple similar rule candidates and cannot make a reliable decision. Please consult an expert.',
            riskLevel: 'Uncertain',
            requiresExpert: 1,
            confidence: Math.min(100, Math.round(best.score)),
            matchedSymptoms: best.matchedSymptoms.map((id) => symptomNameMap[id]),
            explanation: `The system found multiple similar rule candidates and could not make a reliable decision. Rule ${best.rule.RuleID} and rule ${second.rule.RuleID} had very close scores (${best.score.toFixed(
                2
            )} vs ${second.score.toFixed(2)}).`
        };
    }

    // 10. Low-confidence fallback
    if (best.coverage < MIN_COVERAGE || best.score < MIN_SCORE) {
        const hasHighRiskSignal = highRiskSymptoms.length > 0;

        return {
            ruleId: null,
            outcome: hasHighRiskSignal ? 'expert consultation' : 'expert consultation',
            recommendation: hasHighRiskSignal
                ? 'A high-risk symptom was detected, but no rule reached the confidence threshold. Please stop using the device and consult an expert.'
                : 'No rule reached the confidence threshold. Please consult an expert for further support.',
            riskLevel: hasHighRiskSignal ? 'High' : 'Uncertain',
            requiresExpert: 1,
            confidence: Math.min(100, Math.round(best.score)),
            matchedSymptoms: best.matchedSymptoms.map((id) => symptomNameMap[id]),
            explanation: `The system partially matched rule ${best.rule.RuleID}, but confidence was too low for an automatic decision. Weighted coverage was ${(best.coverage * 100).toFixed(
                2
            )}% with score ${best.score.toFixed(2)}.`
        };
    }

    // 11. RequiresExpert override
    if (best.rule.RequiresExpert) {
        return {
            ruleId: best.rule.RuleID,
            outcome: 'expert consultation',
            recommendation: best.rule.GuidanceText,
            riskLevel: best.rule.RiskLevel,
            requiresExpert: 1,
            confidence: Math.min(100, Math.round(best.score)),
            matchedSymptoms: best.matchedSymptoms.map((id) => symptomNameMap[id]),
            explanation: `Rule ${best.rule.RuleID} matched with ${(best.coverage * 100).toFixed(
                2
            )}% weighted coverage. Expert consultation is required by rule design.`
        };
    }

    // 12. Normal rule match
    return {
        ruleId: best.rule.RuleID,
        outcome: best.rule.OutcomeType,
        recommendation: best.rule.GuidanceText,
        riskLevel: best.rule.RiskLevel,
        requiresExpert: best.rule.RequiresExpert,
        confidence: Math.min(100, Math.round(best.score)),
        matchedSymptoms: best.matchedSymptoms.map((id) => symptomNameMap[id]),
        explanation: `The system matched rule ${best.rule.RuleID} with ${(best.coverage * 100).toFixed(
            2
        )}% weighted coverage. Key matched symptoms: ${best.matchedSymptoms
            .map((id) => symptomNameMap[id])
            .join(', ')}.`
    };
};

module.exports = {
    analyzeReport
};