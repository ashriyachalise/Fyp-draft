const mongoose = require('mongoose');
const Part = require('./server/src/models/Part');
require('dotenv').config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const parts = await Part.find({ quantityInStock: { $lt: 0 } });
  for (let p of parts) {
    await Part.findByIdAndUpdate(p._id, { quantityInStock: 0 });
    console.log('Fixed part:', p.name);
  }
  
  const negativePriceParts = await Part.find({ price: { $lt: 0 } });
  for (let p of negativePriceParts) {
    await Part.findByIdAndUpdate(p._id, { price: 0 });
    console.log('Fixed negative price part:', p.name);
  }

  const negativeMinStockParts = await Part.find({ minimumStockLevel: { $lt: 0 } });
  for (let p of negativeMinStockParts) {
    await Part.findByIdAndUpdate(p._id, { minimumStockLevel: 0 });
    console.log('Fixed negative min stock part:', p.name);
  }

  console.log('Done fixing negative stocks');
  process.exit(0);
}).catch(console.error);
