
const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  console.log('Prof:', await User.countDocuments({ department: 'EEE', role: 'faculty', designation: 'Professor' }));
  console.log('Assoc:', await User.countDocuments({ department: 'EEE', role: 'faculty', designation: 'Associate Professor' }));
  console.log('Asst:', await User.countDocuments({ department: 'EEE', role: 'faculty', designation: 'Assistant Professor' }));
  console.log('Lec:', await User.countDocuments({ department: 'EEE', role: 'faculty', designation: 'Lecturer' }));
  process.exit(0);
}
run();

