const Machine = require('../models/Machine');

// @desc    Update machine working hours manually
// @route   PATCH /api/monitoring/:id/hours
// @access  Private
exports.updateMachineHours = async (req, res) => {
  const { hours } = req.body;
  
  if (hours === undefined || hours < 0) {
    return res.status(400).json({ message: 'Please provide valid working hours' });
  }

  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    machine.totalWorkingHours = hours;
    
    // Also add a performance log entry for tracking
    machine.performanceLogs.push({
      metric: 'Manual Hours Update',
      value: hours,
      timestamp: new Date()
    });

    await machine.save();
    res.json(machine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
