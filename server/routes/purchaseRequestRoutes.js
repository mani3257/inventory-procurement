const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createPurchaseRequest,
  getPurchaseRequests,
  reviewPurchaseRequest
} = require('../controllers/purchaseRequestController');

router.post('/', protect, authorize('admin', 'warehouse_manager'), createPurchaseRequest);
router.get('/', protect, getPurchaseRequests);
router.patch('/:id/review', protect, authorize('admin', 'procurement_manager'), reviewPurchaseRequest);

module.exports = router;