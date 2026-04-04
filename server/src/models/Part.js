const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: { type: String, required: true },
  partNumber: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: String },
  price: { type: Number, required: true },
  quantityInStock: { type: Number, required: true, default: 0 },
  minimumStockLevel: { type: Number, required: true, default: 5 },
  supplier: { type: String },
  location: { type: String },
  machinesCompatibleWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Machine' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Part', partSchema);
