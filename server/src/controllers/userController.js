const User = require('../models/User');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role
    });

    if (user) {
      await Notification.create({
        recipientRole: 'admin',
        title: 'New Personnel Registered',
        message: `User ${user.username} (${user.email}) registered as ${user.role}`,
        type: 'user_registered'
      });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt for:', email);
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (user) {
      const isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch ? 'Yes' : 'No');
      
      if (isMatch) {
        return res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        });
      }
    }
    
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
// @desc    Get all technicians
// @route   GET /api/users/technicians
// @access  Private
exports.getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' }).select('username email');
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};
