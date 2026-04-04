const express = require('express');
const router = express.Router();
const { 
  getParts, 
  addPart, 
  updatePartQuantity,
  deletePart
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getParts)
  .post(protect, authorize('admin', 'manager', 'client'), addPart);

router.route('/:id')
  .delete(protect, authorize('admin', 'manager', 'client'), deletePart);

router.patch('/:id/quantity', protect, authorize('admin', 'manager', 'technician', 'client'), updatePartQuantity);

module.exports = router;
