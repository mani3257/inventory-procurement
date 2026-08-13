const PurchaseOrder = require('../models/PurchaseOrder');
const asyncHandler = require('../utils/asyncHandler');

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await PurchaseOrder.find({ supplier: req.supplier._id })
    .populate('product', 'name sku')
    .sort({ createdAt: -1 });

  res.json(orders);
});

exports.getMyProfile = asyncHandler(async (req, res) => {
  res.json(req.supplier);
});