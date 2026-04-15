const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', protect, userController.getUserProfile);
router.get('/technicians', protect, userController.getTechnicians);
router.patch('/technician/status', protect, authorize('technician'), userController.updateTechnicianStatus);
router.get('/', protect, authorize('admin', 'client'), userController.getUsers);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
