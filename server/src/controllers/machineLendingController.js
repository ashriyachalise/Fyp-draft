const Machine = require('../models/Machine');
const MachineRequest = require('../models/MachineRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Maintenance = require('../models/Maintenance');

// Helper to create notifications
const notify = async (recipient, role, title, message, type = 'system') => {
  try {
    await Notification.create({
      recipient,
      recipientRole: role,
      title,
      message,
      type
    });
  } catch (err) {
    console.error('Notification Error:', err);
  }
};

// @desc    Contractor requests a machine
// @route   POST /api/lending/request
// @access  Private (Contractor)
exports.createRequest = async (req, res) => {
  try {
    const { machineId, siteLocation } = req.body;

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // STRICT CHECK: Only idle machines can be requested
    if (machine.status !== 'idle') {
      return res.status(400).json({ message: 'Machine is not available for lending' });
    }

    const request = await MachineRequest.create({
      contractor: req.user._id,
      machine: machineId,
      siteLocation,
      status: 'pending'
    });

    // Notify Admins
    await notify(null, 'admin', 'New Machine Request', `Contractor ${req.user.username} requested ${machine.name} for ${siteLocation}`);

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin updates request status (Approve/Reject)
// @route   PATCH /api/lending/request/:id/status
// @access  Private (Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const request = await MachineRequest.findById(req.params.id).populate('machine contractor');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (status === 'approved') {
      request.status = 'pending_payment';
      // Reserve the machine
      await Machine.findByIdAndUpdate(request.machine._id, { status: 'reserved' });
      
      await notify(request.contractor._id, 'contractor', 'Machine Request Approved', `Your request for ${request.machine.name} has been approved. Please proceed to payment.`);
    } else if (status === 'rejected') {
      request.status = 'rejected';
      await notify(request.contractor._id, 'contractor', 'Machine Request Rejected', `Your request for ${request.machine.name} was rejected.`);
    }

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Contractor processes mock payment
// @route   POST /api/lending/request/:id/pay
// @access  Private (Contractor)
exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod, transactionId, amount } = req.body;
    const request = await MachineRequest.findById(req.params.id).populate('machine');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending_payment') {
      return res.status(400).json({ message: 'Request is not in a payable state' });
    }

    // Mock payment success logic
    request.status = 'active';
    request.paymentStatus = 'paid';
    request.paymentMethod = paymentMethod;
    request.paymentTransactionId = transactionId;
    request.paymentAmount = amount;

    // Update machine status to active
    await Machine.findByIdAndUpdate(request.machine._id, { status: 'active' });

    await request.save();

    // Notify Admin and Contractor
    await notify(null, 'admin', 'Payment Confirmed', `Payment confirmed for ${request.machine.name} by ${req.user.username}`);
    await notify(req.user._id, 'contractor', 'Payment Successful', `Your payment for ${request.machine.name} was successful. The machine is now active at ${request.siteLocation}.`);

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Contractor requests return
// @route   POST /api/lending/request/:id/return
// @access  Private (Contractor)
exports.requestReturn = async (req, res) => {
  try {
    const request = await MachineRequest.findById(req.params.id).populate('machine');

    if (!request || request.status !== 'active') {
      return res.status(400).json({ message: 'Request not found or not active' });
    }

    request.returnRequested = true;
    await request.save();

    // Notify Admin
    await notify(null, 'admin', 'Machine Return Request', `${req.user.username} requested to return ${request.machine.name}`);

    res.json({ message: 'Return request submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Contractor marks leasing task as COMPLETED
// @route   POST /api/lending/request/:id/complete
// @access  Private (Contractor)
exports.completeTask = async (req, res) => {
  try {
    const request = await MachineRequest.findById(req.params.id).populate('machine');

    if (!request || request.status !== 'active') {
      return res.status(400).json({ message: 'Request not found or not active' });
    }

    request.status = 'completed';
    request.returnDate = Date.now();
    await request.save();

    // Immediately release machine to idle
    await Machine.findByIdAndUpdate(request.machine._id, { status: 'idle' });

    // Notify Admin
    await notify(null, 'admin', 'Task Completed', `${req.user.username} has completed their task and released ${request.machine.name}.`);

    res.json({ message: 'Task marked as completed and machine released.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin confirms return
// @route   PATCH /api/lending/request/:id/confirm-return
// @access  Private (Admin)
exports.confirmReturn = async (req, res) => {
  try {
    const request = await MachineRequest.findById(req.params.id).populate('machine');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'returned';
    request.returnDate = Date.now();
    
    // Machine becomes idle again
    await Machine.findByIdAndUpdate(request.machine._id, { status: 'idle' });

    await request.save();

    // Notify Contractor
    await notify(request.contractor, 'contractor', 'Return Confirmed', `Your return of ${request.machine.name} has been confirmed.`);

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Contractor requests maintenance
// @route   POST /api/lending/request/:id/maintenance
// @access  Private (Contractor)
exports.requestMaintenance = async (req, res) => {
  try {
    const { description } = req.body;
    const request = await MachineRequest.findById(req.params.id).populate('machine');

    if (!request || request.status !== 'active') {
      return res.status(400).json({ message: 'Request not found or not active' });
    }

    request.maintenanceRequested = true;
    request.maintenanceDescription = description;
    await request.save();

    // Create a unified Maintenance ticket that appears in the technician/admin inbox
    await Maintenance.create({
      machine: request.machine._id,
      requestedBy: req.user._id,
      maintenanceType: 'Contractor Support Ticket',
      status: 'requested',
      notes: `Location: ${request.siteLocation}. Contractor Notes: ${description}`
    });

    // Notify Admin
    await notify(null, 'admin', 'Maintenance Requested', `${req.user.username} requested maintenance for ${request.machine.name}`);

    res.json({ message: 'Maintenance request submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get contractor lending history
// @route   GET /api/lending/my-requests
// @access  Private (Contractor)
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await MachineRequest.find({ contractor: req.user._id })
      .populate('machine')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all requests for admin
// @route   GET /api/lending/admin/requests
// @access  Private (Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, machineType } = req.query;
    let query = {};
    if (status) query.status = status;
    
    const requests = await MachineRequest.find(query)
      .populate('contractor', 'username email')
      .populate({
        path: 'machine',
        match: machineType ? { model: machineType } : {}
      })
      .sort({ createdAt: -1 });

    // Filter out if machine matching failed
    const filtered = requests.filter(r => r.machine !== null);
    
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
