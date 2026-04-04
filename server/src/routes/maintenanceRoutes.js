const express = require('express');
const router = express.Router();
const { 
  scheduleMaintenance, 
  getMaintenanceRecords, 
  updateMaintenanceRecord 
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getMaintenanceRecords)
  .post(protect, authorize('admin', 'manager', 'client'), scheduleMaintenance);

router.patch('/:id', protect, authorize('admin', 'manager', 'technician', 'client'), updateMaintenanceRecord);

module.exports = router;
