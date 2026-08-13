const Warehouse = require('../models/Warehouse');
const asyncHandler = require('../utils/asyncHandler');

exports.createWarehouse = asyncHandler(async (req, res) => {
  const { name, location } = req.body;
  if (!name || !location) {
    res.status(400);
    throw new Error('Name and location are required');
  }
  const warehouse = await Warehouse.create({ name, location });
  res.status(201).json(warehouse);
});

exports.getWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await Warehouse.find().sort({ name: 1 });
  res.json(warehouses);
});

exports.updateWarehouse = asyncHandler(async (req, res) => {
  const { name, location } = req.body;
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    res.status(404);
    throw new Error('Warehouse not found');
  }
  if (name !== undefined) warehouse.name = name;
  if (location !== undefined) warehouse.location = location;
  await warehouse.save();
  res.json(warehouse);
});