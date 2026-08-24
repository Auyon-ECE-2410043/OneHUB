
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  // 1. Remove retired faculty (from Dr. Kazi Khairul Islam and below)
  const retiredNames = [
    'Dr. Kazi Khairul Islam',
    'Dr. Md . Ashraful Hoque',
    'Dr. Md. Fayzur Rahman',
    'Dr. Md. Mortuza Ali',
    'Dr. Md. Rabiul Islam',
    'Dr. Md. Ruhul Amin',
    'Dr. Md. Yeakub Hussain',
    'Dr. Mirza Golam Rabbani',
    'Dr. Muhammad Abdul Goffar Khan',
    'Prof. A.M. Rezaul Karim Talukder',
    'Dr. Forhad Zaman',
    'Md. Shah Alam',
    'Pejush Chandra Sarkar'
  ];

  await User.deleteMany({ name: { $in: retiredNames }, department: 'EEE' });
  console.log('Deleted retired faculty.');

  // 2. Fix Dr. Md. Masud Rana duplicate and set isHeadOfDept
  const ranas = await User.find({ name: 'Dr. Md. Masud Rana', department: 'EEE' });
  if (ranas.length > 1) {
    // keep first, delete rest
    const keepId = ranas[0]._id;
    await User.deleteMany({ name: 'Dr. Md. Masud Rana', department: 'EEE', _id: { $ne: keepId } });
    console.log('Deleted duplicate Head.');
  }

  await User.updateOne({ name: 'Dr. Md. Masud Rana', department: 'EEE' }, { $set: { isHeadOfDept: true } });
  console.log('Set isHeadOfDept for Head.');

  process.exit(0);
}
run();

