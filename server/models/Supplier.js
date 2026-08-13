const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: { type: String },
  contactPhone: { type: String },
  address: { type: String },
  loginEmail: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);