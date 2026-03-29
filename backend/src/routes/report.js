const express = require('express');
const router = express.Router();

const { createReport } = require('../controllers/reportController');
const upload = require('../middleware/upload');

router.post('/', upload.array('media', 5), createReport);

module.exports = router;
