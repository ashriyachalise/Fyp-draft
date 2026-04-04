const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Machine = require('./models/Machine');
const Part = require('./models/Part');

dotenv.config({ path: '../.env' });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Machine.deleteMany({});
    await Part.deleteMany({});

    // Create Admin User
    const admin = await User.create({
      username: 'admin',
      email: 'admin@heavymach.com',
      password: 'password123',
      role: 'admin'
    });
    console.log('Admin user created');

    // Create Sample Machine
    const machine = await Machine.create({
      name: 'Excavator EX-300',
      model: 'Hitachi EX300-5',
      serialNumber: 'HIT789456',
      location: 'Site A',
      purchaseDate: new Date('2022-01-15')
    });
    console.log('Sample machine created');

    // Create Sample Parts
    await Part.create([
      {
        name: 'Hydraulic Filter',
        partNumber: 'HF-101',
        description: 'Main hydraulic system filter',
        category: 'Filters',
        price: 45.99,
        quantityInStock: 12,
        minimumStockLevel: 5
      },
      {
        name: 'Track Bolt',
        partNumber: 'TB-202',
        description: 'High-strength track bolt',
        category: 'Fasteners',
        price: 2.50,
        quantityInStock: 4,
        minimumStockLevel: 10
      }
    ]);
    console.log('Sample parts created');

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
