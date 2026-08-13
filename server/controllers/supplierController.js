const Supplier = require('../models/Supplier');
const asyncHandler = require('../utils/asyncHandler');

exports.createSupplier = asyncHandler(async (req, res) => {
  const { name, contactEmail, contactPhone, address } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Supplier name is required');
  }
  const supplier = await Supplier.create({ name, contactEmail, contactPhone, address });
  res.status(201).json(supplier);
});

exports.getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort({ name: 1 });
  res.json(suppliers);
});

exports.updateSupplier = asyncHandler(async (req, res) => {
  const { name, contactEmail, contactPhone, address } = req.body;
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }
  if (name !== undefined) supplier.name = name;
  if (contactEmail !== undefined) supplier.contactEmail = contactEmail;
  if (contactPhone !== undefined) supplier.contactPhone = contactPhone;
  if (address !== undefined) supplier.address = address;
  await supplier.save();
  res.json(supplier);
});