const express = require('express');
const router = express.Router();
const { getReplacementOptions } = require('../controllers/replacementController');

router.get('/:resultId', getReplacementOptions);

module.exports = router;
