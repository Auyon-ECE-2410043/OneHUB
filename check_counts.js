const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const groups = await User.aggregate([
    { $match: { department: 'CSE' } },
    { $group: { _id: "$designation", count: { $sum: 1 } } }
  ]);
  console.log('CSE:', groups);
  process.exit(0);
}
run();
