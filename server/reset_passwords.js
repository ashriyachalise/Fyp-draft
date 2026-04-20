const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('./src/models/User');

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({});
    for (let user of users) {
      user.password = 'password123';
      await user.save();
      console.log(`Reset password for: ${user.email}`);
    }

    console.log('\nAll passwords reset to: password123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPasswords();
