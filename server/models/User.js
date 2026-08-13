const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'warehouse_manager', 'procurement_manager'],
    default: 'warehouse_manager'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
