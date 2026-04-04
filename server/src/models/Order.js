const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const shippingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  deliveryLocation: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingDetails: { type: shippingSchema, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  paymentMethod: { type: String, enum: ['mock', 'esewa', 'khalti'], default: 'mock' },
  paymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
