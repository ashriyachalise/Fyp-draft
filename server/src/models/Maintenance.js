const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  maintenanceType: { 
    type: String, 
    default: 'routine' 
  },
  scheduledDate: { type: Date },
  completionDate: { type: Date },
  status: { 
    type: String, 
    default: 'scheduled' 
  },
  partsUsed: [{
    part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
    quantity: { type: Number, required: true }
  }],
  notes: { type: String },
  cost: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
