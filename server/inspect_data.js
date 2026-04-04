const mongoose = require('mongoose');
require('dotenv').config();
const Machine = require('./src/models/Machine');
const Part = require('./src/models/Part');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- MACHINES ---');
    const machines = await Machine.find({});
    machines.forEach(m => console.log(`${m.name} (${m.model}): ${m._id}`));

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
