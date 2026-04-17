const express = require('express');
const { toggleBookmark, getBookmarks } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:productId', protect, toggleBookmark);
router.get('/', protect, getBookmarks);

module.exports = router;
