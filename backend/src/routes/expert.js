const express = require('express');
const router = express.Router();
const {
  getExpertProfileById,
  updateExpertProfile
} = require('../controllers/expertController');

router.get('/:expertId/profile', getExpertProfileById);
router.patch('/:expertId/profile', updateExpertProfile);

module.exports = router;
