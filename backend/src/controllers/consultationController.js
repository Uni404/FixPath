const pool = require('../db');

const createConsultation = async (req, res) => {
    const { resultId, userId, requestType, consultationNotes } = req.body;

    if (!resultId || !userId) {
        return res.status(400).json({
            message: 'resultId and userId are required.'
        });
    }

    try {
        
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
                message: 'Diagnosis result not found.'
            });
        }

        
        const [existingRows] = await pool.query(
            `
          SELECT
            c.ConsultationID,
            c.RequestType,
            c.ConsultationStatus,
            c.MeetingLink,
            c.ExpertID,
            e.ExpertName,
            e.ServiceType,
            e.ExpertEmail,
            e.ExpertRating
          FROM CONSULTATION c
          JOIN EXPERT e ON c.ExpertID = e.ExpertID
          WHERE c.ResultID = ?
            AND c.ConsultationStatus IN ('pending', 'ongoing')
          ORDER BY c.RequestDate DESC
          LIMIT 1
          `,
            [resultId]
        );

        if (existingRows.length > 0) {
            const existing = existingRows[0];

            return res.status(200).json({
                message: 'An active consultation already exists for this diagnosis result.',
                consultationId: existing.ConsultationID,
                consultationStatus: existing.ConsultationStatus,
                expert: {
                    expertId: existing.ExpertID,
                    expertName: existing.ExpertName,
                    serviceType: existing.ServiceType,
                    expertEmail: existing.ExpertEmail,
                    expertRating: existing.ExpertRating
                },
                consultationMode: existing.RequestType,
                meetingLink: existing.MeetingLink,
                reused: true
            });
        }

        
        const [expertRows] = await pool.query(
            `
          SELECT *
          FROM EXPERT
          WHERE AvailabilityStatus = 'Available'
          ORDER BY ExpertRating DESC
          LIMIT 1
          `
        );

        if (expertRows.length === 0) {
            return res.status(404).json({
                message: 'No available expert found at the moment.'
            });
        }

        const expert = expertRows[0];

        
        const meetingLink = `https://meet.jit.si/fixpath-${resultId}-${Date.now()}`;

        
        const [insertResult] = await pool.query(
            `
          INSERT INTO CONSULTATION
          (ResultID, UserID, ExpertID, RequestType, ConsultationStatus, RequestDate, ConsultationNotes, MeetingLink)
          VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
          `,
            [
                resultId,
                userId,
                expert.ExpertID,
                requestType || 'video',
                'pending',
                consultationNotes || null,
                meetingLink
            ]
        );

        return res.status(201).json({
            message: 'Consultation created successfully.',
            consultationId: insertResult.insertId,
            consultationStatus:'pending',
            expert: {
                expertId: expert.ExpertID,
                expertName: expert.ExpertName,
                serviceType: expert.ServiceType,
                expertEmail: expert.ExpertEmail,
                expertRating: expert.ExpertRating
            },
            consultationMode: requestType || 'video',
            meetingLink,
            reused: false
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create consultation.',
            error: error.message
        });
    }
};


const updateConsultationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      message: 'status is required.'
    });
  }

  try {
    let consultationDate = null;

    
    if (status === 'ongoing' || status === 'completed') {
      consultationDate = new Date();
    }

    await pool.query(
      `
      UPDATE CONSULTATION
      SET ConsultationStatus = ?, ConsultationDate = ?
      WHERE ConsultationID = ?
      `,
      [status, consultationDate, id]
    );

    return res.json({
      message: 'Consultation status updated successfully.',
      status,
      consultationDate
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update consultation.',
      error: error.message
    });
  }
};

const getConsultationById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(
            `
            SELECT
            c.ConsultationID,
            c.ResultID,
            c.UserID,
            c.ExpertID,
            c.RequestType,
            c.ConsultationStatus,
            c.RequestDate,
            c.ConsultationDate,
            c.ConsultationNotes,
            c.MeetingLink,

            e.ExpertName,
            e.ServiceType,
            e.Phone,
            e.ExpertEmail,
            e.ExpertRating,
            e.AvailabilityStatus,

            dr.ReportID,
            dr.Outcome,
            dr.RiskLevel,
            dr.Recommendation,

            pr.ProblemDescription,
            pr.ReportDate,

            d.DeviceID,
            d.DeviceName,

            dc.CategoryID,
            dc.CategoryName

          FROM CONSULTATION c
          JOIN EXPERT e ON c.ExpertID = e.ExpertID
          JOIN DECISION_RESULT dr ON c.ResultID = dr.ResultID
          JOIN PROBLEM_REPORT pr ON dr.ReportID = pr.ReportID
          JOIN DEVICE d ON pr.DeviceID = d.DeviceID
          JOIN DEVICE_CATEGORY dc ON d.CategoryID = dc.CategoryID
          WHERE c.ConsultationID = ?
          `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Consultation not found.'
            });
        }

        const consultation = rows[0];

       
        const [mediaRows] = await pool.query(
            `
          SELECT
            MediaID,
            MediaType,
            MediaURL,
            UploadedTime
          FROM REPORT_MEDIA
          WHERE ReportID = ?
          ORDER BY UploadedTime DESC
          `,
            [consultation.ReportID]
        );

        consultation.media = mediaRows;

        return res.json({
            message: 'Consultation retrieved successfully.',
            consultation
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve consultation.',
            error: error.message
        });
    }
};

const getAllConsultations = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        c.ConsultationID,
        c.ResultID,
        c.UserID,
        c.RequestType,
        c.ConsultationStatus,
        c.RequestDate,
        e.ExpertName
      FROM CONSULTATION c
      JOIN EXPERT e ON c.ExpertID = e.ExpertID
      ORDER BY c.RequestDate DESC
    `);

        return res.json(rows);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch consultations.',
            error: error.message
        });
    }
};

const getConsultationsByExpertId = async (req, res) => {
    const { expertId } = req.params;

    try {
        const [rows] = await pool.query(
            `
          SELECT 
            c.ConsultationID,
            c.ResultID,
            c.UserID,
            c.RequestType,
            c.ConsultationStatus,
            c.RequestDate,
            c.ConsultationDate,
            c.ConsultationNotes,
            c.MeetingLink,
            e.ExpertName
          FROM CONSULTATION c
          JOIN EXPERT e ON c.ExpertID = e.ExpertID
          WHERE c.ExpertID = ?
          ORDER BY c.RequestDate DESC
          `,
            [expertId]
        );

        return res.json(rows);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch expert consultations.',
            error: error.message
        });
    }
};

module.exports = { createConsultation, updateConsultationStatus, getConsultationById, getAllConsultations, getConsultationsByExpertId };
