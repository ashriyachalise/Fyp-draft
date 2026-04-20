const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('./src/models/User');
const Machine = require('./src/models/Machine');
const Part = require('./src/models/Part');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('--- USERS ---');
    const users = await User.find({});
    users.forEach(u => console.log(`${u.username} (${u.email}) - Role: ${u.role}`));

    console.log('\n--- MACHINES ---');
    const machines = await Machine.find({});
    machines.forEach(m => console.log(`${m.name} (${m.model}): ${m._id} - Status: ${m.status}`));

    console.log('\n--- PARTS ---');
    const parts = await Part.find({});
    parts.forEach(p => console.log(`${p.name} (${p.partNumber}): ${p._id}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
