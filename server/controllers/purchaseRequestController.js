const PurchaseRequest = require('../models/PurchaseRequest');
const asyncHandler = require('../utils/asyncHandler');

exports.createPurchaseRequest = asyncHandler(async (req, res) => {
  const { product, requestedQty } = req.body;

  if (!product || !requestedQty) {
    res.status(400);
    throw new Error('Product and requested quantity are required');
  }

  const request = await PurchaseRequest.create({
    product,
    requestedQty,
    requestedBy: req.user._id
  });

  res.status(201).json(request);
});

exports.getPurchaseRequests = asyncHandler(async (req, res) => {
  const requests = await PurchaseRequest.find()
    .populate('product', 'name sku')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(requests);
});

exports.reviewPurchaseRequest = asyncHandler(async (req, res) => {
  const { decision } = req.body; // "APPROVED" or "REJECTED"

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    res.status(400);
    throw new Error('Decision must be APPROVED or REJECTED');
  }

  const request = await PurchaseRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Purchase request not found');
  }

  if (request.status !== 'PENDING') {
    res.status(400);
    throw new Error('This request has already been reviewed');
  }

  request.status = decision;
  request.approvedBy = req.user._id;
  await request.save();

  res.json(request);
});