const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', protect, userController.getUserProfile);
router.get('/technicians', protect, userController.getTechnicians);
router.get('/', protect, authorize('admin', 'client'), userController.getUsers);

module.exports = router;
