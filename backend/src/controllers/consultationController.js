const pool = require('../db');

const createConsultation = async (req, res) => {
    const { resultId, userId, requestType, consultationNotes } = req.body;

    if (!resultId || !userId) {
        return res.status(400).json({
            message: 'resultId and userId are required.'
        });
    }

    try {
        // 1. Check whether result exists
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

        // 2. Check whether an active consultation already exists
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

        // 3. Find available expert
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

        // 4. Generate meeting link
        const meetingLink = `https://meet.jit.si/fixpath-${resultId}-${Date.now()}`;

        // 5. Insert consultation record
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
        e.AvailabilityStatus
      FROM CONSULTATION c
      JOIN EXPERT e ON c.ExpertID = e.ExpertID
      WHERE c.ConsultationID = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Consultation not found.'
      });
    }

    return res.json({
      message: 'Consultation retrieved successfully.',
      consultation: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve consultation.',
      error: error.message
    });
  }
};
module.exports = {createConsultation, updateConsultationStatus, getConsultationById};
