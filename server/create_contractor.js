const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config({ path: './server/.env' });

const createContractor = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    // Check if contractor already exists
    const existing = await User.findOne({ email: 'contractor@heavymach.com' });
    if (existing) {
      console.log('Contractor user already exists.');
      process.exit();
    }

    // Create Contractor User
    const contractor = await User.create({
      username: 'contractor',
      email: 'contractor@heavymach.com',
      password: 'password123',
      role: 'contractor'
    });

    console.log('Contractor user created successfully!');
    console.log('Email: contractor@heavymach.com');
    console.log('Password: password123');
    
    process.exit();
  } catch (error) {
    console.error('Error creating contractor:', error);
    process.exit(1);
  }
};

createContractor();
