const mongoose = require('mongoose');
require('dotenv').config();
const Machine = require('./src/models/Machine');
const Part = require('./src/models/Part');

async function syncCompatibility() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Find the target excavator
    const excavator = await Machine.findOne({ name: /Excavator EX-300/i });
    if (!excavator) {
      console.log('Machine "Excavator EX-300" not found. Creating a sample one...');
      const newMachine = await Machine.create({
        name: 'Excavator EX-300',
        model: 'Hitachi EX300-5',
        serialNumber: 'HIT789456',
        status: 'active',
        totalWorkingHours: 1200
      });
      return await updateParts(newMachine._id);
    }
    
    await updateParts(excavator._id);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function updateParts(machineId) {
  console.log(`Linking parts to machine ID: ${machineId}`);
  
  // Find some parts and link them
  const partsToLink = ['Hydraulic Filter', 'Bucket Tooth', 'Engine Oil', 'Track Bolt'];
  
  for (const partName of partsToLink) {
    const part = await Part.findOne({ name: new RegExp(partName, 'i') });
    if (part) {
      if (!part.machinesCompatibleWith.includes(machineId)) {
        part.machinesCompatibleWith.push(machineId);
        await part.save();
        console.log(`Linked ${partName} to Excavator!`);
      } else {
        console.log(`${partName} was already linked.`);
      }
    } else {
      // Create a mock part if not exists
      await Part.create({
        name: partName,
        partNumber: `PK-${Math.floor(Math.random()*10000)}`,
        price: 4500,
        quantityInStock: 25,
        minimumStockLevel: 5,
        machinesCompatibleWith: [machineId],
        category: 'Maintenance'
      });
      console.log(`Created and linked new part: ${partName}`);
    }
  }
}

syncCompatibility();
