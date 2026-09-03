
const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const head = await User.findOne({ isHeadOfDept: true, department: 'EEE' });
  console.log(head ? 'Head found: ' + head.name : 'No head found!');
  process.exit(0);
}
run();

