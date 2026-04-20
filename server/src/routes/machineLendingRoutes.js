const express = require('express');
const router = express.Router();
const lendingController = require('../controllers/machineLendingController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Contractor routes
router.post('/request', authorize('contractor'), lendingController.createRequest);
router.post('/request/:id/pay', authorize('contractor'), lendingController.processPayment);
router.post('/request/:id/return', authorize('contractor'), lendingController.requestReturn);
router.post('/request/:id/complete', authorize('contractor'), lendingController.completeTask);
router.post('/request/:id/maintenance', authorize('contractor'), lendingController.requestMaintenance);
router.get('/my-requests', authorize('contractor'), lendingController.getMyRequests);

// Admin routes
router.get('/admin/requests', authorize('admin'), lendingController.getAllRequests);
router.patch('/request/:id/status', authorize('admin'), lendingController.updateRequestStatus);
router.patch('/request/:id/confirm-return', authorize('admin'), lendingController.confirmReturn);

module.exports = router;
