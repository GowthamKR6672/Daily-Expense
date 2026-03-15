const express = require('express');
const router = express.Router();
const { getSummary, getReports } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getSummary);
router.get('/reports', protect, getReports);

module.exports = router;
