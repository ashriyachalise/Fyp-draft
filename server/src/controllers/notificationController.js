const Notification = require('../models/Notification');

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { recipientRole: req.user.role },
        { recipient: null, recipientRole: null },
        { recipient: { $exists: false }, recipientRole: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (notification) {
      // Check if user is the explicit recipient OR belongs to the recipient role
      const isRecipient = notification.recipient && notification.recipient.toString() === req.user._id.toString();
      const isRoleRecipient = notification.recipientRole && notification.recipientRole === req.user.role;
      const isPublic = !notification.recipient && !notification.recipientRole;

      if (isRecipient || isRoleRecipient || isPublic) {
        notification.isRead = true;
        await notification.save();
        return res.json(notification);
      }
    }
    
    res.status(404).json({ message: 'Notification not found or unauthorized' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
