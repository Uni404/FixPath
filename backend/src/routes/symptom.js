const express = require('express');
const router = express.Router();
const pool = require('../db');

const symptomKeywordMap = {
    'Weak suction': ['weak suction', 'not picking up', 'low suction', 'poor suction'],
    'Smoke': ['smoke', 'smoking', 'smoky','smok'],
    'Burning smell': ['burning smell', 'burning', 'burnt smell', 'burned smell', 'burning odor', 'burnt','burn'],
    'No power': ['no power', 'not turning on', 'does not turn on', 'wont turn on', "won't turn on", 'dead'],
    'Water leak': ['water leak', 'leak', 'leaking'],
    'Strange noise': ['strange noise', 'weird sound', 'unusual sound', 'noise', 'buzzing', 'rattling'],
    'Overheating': ['overheating', 'too hot', 'abnormally hot', 'hot'],
    'Clogging': ['clogging', 'clogged', 'blocked', 'drains slowly'],
    'Dripping': ['dripping', 'drip', 'keeps dripping']
};

const highRiskSymptomNames = new Set(['Smoke', 'Burning smell', 'Overheating']);

const normalizeText = (text) => {
    return (text || '')
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};


router.post('/suggest', async (req, res) => {
    const { deviceId, problemDescription } = req.body;

    if (!deviceId) {
        return res.status(400).json({
            message: 'deviceId is required.'
        });
    }

    try {
        
        const [rows] = await pool.query(
            `
            SELECT DISTINCT
                s.SymptomID,
                s.SymptomName,
                s.SymptomDescription,
                s.SeverityLevel
            FROM decision_rule dr
            JOIN rule_symptom rs ON dr.RuleID = rs.RuleID
            JOIN symptom s ON rs.SymptomID = s.SymptomID
            WHERE dr.DeviceID = ?
            ORDER BY s.SymptomName
            `,
            [deviceId]
        );

        const description = normalizeText(problemDescription);

        const scoredSymptoms = rows.map((symptom) => {
            let score = 0;

            const symptomName = symptom.SymptomName || '';
            const normalizedName = normalizeText(symptomName);
            const normalizedDesc = normalizeText(symptom.SymptomDescription || '');

            const keywords = symptomKeywordMap[symptomName] || [normalizedName];

            
            for (const keyword of keywords) {
                const normalizedKeyword = normalizeText(keyword);

                if (!normalizedKeyword) continue;

                
                if (description.includes(normalizedKeyword)) {
                    score += 2;
                }

                
                const keywordWords = normalizedKeyword.split(' ').filter(Boolean);
                for (const word of keywordWords) {
                    if (word.length > 2 && description.includes(word)) {
                        score += 0.5;
                    }
                }
            }

            
            if (normalizedName && description.includes(normalizedName)) {
                score += 1.5;
            }

            
            const descWords = normalizedDesc.split(' ').filter(Boolean);
            for (const word of descWords) {
                if (word.length > 4 && description.includes(word)) {
                    score += 0.3;
                }
            }

            
            if (highRiskSymptomNames.has(symptomName) && score > 0) {
                score += 1;
            }

            
            if (symptom.SeverityLevel === 'High' && score > 0) {
                score += 0.5;
            } else if (symptom.SeverityLevel === 'Medium' && score > 0) {
                score += 0.2;
            }

            return {
                ...symptom,
                score: Number(score.toFixed(2))
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