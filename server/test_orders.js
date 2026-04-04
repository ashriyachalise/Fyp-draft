const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Order = require('./src/models/Order');
  const count = await Order.countDocuments();
  console.log("Total orders:", count);
  const orders = await Order.find().lean();
  console.log(JSON.stringify(orders, null, 2));
  process.exit(0);
}).catch(console.error);
