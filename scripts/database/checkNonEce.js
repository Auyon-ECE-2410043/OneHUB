const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../../models/Course');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const nonEce = await Course.find({ department: { $ne: 'ECE' } });
  console.log('Non-ECE courses count:', nonEce.length);
  if (nonEce.length > 0) {
    console.log(nonEce.map(c => `${c.courseCode} (${c.department})`).join(', '));
  }
  const total = await Course.countDocuments();
  console.log('Total courses in DB:', total);
  process.exit(0);
}
check();
