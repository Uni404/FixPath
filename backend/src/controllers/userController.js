const pool = require('../db');

const getUserProfileById = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT UserID, Name, Email, CreatedTime
      FROM USER
      WHERE UserID = ?
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User profile not found.'
      });
    }

    return res.json({
      message: 'User profile retrieved successfully.',
      profile: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve user profile.',
      error: error.message
    });
  }
};

const updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    const { name } = req.body;

    if ('email' in req.body) {
        return res.status(400).json({
            message: 'Email cannot be updated.'
        });
    }

    if (!name) {
        return res.status(400).json({
            message: 'name is required.'
        });
    }

    try {
        await pool.query(
            `
      UPDATE USER
      SET Name = ?
      WHERE UserID = ?
      `,
            [name, userId]
        );

        const [rows] = await pool.query(
            `
      SELECT UserID, Name, Email, CreatedTime
      FROM USER
      WHERE UserID = ?
      LIMIT 1
      `,
            [userId]
        );

        return res.json({
            message: 'User profile updated successfully.',
            profile: rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update user profile.',
            error: error.message
        });
    }
};

const getUserReports = async (req, res) => {
    const { userId } = req.params;

    try {
        const [rows] = await pool.query(
            `
      SELECT
        r.ReportID,
        r.DeviceID,
        r.ProblemDescription,
        r.ReportDate,
        r.DetectedRiskLevel,
        r.Status,
        d.DeviceName,
        dc.CategoryName
      FROM PROBLEM_REPORT r
      JOIN DEVICE d ON r.DeviceID = d.DeviceID
      JOIN DEVICE_CATEGORY dc ON d.CategoryID = dc.CategoryID
      WHERE r.UserID = ?
      ORDER BY r.ReportDate DESC
      `,
            [userId]
        );

        return res.json({
            message: 'User reports retrieved successfully.',
            reports: rows
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve user reports.',
            error: error.message
        });
    }
};

const getUserResults = async (req, res) => {
    const { userId } = req.params;

    try {
        const [rows] = await pool.query(
            `
      SELECT
        dr.ResultID,
        dr.ReportID,
        dr.RuleID,
        dr.Outcome,
        dr.Recommendation,
        dr.RiskLevel,
        dr.ResultDate
      FROM DECISION_RESULT dr
      JOIN PROBLEM_REPORT r ON dr.ReportID = r.ReportID
      WHERE r.UserID = ?
      ORDER BY dr.ResultDate DESC
      `,
            [userId]
        );

        return res.json({
            message: 'User results retrieved successfully.',
            results: rows
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve user results.',
            error: error.message
        });
    }
};

const getUserConsultations = async (req, res) => {
    const { userId } = req.params;

    try {
        const [rows] = await pool.query(
            `
      SELECT
        c.ConsultationID,
        c.ResultID,
        c.RequestType,
        c.ConsultationStatus,
        c.RequestDate,
        c.ConsultationDate,
        c.MeetingLink,
        c.ConsultationNotes,
        e.ExpertName,
        e.ServiceType,
        e.ExpertEmail
      FROM CONSULTATION c
      JOIN EXPERT e ON c.ExpertID = e.ExpertID
      WHERE c.UserID = ?
      ORDER BY c.RequestDate DESC
      `,
            [userId]
        );

        return res.json({
            message: 'User consultations retrieved successfully.',
            consultations: rows
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve user consultations.',
            error: error.message
        });
    }
};

module.exports = {
    getUserProfileById, updateUserProfile, getUserReports, getUserResults, getUserConsultations
};
