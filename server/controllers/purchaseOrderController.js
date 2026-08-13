const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseRequest = require('../models/PurchaseRequest');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const asyncHandler = require('../utils/asyncHandler');

exports.createPurchaseOrder = asyncHandler(async (req, res) => {
  const { purchaseRequest, supplier, quantity } = req.body;

  if (!purchaseRequest || !supplier || !quantity) {
    res.status(400);
    throw new Error('Purchase request, supplier, and quantity are required');
  }

  const request = await PurchaseRequest.findById(purchaseRequest);
  if (!request) {
    res.status(404);
    throw new Error('Purchase request not found');
  }
  if (request.status !== 'APPROVED') {
    res.status(400);
    throw new Error('Can only create an order from an approved request');
  }

  const order = await PurchaseOrder.create({
    purchaseRequest,
    supplier,
    product: request.product,
    quantity,
    orderedBy: req.user._id
  });

  res.status(201).json(order);
});

exports.getPurchaseOrders = asyncHandler(async (req, res) => {
  const orders = await PurchaseOrder.find()
    .populate('supplier', 'name')
    .populate('product', 'name sku')
    .populate('orderedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(orders);
});

// This is the step where the doc's example happens:
// stock is 14, order for 50 arrives, stock becomes 64
exports.receivePurchaseOrder = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Purchase order not found');
  }
  if (order.status !== 'ORDERED') {
    res.status(400);
    throw new Error('This order has already been received');
  }

  const product = await Product.findById(order.product);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.currentStock += order.quantity;
  await product.save();

  order.status = 'RECEIVED';
  order.receivedAt = new Date();
  await order.save();

  await StockMovement.create({
    product: product._id,
    warehouse: product.warehouse,
    type: 'PURCHASE',
    quantity: order.quantity,
    reference: order._id,
    performedBy: req.user._id
  });

  res.json({ order, updatedProduct: product });
});