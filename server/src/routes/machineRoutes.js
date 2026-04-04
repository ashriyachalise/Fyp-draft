const express = require('express');
const router = express.Router();
const { 
  getMachines, 
  getMachineById, 
  createMachine, 
  updateMachineStatus,
  addPerformanceLog,
  deleteMachine
} = require('../controllers/machineController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getMachines)
  .post(protect, authorize('admin', 'manager', 'client'), createMachine);

router.route('/:id')
  .get(protect, getMachineById)
  .delete(protect, authorize('admin', 'manager'), deleteMachine);

router.patch('/:id/status', protect, authorize('admin', 'manager', 'technician', 'client'), updateMachineStatus);
router.post('/:id/logs', protect, authorize('technician', 'client'), addPerformanceLog);

module.exports = router;
