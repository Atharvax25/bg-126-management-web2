const express = require('express');
const { getDashboardAnalytics } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getDashboardAnalytics);

module.exports = router;
