const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const asyncHandler = require('../utils/asyncHandler');

// Transfer stock of a product from its current warehouse to another warehouse.
// If the destination warehouse doesn't have a record for this SKU yet, create one.
exports.transferStock = asyncHandler(async (req, res) => {
  const { sourceProductId, destinationWarehouseId, quantity } = req.body;

  if (!sourceProductId || !destinationWarehouseId || !quantity) {
    res.status(400);
    throw new Error('Source product, destination warehouse, and quantity are required');
  }
  if (quantity <= 0) {
    res.status(400);
    throw new Error('Quantity must be greater than zero');
  }

  const sourceProduct = await Product.findById(sourceProductId);
  if (!sourceProduct) {
    res.status(404);
    throw new Error('Source product not found');
  }
  if (sourceProduct.warehouse.toString() === destinationWarehouseId) {
    res.status(400);
    throw new Error('Source and destination warehouses must be different');
  }
  if (sourceProduct.currentStock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock to transfer');
  }

  // Find or create the matching product record at the destination warehouse
  let destinationProduct = await Product.findOne({
    sku: sourceProduct.sku,
    warehouse: destinationWarehouseId
  });

  if (!destinationProduct) {
    destinationProduct = await Product.create({
      name: sourceProduct.name,
      sku: sourceProduct.sku,
      category: sourceProduct.category,
      minimumStock: sourceProduct.minimumStock,
      currentStock: 0,
      warehouse: destinationWarehouseId
    });
  }

  sourceProduct.currentStock -= quantity;
  destinationProduct.currentStock += quantity;
  await sourceProduct.save();
  await destinationProduct.save();

  await StockMovement.create({
    product: sourceProduct._id,
    warehouse: sourceProduct.warehouse,
    type: 'TRANSFER_OUT',
    quantity: -quantity,
    performedBy: req.user._id
  });

  await StockMovement.create({
    product: destinationProduct._id,
    warehouse: destinationProduct.warehouse,
    type: 'TRANSFER_IN',
    quantity: quantity,
    performedBy: req.user._id
  });

  res.json({ sourceProduct, destinationProduct });
});

// Stock ledger — all movements for a given product, most recent first
exports.getStockLedger = asyncHandler(async (req, res) => {
  const movements = await StockMovement.find({ product: req.params.productId })
    .populate('warehouse', 'name location')
    .populate('performedBy', 'name email')
    .sort({ date: -1 });

  res.json(movements);
});