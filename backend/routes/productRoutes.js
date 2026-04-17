const express = require('express');
const {
  getProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/recommend/:productId', getRecommendations);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
