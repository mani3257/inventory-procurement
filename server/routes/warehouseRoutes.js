const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createWarehouse, getWarehouses, updateWarehouse } = require('../controllers/warehouseController');

router.post('/', protect, authorize('admin'), createWarehouse);
router.get('/', protect, getWarehouses);
router.patch('/:id', protect, authorize('admin'), updateWarehouse);

module.exports = router;