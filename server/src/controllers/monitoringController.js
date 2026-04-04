const Machine = require('../models/Machine');
const Part = require('../models/Part');

// @desc    Get machine monitoring data with compatible parts
// @route   GET /api/monitoring
// @access  Private
exports.getMonitoringData = async (req, res) => {
  try {
    const machines = await Machine.find({});
    
    // For each machine, find parts that list it in machinesCompatibleWith
    const monitoredMachines = await Promise.all(machines.map(async (machine) => {
      const compatibleParts = await Part.find({
        machinesCompatibleWith: machine._id
      }).select('name partNumber quantityInStock minimumStockLevel category price');

      // Use persistent totalWorkingHours or fallback to log summation
      const totalWorkingHours = machine.totalWorkingHours || 
                               machine.performanceLogs?.reduce((acc, log) => acc + (log.value || 0), 0) || 
                               0; 
      
      const healthScore = calculateHealthScore(machine, compatibleParts);

      return {
        ...machine.toObject(),
        compatibleParts,
        totalWorkingHours,
        healthScore,
        lastServiced: machine.lastMaintenanceDate || machine.createdAt
      };
    }));

    res.json(monitoredMachines);
  } catch (error) {
    console.error('Monitoring Error:', error);
    res.status(500).json({ message: error.message });
  }
};

function calculateHealthScore(machine, parts) {
  if (machine.status === 'down') return 25;
  if (machine.status === 'maintenance') return 50;
  
  // Check if any compatible critical parts are low on stock
  const lowStockCritical = parts.some(p => p.quantityInStock <= p.minimumStockLevel);
  if (lowStockCritical) return 85;
  
  return 100;
}
