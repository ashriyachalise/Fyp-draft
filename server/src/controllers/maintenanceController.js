const Maintenance = require('../models/Maintenance');
const Machine = require('../models/Machine');
const Notification = require('../models/Notification');
const MachineRequest = require('../models/MachineRequest');

// @desc    Schedule maintenance
// @route   POST /api/maintenance
// @access  Private/Admin/Manager
exports.scheduleMaintenance = async (req, res) => {
  const { machine, technician, maintenanceType, scheduledDate, notes } = req.body;

  try {
    const isClient = req.user && req.user.role === 'client';
    
    const maintenance = new Maintenance({
      machine,
      technician: isClient ? undefined : technician,
      requestedBy: isClient ? req.user._id : undefined,
      maintenanceType,
      scheduledDate: isClient ? undefined : scheduledDate,
      status: isClient ? 'requested' : 'scheduled',
      notes
    });

    const createdMaintenance = await maintenance.save();
    
    // Update machine status if machine ID exists and it's heavily scheduled
    if (machine && !isClient) {
      await Machine.findByIdAndUpdate(machine, { status: 'maintenance' });
    }

    if (isClient) {
      await Notification.create({
        recipientRole: 'admin',
        title: 'New Maintenance Request',
        message: `Client ${req.user.username} has requested a maintenance task (${maintenanceType}).`,
        type: 'maintenance_requested'
      });
    } else {
      await Notification.create({
        recipient: req.user?._id,
        title: 'Maintenance Task Scheduled',
        message: `A new maintenance task (${maintenanceType}) has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
        type: 'maintenance_scheduled'
      });
    }

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
      .populate('machine', 'name model serialNumber location')
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
    const record = await Maintenance.findById(req.params.id).populate('machine');

    if (record) {
      const prevStatus = record.status;
      record.status = req.body.status || record.status;
      record.technician = req.body.technician || record.technician;
      record.scheduledDate = req.body.scheduledDate || record.scheduledDate;
      record.completionDate = req.body.status === 'completed' ? Date.now() : record.completionDate;
      record.notes = req.body.notes || record.notes;
      record.partsUsed = req.body.partsUsed || record.partsUsed;
      record.cost = req.body.cost || record.cost;

      const updatedRecord = await record.save();

      // Notification for accepting the scheduled task
      if (prevStatus === 'scheduled' && (record.status === 'in-progress' || record.status === 'pending')) {
        await Notification.create({
          recipientRole: 'admin',
          title: 'Maintenance Task Accepted',
          message: `${req.user.username} has accepted the maintenance task (${record.maintenanceType}) for ${record.machine?.name || 'Machine'}.`,
          type: 'maintenance_accepted'
        });
      }

      // If completed, update machine status back to idle so it can be requested again
      if (req.body.status === 'completed' && prevStatus !== 'completed') {
        if (record.machine) {
          await Machine.findByIdAndUpdate(record.machine._id, { 
            status: 'idle',
            lastMaintenanceDate: Date.now() 
          });

          // Terminate any active leases for this machine so it cleanly resets for new requests
          await MachineRequest.updateMany(
            { machine: record.machine._id, status: 'active' },
            { status: 'returned', returnDate: Date.now() }
          );
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
