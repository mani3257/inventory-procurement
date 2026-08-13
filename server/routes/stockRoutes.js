const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { transferStock, getStockLedger } = require('../controllers/stockController');

router.post('/transfer', protect, authorize('admin', 'warehouse_manager'), transferStock);
router.get('/ledger/:productId', protect, getStockLedger);

module.exports = router;