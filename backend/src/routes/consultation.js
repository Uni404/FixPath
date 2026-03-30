const express = require('express');
const router = express.Router();
const { createConsultation, updateConsultationStatus, getConsultationById, getAllConsultations, getConsultationsByExpertId } = require('../controllers/consultationController');

router.get('/', getAllConsultations);
router.post('/', createConsultation);
router.get('/expert/:expertId', getConsultationsByExpertId);
router.patch('/:id/status', updateConsultationStatus);
router.get('/:id', getConsultationById);


module.exports = router;
