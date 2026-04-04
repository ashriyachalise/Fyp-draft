const Machine = require('../models/Machine');
const Part = require('../models/Part');
const Maintenance = require('../models/Maintenance');
const Notification = require('../models/Notification');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalMachines = await Machine.countDocuments();
    const activeMachines = await Machine.countDocuments({ status: { $ne: 'maintenance' } });
    
    const parts = await Part.find({});
    const lowStockParts = parts.filter(p => (p.quantityInStock || 0) <= (p.minimumStockLevel || 5)).length;

    const pendingMaintenance = await Maintenance.countDocuments({ 
       status: { $nin: ['completed', 'cancelled', 'not complete'] } 
    });
    
    // Recent alerts - Filtered properly for privacy and role
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { recipientRole: req.user.role },
        { recipient: null, recipientRole: null },
        { recipient: { $exists: false }, recipientRole: { $exists: false } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate dynamic system health parameter instead of hardcoding 98.5%
    let systemHealth = '100.0%';
    if (totalMachines > 0) {
      systemHealth = ((activeMachines / totalMachines) * 100).toFixed(1) + '%';
    }

    // Dynamic weekly usage simulation based on the active machine load parameter
    const weeklyUsage = statsWeeklyUsage(activeMachines);

    res.json({
      activeMachines,
      lowStockParts,
      pendingMaintenance,
      systemHealth,
      recentNotifications: notifications, // Fixed key name for frontend
      weeklyUsage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper for dynamic usage
function statsWeeklyUsage(activeMachines) {
  const baseUsage = activeMachines > 0 ? 60 + (activeMachines * 2) : 35;
  return [
    { day: 'Mon', hours: Math.min(100, baseUsage + Math.floor(Math.random() * 15)) },
    { day: 'Tue', hours: Math.min(100, baseUsage + Math.floor(Math.random() * 15)) },
    { day: 'Wed', hours: Math.min(100, baseUsage + Math.floor(Math.random() * 20)) },
    { day: 'Thu', hours: Math.min(100, baseUsage + Math.floor(Math.random() * 10)) },
    { day: 'Fri', hours: Math.min(100, baseUsage + Math.floor(Math.random() * 25)) },
    { day: 'Sat', hours: Math.min(100, Math.floor(baseUsage * 0.6)) },
    { day: 'Sun', hours: Math.min(100, Math.floor(baseUsage * 0.4)) },
  ];
}
