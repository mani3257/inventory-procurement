const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  getLowStockProducts
} = require('../controllers/productController');

router.post('/', protect, authorize('admin'), createProduct);
router.get('/', protect, getProducts);
router.get('/low-stock', protect, getLowStockProducts);
router.get('/:id', protect, getProductById);
router.patch('/:id', protect, authorize('admin'), updateProduct);

module.exports = router;