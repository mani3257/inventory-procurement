const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, minimumStock, currentStock, warehouse } = req.body;
  if (!name || !sku || !warehouse) {
    res.status(400);
    throw new Error('Name, SKU, and warehouse are required');
  }
  const product = await Product.create({
    name, sku, category,
    minimumStock: minimumStock || 0,
    currentStock: currentStock || 0,
    warehouse
  });
  res.status(201).json(product);
});

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('warehouse', 'name location').sort({ name: 1 });
  const withLowStockFlag = products.map((p) => ({
    ...p.toObject(),
    isLowStock: p.currentStock < p.minimumStock
  }));
  res.json(withLowStockFlag);
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('warehouse', 'name location');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ ...product.toObject(), isLowStock: product.currentStock < product.minimumStock });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { name, category, minimumStock } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (minimumStock !== undefined) product.minimumStock = minimumStock;
  await product.save();
  res.json(product);
});

exports.getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lt: ['$currentStock', '$minimumStock'] }
  }).populate('warehouse', 'name location');
  res.json(products);
});