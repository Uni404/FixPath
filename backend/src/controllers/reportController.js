const pool = require('../db');

const createReport = async (req, res) => {
    const { userId, deviceId, problemDescription } = req.body;
    let symptomIds = req.body.symptomIds;

    if (typeof symptomIds === 'string') {
        try {
            symptomIds = JSON.parse(symptomIds);
        } catch (error) {
            return res.status(400).json({
                message: 'symptomIds must be a valid JSON array like [2,3].'
            });
        }
    }

    if (
        !userId ||
        !deviceId ||
        !problemDescription ||
        !Array.isArray(symptomIds) ||
        symptomIds.length === 0
    ) {
        return res.status(400).json({
            message: 'userId, deviceId, problemDescription, and at least one symptomId are required.'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        
        const [reportResult] = await connection.query(
          `
          INSERT INTO PROBLEM_REPORT
          (UserID, DeviceID, ProblemDescription, DetectedRiskLevel, Status)
          VALUES (?, ?, ?, ?, ?)
          `,
            [userId, deviceId, problemDescription, null, 'submitted']
        );

        const reportId = reportResult.insertId;

        
        for (const symptomId of symptomIds) {
            await connection.query(
                `
                INSERT INTO PROBLEM_REPORT_SYMPTOM
                (ReportID, SymptomID, Notes)
                VALUES (?, ?, ?)
                `,
                [reportId, symptomId, null]
            );
        }

        
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
                const mediaURL = `/uploads/${file.filename}`;

                await connection.query(
                  `
                  INSERT INTO REPORT_MEDIA
                  (ReportID, MediaType, MediaURL)
                  VALUES (?, ?, ?)
                  `,
                    [reportId, mediaType, mediaURL]
                );
            }
        }

        await connection.commit();

        return res.status(201).json({
            message: 'Problem report created successfully.',
            reportId
        });
    } catch (error) {
        await connection.rollback();

        return res.status(500).json({
            message: 'Failed to create problem report.',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    createReport
};
