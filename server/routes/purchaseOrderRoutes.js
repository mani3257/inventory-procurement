const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createPurchaseOrder,
  getPurchaseOrders,
  receivePurchaseOrder
} = require('../controllers/purchaseOrderController');

router.post('/', protect, authorize('admin', 'procurement_manager'), createPurchaseOrder);
router.get('/', protect, getPurchaseOrders);
router.patch('/:id/receive', protect, authorize('admin', 'warehouse_manager'), receivePurchaseOrder);

module.exports = router;