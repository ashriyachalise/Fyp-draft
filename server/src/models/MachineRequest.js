const mongoose = require('mongoose');

const machineRequestSchema = new mongoose.Schema({
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  siteLocation: {
    type: String,
    required: [true, 'Site location is required for machine lending']
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'pending_payment', 'active', 'returned', 'rejected', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['Khalti', 'eSewa', 'none'],
    default: 'none'
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  paymentTransactionId: {
    type: String
  },
  returnRequested: {
    type: Boolean,
    default: false
  },
  returnDate: {
    type: Date
  },
  maintenanceRequested: {
    type: Boolean,
    default: false
  },
  maintenanceDescription: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MachineRequest', machineRequestSchema);
