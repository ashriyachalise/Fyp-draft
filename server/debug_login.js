const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('./src/models/User');

async function debugLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'admin@heavymach.com';
    const plainPassword = 'password123';
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found in DB');
      process.exit(1);
    }
    
    console.log('User found:', user.email);
    console.log('Hashed Password in DB:', user.password);
    
    const isMatch = await user.comparePassword(plainPassword);
    console.log('Plain Password:', plainPassword);
    console.log('Does it match?', isMatch);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugLogin();
