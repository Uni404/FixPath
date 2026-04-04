const pool = require('../db');

const createFeedback = async (req, res) => {
    const {
        FeedbackType,
        ReportID,
        ResultID,
        ConsultationID,
        ExpertID,
        Rating,
        Comments,
        UserID
    } = req.body;

    const userId = UserID; 
  
    try {
      
        if (!FeedbackType || !Rating) {
            return res.status(400).json({
                message: 'FeedbackType and Rating are required.'
            });
        }

        
        if (FeedbackType === 'diagnosis') {
            if (!ResultID || !ReportID) {
                return res.status(400).json({
                    message: 'ResultID and ReportID are required for diagnosis feedback.'
                });
            }

            
            const [existing] = await pool.query(
                `
                SELECT * FROM feedback
                WHERE FeedbackType = 'diagnosis'
                  AND ResultID = ?
                  AND UserID = ?
                `,
                [ResultID, userId]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    message: 'You have already submitted feedback for this diagnosis.'
                });
            }

           
            await pool.query(
                `
                INSERT INTO feedback
                (ReportID, UserID, FeedbackType, Comments, Rating, SubmittedDate, ResultID)
                VALUES (?, ?, ?, ?, ?, NOW(), ?)
                `,
                [ReportID, userId, FeedbackType, Comments, Rating, ResultID]
            );

            return res.json({
                message: 'Diagnosis feedback submitted successfully.'
            });
        }

        
        if (FeedbackType === 'consultation') {
            if (!ConsultationID || !ExpertID) {
                return res.status(400).json({
                    message: 'ConsultationID and ExpertID are required for consultation feedback.'
                });
            }

           
            const [existing] = await pool.query(
                `
                SELECT * FROM feedback
                WHERE FeedbackType = 'consultation'
                  AND ConsultationID = ?
                  AND UserID = ?
                `,
                [ConsultationID, userId]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    message: 'You have already submitted feedback for this consultation.'
                });
            }

            
            await pool.query(
                `
                INSERT INTO feedback
                (ReportID, UserID, FeedbackType, Comments, Rating, SubmittedDate, ConsultationID, ExpertID)
                VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
                `,
                [ReportID || null, userId, FeedbackType, Comments, Rating, ConsultationID, ExpertID]
            );

          
            const [rows] = await pool.query(
                `
                SELECT AVG(Rating) AS avgRating
                FROM feedback
                WHERE FeedbackType = 'consultation'
                  AND ExpertID = ?
                `,
                [ExpertID]
            );

            const avgRating = Number(rows[0].avgRating).toFixed(1);

            await pool.query(
                `
                UPDATE expert
                SET ExpertRating = ?
                WHERE ExpertID = ?
                `,
                [avgRating, ExpertID]
            );

            return res.json({
                message: 'Consultation feedback submitted and expert rating updated.'
            });
        }

        return res.status(400).json({
            message: 'Invalid FeedbackType.'
        });

    } catch (error) {
        console.error('Feedback error:', error);
        return res.status(500).json({ message: 'Failed to submit feedback.' });
    }
};

module.exports = {
    createFeedback
};
