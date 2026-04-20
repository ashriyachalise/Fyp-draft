const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientRole: { 
    type: String, 
    enum: ['admin', 'manager', 'technician', 'contractor', null],
    default: null
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    default: 'system' 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
