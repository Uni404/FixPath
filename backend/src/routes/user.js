const express = require('express');
const router = express.Router();

const {
    getUserProfileById,
    updateUserProfile,
    getUserReports,
    getUserResults,
    getUserConsultations,
    getUserReportDetail
} = require('../controllers/userController');

router.get('/:userId/profile', getUserProfileById);
router.patch('/:userId/profile', updateUserProfile);

router.get('/:userId/reports', getUserReports);
router.get('/report/:reportId/detail', getUserReportDetail);
router.get('/:userId/results', getUserResults);
router.get('/:userId/consultations', getUserConsultations);


module.exports = router;