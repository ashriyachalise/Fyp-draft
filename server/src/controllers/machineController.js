const Machine = require('../models/Machine');
const MachineRequest = require('../models/MachineRequest');

// @desc    Get all machines
// @route   GET /api/machines
// @access  Private
exports.getMachines = async (req, res) => {
  try {
    const machines = await Machine.find({}).lean();
    
    // Dynamically derive location for each machine
    const updatedMachines = await Promise.all(machines.map(async (machine) => {
      if (machine.status === 'active') {
        const activeRequest = await MachineRequest.findOne({ 
          machine: machine._id, 
          status: 'active' 
        });
        machine.location = activeRequest ? activeRequest.siteLocation : 'Location Unknown';
      } else {
        machine.location = 'Not in use';
      }
      return machine;
    }));

    res.json(updatedMachines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get machine by ID
// @route   GET /api/machines/:id
// @access  Private
exports.getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id).lean();
    if (machine) {
      if (machine.status === 'active') {
        const activeRequest = await MachineRequest.findOne({ 
          machine: machine._id, 
          status: 'active' 
        });
        machine.location = activeRequest ? activeRequest.siteLocation : 'Location Unknown';
      } else {
        machine.location = 'Not in use';
      }
      res.json(machine);
    } else {
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a machine
// @route   POST /api/machines
// @access  Private/Admin
exports.createMachine = async (req, res) => {
  const { name, model, serialNumber, location, purchaseDate } = req.body;

  try {
    const machine = new Machine({
      name,
      model,
      serialNumber,
      location,
      purchaseDate
    });

    const createdMachine = await machine.save();
    res.status(201).json(createdMachine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update machine status
// @route   PATCH /api/machines/:id/status
// @access  Private/Technician
exports.updateMachineStatus = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (machine) {
      machine.status = req.body.status || machine.status;
      const updatedMachine = await machine.save();
      res.json(updatedMachine);
    } else {
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add performance log
// @route   POST /api/machines/:id/logs
// @access  Private/Technician
exports.addPerformanceLog = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (machine) {
      const { metric, value } = req.body;
      machine.performanceLogs.push({ metric, value });
      const updatedMachine = await machine.save();
      res.json(updatedMachine);
    } else {
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a machine
// @route   DELETE /api/machines/:id
// @access  Private/Admin
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (machine) {
      await machine.deleteOne();
      res.json({ message: 'Machine removed' });
    } else {
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

