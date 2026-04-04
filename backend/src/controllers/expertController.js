const pool = require('../db');

const getExpertProfileById = async (req, res) => {
  const { expertId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        ExpertID,
        ExpertName,
        ExpertEmail,
        Phone,
        ServiceType,
        ExpertRating,
        AvailabilityStatus
      FROM EXPERT
      WHERE ExpertID = ?
      LIMIT 1
      `,
      [expertId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Expert profile not found.'
      });
    }

    return res.json({
      message: 'Expert profile retrieved successfully.',
      profile: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve expert profile.',
      error: error.message
    });
  }
};

const updateExpertProfile = async (req, res) => {
    const { expertId } = req.params;
    const {
        expertName,
        phone,
        availabilityStatus
    } = req.body;

    
    if ('expertEmail' in req.body) {
        return res.status(400).json({
            message: 'Email cannot be updated.'
        });
    }

    if (!expertName || !availabilityStatus) {
        return res.status(400).json({
            message: 'expertName and availabilityStatus are required.'
        });
    }

    try {
        await pool.query(
            `
          UPDATE EXPERT
          SET
            ExpertName = ?,
            Phone = ?,
            AvailabilityStatus = ?
          WHERE ExpertID = ?
          `,
            [
                expertName,
                phone || null,
                availabilityStatus,
                expertId
            ]
        );

        const [rows] = await pool.query(
            `
          SELECT
            ExpertID,
            ExpertName,
            ExpertEmail,
            Phone,
            ServiceType,
            ExpertRating,
            AvailabilityStatus
          FROM EXPERT
          WHERE ExpertID = ?
          LIMIT 1
          `,
            [expertId]
        );

        return res.json({
            message: 'Expert profile updated successfully.',
            profile: rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update expert profile.',
            error: error.message
        });
    }
};

module.exports = {
  getExpertProfileById,
  updateExpertProfile
};
