const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  category: { type: String },
  minimumStock: { type: Number, required: true, default: 0 },
  currentStock: { type: Number, required: true, default: 0 },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true }
}, { timestamps: true });

// A given SKU can exist once per warehouse, but the same SKU can appear
// across multiple warehouses (each with its own independent stock count).
productSchema.index({ sku: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);