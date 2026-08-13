const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Supplier = require('../models/Supplier');
const asyncHandler = require('../utils/asyncHandler');

exports.registerSupplier = asyncHandler(async (req, res) => {
  const { name, loginEmail, password, contactPhone, address } = req.body;

  if (!name || !loginEmail || !password) {
    res.status(400);
    throw new Error('Name, login email, and password are required');
  }

  const existing = await Supplier.findOne({ loginEmail });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const supplier = await Supplier.create({
    name,
    loginEmail,
    contactEmail: loginEmail,
    contactPhone,
    address,
    passwordHash,
    isApproved: false
  });

  res.status(201).json({
    message: 'Registration submitted. An admin must approve your account before you can log in.',
    supplierId: supplier._id
  });
});

exports.supplierLogin = asyncHandler(async (req, res) => {
  const { loginEmail, password } = req.body;

  const supplier = await Supplier.findOne({ loginEmail });
  if (!supplier || !supplier.passwordHash) {
    res.status(400);
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, supplier.passwordHash);
  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid credentials');
  }

  if (!supplier.isApproved) {
    res.status(403);
    throw new Error('Your account is pending admin approval');
  }

  const token = jwt.sign(
    { id: supplier._id, type: 'supplier' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    supplier: { id: supplier._id, name: supplier.name, loginEmail: supplier.loginEmail }
  });
});

exports.getPendingSuppliers = asyncHandler(async (req, res) => {
  const pending = await Supplier.find({ isApproved: false, loginEmail: { $ne: null } })
    .select('name loginEmail contactPhone address createdAt');
  res.json(pending);
});

exports.approveSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }
  supplier.isApproved = true;
  await supplier.save();
  res.json({ message: 'Supplier approved', supplier });
});