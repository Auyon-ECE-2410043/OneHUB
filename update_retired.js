const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  await User.updateMany(
     { department: 'CSE', name: { $in: ['Md. Asifur Rahman', 'Bayezid Islam', 'Md. Hedayetul Islam Sovon'] } },
     { $set: { designation: 'Retired Faculty' } }
  );
  console.log('Moved 3 retired faculty to Retired Faculty designation.');
  process.exit(0);
}
run();
