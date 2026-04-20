const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['idle', 'reserved', 'active', 'maintenance', 'down'], 
    default: 'idle' 
  },
  location: { type: String },
  purchaseDate: { type: Date },
  lastMaintenanceDate: { type: Date },
  totalWorkingHours: { type: Number, default: 0 },
  performanceLogs: [{
    timestamp: { type: Date, default: Date.now },
    metric: String,
    value: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Machine', machineSchema);
