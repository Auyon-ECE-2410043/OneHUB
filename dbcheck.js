
const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  console.log('ECE:', await User.countDocuments({ department: 'ECE', role: 'faculty' }));
  console.log('EEE:', await User.countDocuments({ department: 'EEE', role: 'faculty' }));
  console.log('EEE Null:', await User.countDocuments({ department: 'EEE', role: 'faculty', designation: null }));
  process.exit(0);
}
run();

