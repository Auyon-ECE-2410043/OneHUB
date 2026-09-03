require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Notification = require('./models/Notification');
  const docs = await Notification.find({
    createdAt: { 
      $gte: new Date('2026-08-30T05:25:00Z'), 
      $lte: new Date('2026-08-30T05:45:00Z') 
    }
  });
  console.log('Count:', docs.length);
  process.exit(0);
}
run();
