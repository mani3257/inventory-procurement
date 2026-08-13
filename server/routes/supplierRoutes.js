const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createSupplier, getSuppliers, updateSupplier } = require('../controllers/supplierController');

router.post('/', protect, authorize('admin', 'procurement_manager'), createSupplier);
router.get('/', protect, getSuppliers);
router.patch('/:id', protect, authorize('admin', 'procurement_manager'), updateSupplier);

module.exports = router;