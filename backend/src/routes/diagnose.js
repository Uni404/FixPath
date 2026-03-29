const express = require('express');
const router = express.Router();
const { diagnoseReport } = require('../controllers/diagnoseController');

router.post('/:reportId', diagnoseReport);

module.exports = router;
