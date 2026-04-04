const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, orderController.createOrder)
  .get(protect, orderController.getUserOrders);

// Admin Finance Tracker Endpoint
router.get('/all', protect, authorize('admin', 'manager'), orderController.getAllOrders);

module.exports = router;
