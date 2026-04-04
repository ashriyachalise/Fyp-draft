const Maintenance = require('../models/Maintenance');
const Machine = require('../models/Machine');
const Notification = require('../models/Notification');

// @desc    Schedule maintenance
// @route   POST /api/maintenance
// @access  Private/Admin/Manager
exports.scheduleMaintenance = async (req, res) => {
  const { machine, technician, maintenanceType, scheduledDate, notes } = req.body;

  try {
    const maintenance = new Maintenance({
      machine,
      technician,
      maintenanceType,
      scheduledDate,
      notes
    });

    const createdMaintenance = await maintenance.save();
    
    // Update machine status if machine ID exists
    if (machine) {
      await Machine.findByIdAndUpdate(machine, { status: 'maintenance' });
    }

    await Notification.create({
      recipient: req.user?._id,
      title: 'Maintenance Task Scheduled',
      message: `A new maintenance task (${maintenanceType}) has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
      type: 'maintenance_scheduled'
    });

    res.status(201).json(createdMaintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenanceRecords = async (req, res) => {
  try {
    const records = await Maintenance.find({})
      .populate('machine', 'name model serialNumber')
      .populate('technician', 'username email');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update maintenance record (complete/cancel)
// @route   PATCH /api/maintenance/:id
// @access  Private/Technician/Manager
exports.updateMaintenanceRecord = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (record) {
      record.status = req.body.status || record.status;
      record.completionDate = req.body.status === 'completed' ? Date.now() : record.completionDate;
      record.notes = req.body.notes || record.notes;
      record.partsUsed = req.body.partsUsed || record.partsUsed;
      record.cost = req.body.cost || record.cost;

      const updatedRecord = await record.save();

      // If completed, update machine status back to active (or as specified)
      if (req.body.status === 'completed') {
        if (record.machine) {
          await Machine.findByIdAndUpdate(record.machine, { 
            status: 'active',
            lastMaintenanceDate: Date.now() 
          });
        }

        await Notification.create({
          recipientRole: 'admin',
          title: 'Fleet Maintenance Log',
          message: `The maintenance task (${record.maintenanceType}) for ${record.machine?.name || 'Machine'} has been completed by ${req.user.username}.`,
          type: 'maintenance_completed'
        });
      }

      res.json(updatedRecord);
    } else {
      res.status(404).json({ message: 'Maintenance record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
