const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  type: {
    type: String,
    enum: ['PURCHASE', 'SALE', 'TRANSFER_OUT', 'TRANSFER_IN', 'RETURN', 'DAMAGE'],
    required: true
  },
  quantity: { type: Number, required: true },
  reference: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', default: null },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = mongoose.model('StockMovement', stockMovementSchema);