const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const count = await User.countDocuments({ department: 'CSE' });
  
  const groups = await User.aggregate([
    { $match: { department: 'CSE' } },
    { $group: { _id: '$designation', count: { $sum: 1 } } }
  ]);
  
  console.log('Total CSE Teachers:', count);
  console.log(groups);
  process.exit(0);
}
run();
