const express = require('express');
const router = express.Router();
const { createConsultation, updateConsultationStatus, getConsultationById } = require('../controllers/consultationController');

router.get('/:id', getConsultationById);
router.patch('/:id/status', updateConsultationStatus);
router.post('/', createConsultation);

module.exports = router;
