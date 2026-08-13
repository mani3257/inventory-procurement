const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  purchaseRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['ORDERED', 'RECEIVED'],
    default: 'ORDERED'
  },
  orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receivedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);