const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { protectSupplier } = require('../middleware/supplierAuthMiddleware');
const {
  registerSupplier,
  supplierLogin,
  getPendingSuppliers,
  approveSupplier
} = require('../controllers/supplierAuthController');
const { getMyOrders, getMyProfile } = require('../controllers/supplierPortalController');

router.post('/register', registerSupplier);
router.post('/login', supplierLogin);
router.get('/pending', protect, authorize('admin'), getPendingSuppliers);
router.patch('/:id/approve', protect, authorize('admin'), approveSupplier);
router.get('/me', protectSupplier, getMyProfile);
router.get('/my-orders', protectSupplier, getMyOrders);

module.exports = router;