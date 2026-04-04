const express = require('express');
const router = express.Router();
const { getMonitoringData } = require('../controllers/monitoringController');
const { updateMachineHours } = require('../controllers/monitoringUpdateController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMonitoringData);
router.patch('/:id/hours', protect, updateMachineHours);

module.exports = router;
